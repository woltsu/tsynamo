import { AttributeExistsFunctionExpression } from "../nodes/attributeExistsFunctionExpression";
import { AttributeNotExistsFunctionExpression } from "../nodes/attributeNotExistsFunctionExpression";
import {
  ExpressionJoinTypeNode,
  JoinType,
} from "../nodes/expressionJoinTypeNode";
import { ExpressionNode } from "../nodes/expressionNode";
import {
  BetweenExpression,
  ExpressionConditionComparators,
  FunctionExpression,
  NotExpression,
} from "../nodes/operands";
import {
  GetFromPath,
  ObjectKeyPaths,
  PickNonKeys,
  StripKeys,
} from "../typeHelpers";

export interface ExpressionBuilderInterface<
  DDB,
  Table extends keyof DDB,
  O,
  AllowKeys = false
> {
  /**
   *
   * Expression builder for {@link conditionExpression} or {@link orConditionExpression}.
   *
   * Example
   *
   * ```ts
   * tsynamoClient
   *   .deleteItem("myTable")
   *   .keys({
   *      userId: "1",
   *      dataTimestamp: 2,
   *    })
   *   .conditionExpression("NOT", (qb) => {
   *      return qb.expression("tags", "contains", "meow");
   *    })
   *   .execute()
   * ```
   */
  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeFuncExprArg<Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeBeginsWithExprArg<Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: NotExprArg<DDB, Table, Key, AllowKeys>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: BuilderExprArg<DDB, Table, Key, AllowKeys>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  // orExpression
  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeFuncExprArg<Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeBeginsWithExprArg<Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: NotExprArg<DDB, Table, Key, AllowKeys>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    ...args: BuilderExprArg<DDB, Table, Key, AllowKeys>
  ): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;

  _getNode(): ExpressionNode;
}

export type ComparatorExprArg<DDB, Table extends keyof DDB, Key> = [
  key: Key,
  operation: ExpressionConditionComparators,
  value: StripKeys<GetFromPath<DDB[Table], Key>>
];

export type AttributeFuncExprArg<Key> = [
  key: Key,
  func: Extract<FunctionExpression, "attribute_exists" | "attribute_not_exists">
];

export type AttributeBeginsWithExprArg<Key> = [
  key: Key,
  func: Extract<FunctionExpression, "begins_with">,
  substr: string
];

export type AttributeContainsExprArg<DDB, Table extends keyof DDB, Key> = [
  key: Key,
  expr: Extract<FunctionExpression, "contains">,
  value: GetFromPath<DDB[Table], Key> extends unknown[]
    ? StripKeys<GetFromPath<DDB[Table], Key>>[number]
    : never
];

export type AttributeBetweenExprArg<DDB, Table extends keyof DDB, Key> = [
  key: Key,
  expr: BetweenExpression,
  left: StripKeys<GetFromPath<DDB[Table], Key>>,
  right: StripKeys<GetFromPath<DDB[Table], Key>>
];

export type NotExprArg<
  DDB,
  Table extends keyof DDB,
  O,
  AllowKeysInExpression = true
> = [
  not: NotExpression,
  builder: (
    qb: ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>
  ) => ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>
];

export type BuilderExprArg<
  DDB,
  Table extends keyof DDB,
  O,
  AllowKeysInExpression = true
> = [
  builder: (
    qb: ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>
  ) => ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>
];

export type ExprArgs<
  DDB,
  Table extends keyof DDB,
  O,
  Key,
  AllowKeysInExpression = true
> =
  | ComparatorExprArg<DDB, Table, Key>
  | AttributeFuncExprArg<Key>
  | AttributeBeginsWithExprArg<Key>
  | AttributeContainsExprArg<DDB, Table, Key>
  | AttributeBetweenExprArg<DDB, Table, Key>
  | BuilderExprArg<DDB, Table, O, AllowKeysInExpression>
  | NotExprArg<DDB, Table, O, AllowKeysInExpression>;
export class ExpressionBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements ExpressionBuilderInterface<DDB, Table, O>
{
  readonly #props: ExpressionBuilderProps;

  constructor(props: ExpressionBuilderProps) {
    this.#props = props;
  }

  _expression<Key extends ObjectKeyPaths<DDB[Table]>>(
    joinType: JoinType,
    ...args: ExprArgs<DDB, Table, O, Key>
  ): ExpressionBuilderInterface<DDB, Table, O> {
    if (args[1] === "begins_with") {
      const [key, f, substr] = args;

      return new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          expressions: this.#props.node.expressions.concat({
            kind: "ExpressionJoinTypeNode",
            expr: {
              kind: "BeginsWithFunctionExpression",
              key,
              substr,
            },
            joinType,
          }),
        },
      });
    } else if (args[1] === "contains") {
      const [key, expr, value] = args;

      return new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          expressions: this.#props.node.expressions.concat({
            kind: "ExpressionJoinTypeNode",
            expr: {
              kind: "ContainsFunctionExpression",
              key,
              value,
            },
            joinType,
          }),
        },
      });
    } else if (
      args[1] === "attribute_exists" ||
      args[1] === "attribute_not_exists"
    ) {
      const [key, func] = args;
      let resultExpr:
        | AttributeExistsFunctionExpression
        | AttributeNotExistsFunctionExpression;

      if (func === "attribute_exists") {
        resultExpr = { kind: "AttributeExistsFunctionExpression", key };
      } else {
        resultExpr = { kind: "AttributeNotExistsFunctionExpression", key };
      }

      return new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          expressions: this.#props.node.expressions.concat({
            kind: "ExpressionJoinTypeNode",
            expr: resultExpr,
            joinType,
          }),
        },
      });
    } else if (args[1] === "BETWEEN") {
      const [key, expr, left, right] = args;

      return new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          expressions: this.#props.node.expressions.concat({
            kind: "ExpressionJoinTypeNode",
            expr: {
              kind: "BetweenConditionExpression",
              key,
              left,
              right,
            },
            joinType,
          }),
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

      return new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          expressions: this.#props.node.expressions.concat({
            kind: "ExpressionJoinTypeNode",
            joinType,
            expr: {
              kind: "ExpressionComparatorExpressions",
              key,
              operation,
              value,
            },
          }),
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

      const qb = new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          expressions: [],
          kind: "ExpressionNode",
        },
      });

      const result = builder(qb);
      const expressionNode = result._getNode();

      let resultNode: ExpressionJoinTypeNode = {
        kind: "ExpressionJoinTypeNode",
        expr: expressionNode,
        joinType,
      };

      if (args[0] === "NOT") {
        resultNode = {
          ...resultNode,
          expr: {
            kind: "ExpressionNotExpression",
            expr: expressionNode,
          },
        };
      }

      return new ExpressionBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          expressions: this.#props.node.expressions.concat(resultNode),
        },
      });
    }

    throw new Error("Invalid arguments given to expression builder");
  }

  expression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): ExpressionBuilderInterface<DDB, Table, O> {
    return this._expression("AND", ...args);
  }

  orExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): ExpressionBuilderInterface<DDB, Table, O> {
    return this._expression("OR", ...args);
  }

  _getNode() {
    return this.#props.node;
  }
}

interface ExpressionBuilderProps {
  readonly node: ExpressionNode;
}
