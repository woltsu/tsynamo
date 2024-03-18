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

export interface ExpressionBuilderInterface<DDB, Table extends keyof DDB, O> {
  // Regular operand
  expression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Exclude<Key, "NOT">,
    operation: Key extends NotExpression
      ? never
      : ExpressionConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // function expression for functions that only take path as param
  expression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Exclude<Key, "NOT">,
    func: Extract<
      FunctionExpression,
      "attribute_exists" | "attribute_not_exists"
    >
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // CONTAINS function expression
  expression<
    Key extends ObjectKeyPaths<DDB[Table]>,
    Property extends GetFromPath<DDB[Table], Key> & unknown[]
  >(
    key: Key,
    expr: Extract<FunctionExpression, "contains">,
    value: StripKeys<Property>[number]
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // BEGINS_WITH function expression
  expression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    expr: Extract<FunctionExpression, "begins_with">,
    substr: string
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // BETWEEN expression
  expression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // NOT expression
  expression(
    not: NotExpression,
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // Nested expression
  expression(
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  // Or expressions
  orExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    operation: ExpressionConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  orExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Exclude<Key, "NOT">,
    func: Extract<
      FunctionExpression,
      "attribute_exists" | "attribute_not_exists"
    >
  ): ExpressionBuilderInterface<DDB, Table, O>;

  orExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    func: Extract<FunctionExpression, "begins_with">,
    substr: string
  ): ExpressionBuilderInterface<DDB, Table, O>;

  orExpression<
    Key extends ObjectKeyPaths<DDB[Table]>,
    Property extends GetFromPath<DDB[Table], Key> & unknown[]
  >(
    key: Key,
    expr: Extract<FunctionExpression, "contains">,
    value: StripKeys<Property>[number]
  ): ExpressionBuilderInterface<DDB, Table, O>;

  orExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  orExpression(
    not: NotExpression,
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  orExpression(
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
  ): ExpressionBuilderInterface<DDB, Table, O>;

  _getNode(): ExpressionNode;
}

export interface ExpressionBuilderInterfaceWithOnlyExpressionOperations<
  DDB,
  Table extends keyof DDB,
  O,
  AllowKeys = true
> {
  /**
   * expression methods
   */
  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Key,
    operation: ExpressionConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Exclude<Key, "NOT">,
    func: Extract<
      FunctionExpression,
      "attribute_exists" | "attribute_not_exists"
    >
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Key,
    func: Extract<FunctionExpression, "begins_with">,
    substr: string
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >,
    Property extends GetFromPath<DDB[Table], Key> & unknown[]
  >(
    key: Key,
    expr: Extract<FunctionExpression, "contains">,
    value: StripKeys<Property>[number]
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  expression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  expression(
    not: NotExpression,
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<
        DDB,
        Table,
        O,
        AllowKeys
      >
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<
      DDB,
      Table,
      O,
      AllowKeys
    >
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  expression(
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<
        DDB,
        Table,
        O,
        AllowKeys
      >
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<
      DDB,
      Table,
      O,
      AllowKeys
    >
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  /**
   * orExpression methods
   */
  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Key,
    operation: ExpressionConditionComparators,
    val: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Exclude<Key, "NOT">,
    func: Extract<
      FunctionExpression,
      "attribute_exists" | "attribute_not_exists"
    >
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Key,
    func: Extract<FunctionExpression, "begins_with">,
    substr: string
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >,
    Property extends GetFromPath<DDB[Table], Key> & unknown[]
  >(
    key: Key,
    expr: Extract<FunctionExpression, "contains">,
    value: StripKeys<Property>[number]
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  orExpression<
    Key extends ObjectKeyPaths<
      AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>
    >
  >(
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  orExpression(
    not: NotExpression,
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<
        DDB,
        Table,
        O,
        AllowKeys
      >
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<
      DDB,
      Table,
      O,
      AllowKeys
    >
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

  orExpression(
    builder: (
      qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<
        DDB,
        Table,
        O,
        AllowKeys
      >
    ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<
      DDB,
      Table,
      O,
      AllowKeys
    >
  ): ExpressionBuilderInterfaceWithOnlyExpressionOperations<
    DDB,
    Table,
    O,
    AllowKeys
  >;

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
    qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<
      DDB,
      Table,
      O,
      AllowKeysInExpression
    >
  ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
];

export type BuilderExprArg<
  DDB,
  Table extends keyof DDB,
  O,
  AllowKeysInExpression = true
> = [
  builder: (
    qb: ExpressionBuilderInterfaceWithOnlyExpressionOperations<
      DDB,
      Table,
      O,
      AllowKeysInExpression
    >
  ) => ExpressionBuilderInterfaceWithOnlyExpressionOperations<DDB, Table, O>
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
