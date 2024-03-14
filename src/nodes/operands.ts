export type BetweenExpression = "BETWEEN";

// TODO: Support "contains" and "size"
export type FunctionExpression =
  | "attribute_exists"
  | "attribute_not_exists"
  | "begins_with"
  | "attribute_type";

export type NotExpression = "NOT";

export type KeyConditionComparators = "=" | "<" | "<=" | ">" | ">=";
export type FilterConditionComparators = KeyConditionComparators | "<>";
