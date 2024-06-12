import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  BetweenExpression,
  FunctionExpression,
  KeyConditionComparators,
} from "../nodes/operands";
import { QueryNode } from "../nodes/queryNode";
import { QueryCompiler } from "../queryCompiler";
import {
  ExecuteOutput,
  ObjectFullPaths,
  ObjectKeyPaths,
  PickAllKeys,
  PickNonKeys,
  PickSk,
  SelectAttributes,
  StripKeys,
} from "../typeHelpers";
import { preventAwait } from "../util/preventAwait";
import {
  AttributeBeginsWithExprArg,
  AttributeBetweenExprArg,
  AttributeContainsExprArg,
  AttributeFuncExprArg,
  BuilderExprArg,
  ComparatorExprArg,
  ExprArgs,
  ExpressionBuilder,
  NotExprArg,
} from "./expressionBuilder";

export interface QueryQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
  /**
   * Conditions that DynamoDB applies after the Query operation, but before the data is returned to you.
   *
   * Items that do not satisfy the FilterExpression criteria are not returned.
   *
   * A FilterExpression does not allow key attributes. You cannot define a filter expression based on a partition key or a sort key.
   *
   * A FilterExpression is applied after the items have already been read; the process of filtering does not change consumed read capacity units.
   *
   * Multiple FilterExpressions are added as `AND` statements. see {@link orFilterExpression} for `OR` statements.
   *
   * Example
   * ```ts
   * await tsynamoClient
   *  .query("myTable")
   *  .keyCondition("userId", "=", "123")
   *  .filterExpression("someBoolean", "=", true)
   *  .execute();
   * ```
   */
  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeFuncExprArg<Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: NotExprArg<DDB, Table, Key, false>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: BuilderExprArg<DDB, Table, Key, false>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  /**
   * A {@link filterExpression} that is concatenated as an OR statement.
   *
   * Conditions that DynamoDB applies after the Query operation, but before the data is returned to you.
   *
   * Items that do not satisfy the FilterExpression criteria are not returned.
   *
   * A FilterExpression does not allow key attributes. You cannot define a filter expression based on a partition key or a sort key.
   *
   * A FilterExpression is applied after the items have already been read; the process of filtering does not change consumed read capacity units.
   *
   * Example
   * ```ts
   * await tsynamoClient
   *  .query("myTable")
   *  .keyCondition("userId", "=", "123")
   *  .filterExpression("someBoolean", "=", true)
   *  .orFilterExpression("somethingElse", "BETWEEN", 9, 10)
   *  .execute();
   * ```
   */
  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeFuncExprArg<Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  /**
   * The condition that specifies the key values for items to be retrieved by the Query action.
   *
   * The condition must perform an equality test on a single partition key value.
   *
   * The condition can optionally perform one of several comparison tests on a single sort key value. This allows Query to retrieve one item with a given partition key value and sort key value, or several items that have the same partition key value but different sort key values.
   *
   * The partition key equality test is required.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .query("myTable")
   *   .keyCondition("userId", "=", "123")
   *   .keyCondition("dataTimestamp", "BETWEEN", 150, 500)
   *   .execute();
   * ```
   */
  keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(
    key: Key,
    expr: Key extends keyof PickSk<DDB[Table]>
      ? Extract<FunctionExpression, "begins_with">
      : never,
    substr: string
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<DDB[Table][Key]>,
    right: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(
    key: Key,
    operation: KeyConditionComparators,
    val: StripKeys<DDB[Table][Key]>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  /**
   * The maximum number of items to evaluate (not necessarily the number of matching items).
   * If DynamoDB processes the number of items up to the limit while processing the results, it stops the operation and returns the matching values up to that point.
   */
  limit(value: number): QueryQueryBuilderInterface<DDB, Table, O>;

  /**
   *
   * Specifies the order for index traversal: If true (default), the traversal is performed in ascending order; if false, the traversal is performed in descending order.
   */
  scanIndexForward(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;
  /**
   * Determines the read consistency model: If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   *
   * set this to true, if you must have up-to-date data.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *  .query("myTable")
   *  .keyCondition("userId", "=", "123")
   *  .consistentRead(true)
   *  .execute()
   * ```
   */
  consistentRead(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;

  /**
   * List of attributes to get from the table.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *  .query("myTable")
   *  .keyCondition("userId", "=", "123")
   *  .attributes(["someBoolean", "nested.nestedBoolean", "cats[1].age"])
   *  .execute()
   * ```
   */
  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): QueryQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;
  /**
   * Compiles into an DynamoDB DocumentClient Command.
   */
  compile(): QueryCommand;
  /**
   * Executes the command and returns its output.
   */
  execute(): Promise<ExecuteOutput<O>[] | undefined>;
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
    ...args:
      | [
          key: Key,
          expr: Extract<FunctionExpression, "begins_with">,
          substr: string
        ]
      | [
          key: Key,
          operation: KeyConditionComparators,
          val: StripKeys<DDB[Table][Key]>
        ]
      | [
          key: Key,
          expr: BetweenExpression,
          left: StripKeys<DDB[Table][Key]>,
          right: StripKeys<DDB[Table][Key]>
        ]
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    if (args[1] === "begins_with") {
      const [key, expr, substr] = args;

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          keyConditions: this.#props.node.keyConditions.concat({
            kind: "KeyConditionNode",
            operation: {
              kind: "BeginsWithFunctionExpression",
              key,
              substr,
            },
          }),
        },
      });
    } else if (args[1] === "BETWEEN") {
      const [key, expr, left, right] = args;

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          keyConditions: this.#props.node.keyConditions.concat({
            kind: "KeyConditionNode",
            operation: {
              kind: "BetweenConditionExpression",
              key,
              left,
              right,
            },
          }),
        },
      });
    } else {
      const [key, operation, value] = args;
      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          keyConditions: this.#props.node.keyConditions.concat({
            kind: "KeyConditionNode",
            operation: {
              kind: "KeyConditionComparatorExpression",
              operation,
              key,
              value,
            },
          }),
        },
      });
    }
  }

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: ExprArgs<DDB, Table, O, Key, false>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.filterExpression },
    });

    const expressionNode = eB.expression(...args)._getNode();

    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: expressionNode,
      },
    });
  }

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args: ExprArgs<DDB, Table, O, Key, false>
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.filterExpression },
    });

    const expressionNode = eB.orExpression(...args)._getNode();

    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        filterExpression: expressionNode,
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

  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): QueryQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>> {
    return new QueryQueryBuilder({
      ...this.#props,
      node: {
        ...this.#props.node,
        attributes: {
          kind: "AttributesNode",
          attributes,
        },
      },
    }) as any;
  }

  compile = (): QueryCommand => {
    return this.#props.queryCompiler.compile(this.#props.node);
  };

  execute = async (): Promise<ExecuteOutput<O>[] | undefined> => {
    const command = this.compile();
    const result = await this.#props.ddbClient.send(command);
    return (result.Items as ExecuteOutput<O>[]) ?? undefined;
  };
}

preventAwait(
  QueryQueryBuilder,
  "Don't await QueryQueryBuilder instances directly. To execute the query you need to call the `execute` method"
);

interface GetQueryBuilderProps {
  readonly node: QueryNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
