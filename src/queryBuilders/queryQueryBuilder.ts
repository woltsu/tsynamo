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
  // filterExpression
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

  // orFilterExpression
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
   * keyCondition methods
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

  limit(value: number): QueryQueryBuilderInterface<DDB, Table, O>;

  index(index: string): QueryQueryBuilderInterface<DDB, Table, O>;

  scanIndexForward(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;

  consistentRead(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;

  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): QueryQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;

  compile(): QueryCommand;
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

  index(index: string): QueryQueryBuilderInterface<DDB, Table, O> {
    return new QueryQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        index: {
          kind: "IndexNode",
          index,
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
