import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ComparisonOperator } from "../nodes/operationNode";
import { QueryNode } from "../nodes/queryNode";
import { PickAllKeys, PickNonKeys, StripKeys } from "../typeHelpers";

export interface QueryQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
  execute(): Promise<StripKeys<O>[] | undefined>;

  keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  limit(value: number): QueryQueryBuilderInterface<DDB, Table, O>;
}

/**
 * @todo support IndexName
 * @todo support parentheses for FilterExpression
 * @todo support ExclusiveStartKey
 * @todo support ConsistentRead
 * @todo support AttributesToGet
 * @todo support ScanIndexForward
 */
export class QueryQueryBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements QueryQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: GetQueryBuilderProps;

  constructor(props: GetQueryBuilderProps) {
    this.#props = props;
  }

  keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        keyConditions: this.#props.node.keyConditions.concat({
          kind: "KeyConditionNode",
          key,
          operation,
          value: val,
        }),
      },
    });
  }

  filterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpressions: this.#props.node.filterExpressions.concat({
          kind: "FilterExpressionNode",
          key,
          operation,
          value: val,
          joinType: "AND",
        }),
      },
    });
  }

  orFilterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpressions: this.#props.node.filterExpressions.concat({
          kind: "FilterExpressionNode",
          key,
          operation,
          value: val,
          joinType: "OR",
        }),
      },
    });
  }

  limit(value: number): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        limit: {
          kind: "LimitNode",
          limit: value,
        },
      },
    });
  }

  execute = async (): Promise<StripKeys<O>[] | undefined> => {
    const keyConditions = this.#props.node.keyConditions;
    const filterExpressions = this.#props.node.filterExpressions;
    const compiledKeyConditions: string[] = [];
    const compiledFilterExpressions: string[] = [];
    const ExpressionAttributeValues: Record<string, unknown> = {};

    keyConditions.forEach((keyCondition, i) => {
      compiledKeyConditions.push(
        `${keyCondition.key} ${keyCondition.operation} :keyConditionValue${i}`
      );

      ExpressionAttributeValues[`keyConditionValue${i}`] = keyCondition.value;
    });

    filterExpressions.forEach((filterExpression, i) => {
      compiledFilterExpressions.push(
        `${i !== 0 ? filterExpression.joinType + " " : ""}${
          filterExpression.key
        } ${filterExpression.operation} :filterExpressionValue${i}`
      );

      ExpressionAttributeValues[`filterExpressionValue${i}`] =
        filterExpression.value;
    });

    const command = new QueryCommand({
      TableName: this.#props.node.table.table,
      KeyConditionExpression: compiledKeyConditions.join(" AND "),
      // TODO: How to handle parentheses?
      FilterExpression: compiledFilterExpressions.join(" "),
      Limit: this.#props.node.limit?.limit,
      ExpressionAttributeValues,
    });

    const result = await this.#props.ddbClient.send(command);

    return (result.Items as StripKeys<O>[]) ?? undefined;
  };
}

interface GetQueryBuilderProps {
  readonly node: QueryNode;
  readonly ddbClient: DynamoDBDocumentClient;
}
