import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { FilterExpressionNode } from "../nodes/filterExpressionNode";
import {
  BetweenExpression,
  FilterConditionComparators,
  FunctionExpression,
  KeyConditionComparators,
  NotExpression,
} from "../nodes/operationNode";
import { QueryNode } from "../nodes/queryNode";
import {
  GetFromPath,
  ObjectKeyPaths,
  PickAllKeys,
  PickNonKeys,
  PickSk,
  SelectAttributes,
  StripKeys,
} from "../typeHelpers";
import { FilterExpressionNotExpression } from "../nodes/filterExpressionNotExpression";
import { FilterExpressionJoinTypeNode } from "../nodes/filterExpressionJoinTypeNode";

export interface QueryQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
  execute(): Promise<StripKeys<O>[] | undefined>;

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

  /**
   * filterExpression methods
   *
   * @todo Currently NOT FilterExpression returns operations as suggestions as well.
   */
  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Exclude<Key, "NOT">,
    operation: Key extends NotExpression ? never : FilterConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression(
    not: NotExpression,
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  filterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  /**
   * orFilterExpression methods
   */
  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operation: FilterConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression(
    not: NotExpression,
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterface<DDB, Table, O>;

  orFilterExpression(
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
  /**
   * filterExpression methods
   */
  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operation: FilterConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  filterExpression(
    not: NotExpression,
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  filterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  /**
   * orFilterExpression methods
   */
  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operation: FilterConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  orFilterExpression(
    not: NotExpression,
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  orFilterExpression(
    builder: (
      qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
    ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
  ): QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>;

  _getNode(): QueryNode;
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

  // TODO: Add support for all operations from here: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.KeyConditionExpressions.html
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

  // TODO: Add support for all operations from here: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax
  filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args:
      | [
          key: Key,
          operation: FilterConditionComparators,
          value: StripKeys<GetFromPath<DDB[Table], Key>>
        ]
      | [
          key: Key,
          expr: BetweenExpression,
          left: StripKeys<GetFromPath<DDB[Table], Key>>,
          right: StripKeys<GetFromPath<DDB[Table], Key>>
        ]
      | [
          not: NotExpression,
          builder: (
            qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<
              DDB,
              Table,
              O
            >
          ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
        ]
      | [
          builder: (
            qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<
              DDB,
              Table,
              O
            >
          ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
        ]
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    if (args[1] === "BETWEEN") {
      const [key, expr, left, right] = args;

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            ...this.#props.node.filterExpression,
            expressions: this.#props.node.filterExpression.expressions.concat({
              kind: "FilterExpressionJoinTypeNode",
              expr: {
                kind: "BetweenConditionExpression",
                key,
                left,
                right,
              },
              joinType: "AND",
            }),
          },
        },
      });
    } else if (
      typeof args[0] !== "function" &&
      args[0] !== "NOT" &&
      typeof args[1] !== "function" &&
      args[1] !== undefined &&
      args[2] !== undefined
    ) {
      const [key, operation, value] = args;

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            ...this.#props.node.filterExpression,
            expressions: this.#props.node.filterExpression.expressions.concat({
              kind: "FilterExpressionJoinTypeNode",
              joinType: "AND",
              expr: {
                kind: "FilterExpressionComparatorExpressions",
                key,
                operation,
                value,
              },
            }),
          },
        },
      });
    } else if (typeof args[0] === "function" || typeof args[1] === "function") {
      let builder;

      if (typeof args[0] === "function") {
        builder = args[0];
      } else if (typeof args[1] === "function") {
        builder = args[1];
      }

      if (!builder) throw new Error("Could not find builder");

      const qb = new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            expressions: [],
            kind: "FilterExpressionNode",
          },
        },
      });

      const result = builder(qb);

      const { filterExpression } = result._getNode();

      let resultNode: FilterExpressionJoinTypeNode = {
        kind: "FilterExpressionJoinTypeNode",
        expr: filterExpression,
        joinType: "AND",
      };

      if (args[0] === "NOT") {
        resultNode = {
          ...resultNode,
          expr: {
            kind: "FilterExpressionNotExpression",
            expr: filterExpression,
          },
        };
      }

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            ...this.#props.node.filterExpression,
            expressions:
              this.#props.node.filterExpression.expressions.concat(resultNode),
          },
        },
      });
    }

    throw new Error("Invalid arguments given to filterExpression");
  }

  orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args:
      | [
          key: Key,
          operation: FilterConditionComparators,
          value: StripKeys<GetFromPath<DDB[Table], Key>>
        ]
      | [
          key: Key,
          expr: BetweenExpression,
          left: StripKeys<GetFromPath<DDB[Table], Key>>,
          right: StripKeys<GetFromPath<DDB[Table], Key>>
        ]
      | [
          not: NotExpression,
          builder: (
            qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<
              DDB,
              Table,
              O
            >
          ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
        ]
      | [
          builder: (
            qb: QueryQueryBuilderInterfaceWithOnlyFilterOperations<
              DDB,
              Table,
              O
            >
          ) => QueryQueryBuilderInterfaceWithOnlyFilterOperations<DDB, Table, O>
        ]
  ): QueryQueryBuilderInterface<DDB, Table, O> {
    if (args[1] === "BETWEEN") {
      const [key, expr, left, right] = args;

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            ...this.#props.node.filterExpression,
            expressions: this.#props.node.filterExpression.expressions.concat({
              kind: "FilterExpressionJoinTypeNode",
              expr: {
                kind: "BetweenConditionExpression",
                key,
                left,
                right,
              },
              joinType: "OR",
            }),
          },
        },
      });
    } else if (
      typeof args[0] !== "function" &&
      args[0] !== "NOT" &&
      typeof args[1] !== "function" &&
      args[1] !== undefined &&
      args[2] !== undefined
    ) {
      const [key, operation, value] = args;

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            ...this.#props.node.filterExpression,
            expressions: this.#props.node.filterExpression.expressions.concat({
              kind: "FilterExpressionJoinTypeNode",
              expr: {
                kind: "FilterExpressionComparatorExpressions",
                key,
                operation,
                value,
              },
              joinType: "OR",
            }),
          },
        },
      });
    } else if (typeof args[0] === "function" || typeof args[1] === "function") {
      let builder;

      if (typeof args[0] === "function") {
        builder = args[0];
      } else if (typeof args[1] === "function") {
        builder = args[1];
      }

      if (!builder) throw new Error("Could not find builder");

      const qb = new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            expressions: [],
            kind: "FilterExpressionNode",
          },
        },
      });

      const result = builder(qb);
      const { filterExpression } = result._getNode();

      let resultNode: FilterExpressionJoinTypeNode = {
        kind: "FilterExpressionJoinTypeNode",
        expr: filterExpression,
        joinType: "OR",
      };

      if (args[0] === "NOT") {
        resultNode = {
          ...resultNode,
          expr: {
            kind: "FilterExpressionNotExpression",
            expr: filterExpression,
          },
        };
      }

      return new QueryQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          filterExpression: {
            ...this.#props.node.filterExpression,
            expressions:
              this.#props.node.filterExpression.expressions.concat(resultNode),
          },
        },
      });
    }

    throw new Error("Invalid arguments given to filterExpression");
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

    expression.expressions.forEach((joinNode, i) => {
      if (i !== 0) {
        res += ` ${joinNode.joinType} `;
      }

      res += this.compileFilterExpressionJoinNodes(
        joinNode,
        filterExpressionAttributeValues
      );
    });

    return res;
  };

  compileFilterExpressionJoinNodes = (
    { expr }: FilterExpressionJoinTypeNode,
    filterExpressionAttributeValues: Map<string, unknown>
  ) => {
    let res = "";
    const offset = filterExpressionAttributeValues.size;
    const attributeValue = `:filterExpressionValue${offset}`;

    switch (expr.kind) {
      case "FilterExpressionNode": {
        res += "(";
        res += this.compileFilterExpression(
          expr,
          filterExpressionAttributeValues
        );
        res += ")";
        break;
      }

      case "FilterExpressionComparatorExpressions": {
        // TODO: Instead of expr.key, use AttributeNames here to avoid
        // problems with using reserved words.
        res += `${expr.key} ${expr.operation} ${attributeValue}`;
        filterExpressionAttributeValues.set(attributeValue, expr.value);
        break;
      }

      case "FilterExpressionNotExpression": {
        res += "NOT (";
        res += this.compileFilterExpression(
          expr.expr,
          filterExpressionAttributeValues
        );
        res += ")";
        break;
      }

      case "BetweenConditionExpression": {
        res += `${expr.key} BETWEEN ${attributeValue}left AND ${attributeValue}right`;
        filterExpressionAttributeValues.set(`${attributeValue}left`, expr.left);
        filterExpressionAttributeValues.set(
          `${attributeValue}right`,
          expr.right
        );
        break;
      }
    }

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
      if (keyCondition.operation.kind === "KeyConditionComparatorExpression") {
        // TODO: Instead of expr.key, use AttributeNames here to avoid
        // problems with using reserved words.
        res += `${keyCondition.operation.key} ${keyCondition.operation.operation} ${attributeValue}`;
        keyConditionAttributeValues.set(
          attributeValue,
          keyCondition.operation.value
        );
      } else if (keyCondition.operation.kind === "BetweenConditionExpression") {
        res += `${keyCondition.operation.key} BETWEEN ${attributeValue}left AND ${attributeValue}right`;
        keyConditionAttributeValues.set(
          `${attributeValue}left`,
          keyCondition.operation.left
        );
        keyConditionAttributeValues.set(
          `${attributeValue}right`,
          keyCondition.operation.right
        );
      } else if (
        keyCondition.operation.kind === "BeginsWithFunctionExpression"
      ) {
        res += `begins_with(${keyCondition.operation.key}, ${attributeValue})`;
        keyConditionAttributeValues.set(
          attributeValue,
          keyCondition.operation.substr
        );
      }
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
