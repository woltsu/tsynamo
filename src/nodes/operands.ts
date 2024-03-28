export type BetweenExpression = "BETWEEN";

// TODO: Support "size" and "attribute_type" functions
export type FunctionExpression =
  | "attribute_exists"
  | "attribute_not_exists"
  | "begins_with"
  | "contains";

export type NotExpression = "NOT";

export type KeyConditionComparators = "=" | "<" | "<=" | ">" | ">=";
export type ExpressionConditionComparators = KeyConditionComparators | "<>";

export type UpdateExpressionOperands = "=" | "+=" | "-=";
