// TODO: Support BETWEEN & BEGINS WITH
export type ComparisonOperator = "=" | "<" | "<=" | ">" | ">=";
export type JoinType = "AND" | "OR";
export type BetweenExpression = "BETWEEN";
export type FunctionExpression = "begins_with" | "attribute_exists";

export type KeyConditionComparators = "=" | "<" | "<=" | ">" | ">=";
export type FilterConditionComparators = KeyConditionComparators & "<>";
