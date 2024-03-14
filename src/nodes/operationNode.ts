// TODO: Support BETWEEN & BEGINS WITH
export type ComparisonOperator = "=" | "<" | "<=" | ">" | ">=";
export type JoinType = "AND" | "OR";
export type BetweenExpression = "BETWEEN";
export type FunctionExpression = "begins_with" | "attribute_exists";

export type KeyConditionComparators = "=" | "<" | "<=" | ">" | ">=";
export type FilterConditionComparators = KeyConditionComparators & "<>";

export type OperationNode = {
  readonly kind: "OperationNode";
  readonly key: string;
  readonly operation: FilterConditionComparators;
  readonly value: unknown;
  readonly joinType: JoinType;
};
