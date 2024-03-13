import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { FilterExpressionNode } from "../nodes/filterExpressionNode";
import { ComparisonOperator } from "../nodes/operationNode";
import { QueryNode } from "../nodes/queryNode";
import {
  PickAllKeys,
  PickNonKeys,
  SelectAttributes,
  StripKeys,
} from "../typeHelpers";

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

  andNestedFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orNestedFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  limit(value: number): QueryQueryBuilderInterface<DDB, Table, O>;

  scanIndexForward(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;

  consistentRead(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;

  attributes<A extends ReadonlyArray<keyof DDB[Table]> & string[]>(
    attributes: A
  ): QueryQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;

  _getNode(): QueryNode;
}

/**
 * When we use a nested builder, this type is used to remove
 * all the extra functions of the builder for DX improvement.
 */
export interface QueryQueryBuilderInterfaceWithOnlyFilterOperations<
  DDB,
  Table extends keyof DDB,
  O
> {
  filterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  orFilterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  andNestedFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  orNestedFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;
}

/**
 * @todo support IndexName
 * @todo support ExclusiveStartKey
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
    value: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: {
          ...this.#props.node.filterExpression,
          expressions: this.#props.node.filterExpression.expressions.concat({
            kind: "OperationNode",
            joinType: "AND",
            key,
            operation,
            value,
          }),
        },
      },
    });
  }

  orFilterExpression<Key extends keyof PickNonKeys<DDB[Table]> & string>(
    key: Key,
    operation: ComparisonOperator,
    value: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: {
          ...this.#props.node.filterExpression,
          expressions: this.#props.node.filterExpression.expressions.concat({
            kind: "OperationNode",
            joinType: "OR",
            key,
            operation,
            value,
          }),
        },
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

  _getNode() {
    return this.#props.node;
  }

  andNestedFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterface<DDB, Table, O>
    ) => QueryQueryBuilderInterface<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    const qb = new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: {
          expressions: [],
          kind: "FilterExpressionNode",
          joinType: "AND",
        },
      },
    });

    const result = builder(qb);

    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: {
          ...this.#props.node.filterExpression,
          expressions: this.#props.node.filterExpression.expressions.concat(
            result._getNode().filterExpression
          ),
        },
      },
    });
  }

  orNestedFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterface<DDB, Table, O>
    ) => QueryQueryBuilderInterface<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    const qb = new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: {
          expressions: [],
          kind: "FilterExpressionNode",
          joinType: "OR",
        },
      },
    });

    const result = builder(qb);

    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: {
          ...this.#props.node.filterExpression,
          expressions: this.#props.node.filterExpression.expressions.concat(
            result._getNode().filterExpression
          ),
        },
      },
    });
  }

  scanIndexForward(
    enabled: boolean
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        scanIndexForward: {
          kind: "ScanIndexForwardNode",
          enabled,
        },
      },
    });
  }

  consistentRead(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        consistentRead: {
          kind: "ConsistentReadNode",
          enabled,
        },
      },
    });
  }

  attributes<A extends readonly (keyof DDB[Table])[] & string[]>(
    attributes: A
  ): QueryQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        attributes: {
          kind: "AttributesNode",
          attributes,
        },
      },
    });
  }

  compileFilterExpression = (
    expression: FilterExpressionNode,
    filterExpressionAttributeValues: Map<string, unknown>
  ) => {
    let res = "";
    const offset = filterExpressionAttributeValues.size;

    expression.expressions.forEach((expr, i) => {
      if (i !== 0) {
        res += ` ${expr.joinType} `;
      }

      if (expr.kind === "OperationNode") {
        const attributeValue = `:filterExpressionValue${i + offset}`;
        res += `${expr.key} ${expr.operation} ${attributeValue}`;
        filterExpressionAttributeValues.set(attributeValue, expr.value);
      } else {
        res += "(";
        res += this.compileFilterExpression(
          expr,
          filterExpressionAttributeValues
        );
        res += ")";
      }
    });

    return res;
  };

  compileKeyConditionExpression = (
    keyConditionAttributeValues: Map<string, unknown>
  ) => {
    let res = "";
    this.#props.node.keyConditions.forEach((keyCondition, i) => {
      if (i !== 0) {
        res += " AND ";
      }

      const attributeValue = `:keyConditionValue${i}`;
      res += `${keyCondition.key} ${keyCondition.operation} ${attributeValue}`;
      keyConditionAttributeValues.set(attributeValue, keyCondition.value);
    });
    return res;
  };

  execute = async (): Promise<StripKeys<O>[] | undefined> => {
    const keyConditionAttributeValues = new Map();
    const filterExpressionAttributeValues = new Map();

    const compiledKeyConditionExpression = this.compileKeyConditionExpression(
      keyConditionAttributeValues
    );

    const compiledFilterExpression = this.compileFilterExpression(
      this.#props.node.filterExpression,
      filterExpressionAttributeValues
    );

    const command = new QueryCommand({
      TableName: this.#props.node.table.table,
      KeyConditionExpression: compiledKeyConditionExpression,
      FilterExpression: compiledFilterExpression
        ? compiledFilterExpression
        : undefined,
      Limit: this.#props.node.limit?.limit,
      ExpressionAttributeValues: {
        ...Object.fromEntries(keyConditionAttributeValues),
        ...Object.fromEntries(filterExpressionAttributeValues),
      },
      ScanIndexForward: this.#props.node.scanIndexForward?.enabled,
      ConsistentRead: this.#props.node.consistentRead?.enabled,
    });

    const result = await this.#props.ddbClient.send(command);

    return (result.Items as StripKeys<O>[]) ?? undefined;
  };
}

interface GetQueryBuilderProps {
  readonly node: QueryNode;
  readonly ddbClient: DynamoDBDocumentClient;
}
