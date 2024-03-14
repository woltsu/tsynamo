export type BetweenExpression = "BETWEEN";

// TODO: Support "contains", "size", and "attribute_type" functions
export type FunctionExpression =
  | "attribute_exists"
  | "attribute_not_exists"
  | "begins_with";

export type NotExpression = "NOT";

export type KeyConditionComparators = "=" | "<" | "<=" | ">" | ">=";
export type FilterConditionComparators = KeyConditionComparators | "<>";
