import { BeginsWithFunctionExpression } from "./beginsWithFunctionExpression";
import { BetweenConditionExpression } from "./betweenConditionExpression";
import { KeyConditionComparatorExpression } from "./keyConditionComparatorExpression";

export type KeyConditionNode = {
  readonly kind: "KeyConditionNode";
  readonly operation:
    | KeyConditionComparatorExpression
    | BetweenConditionExpression
    | BeginsWithFunctionExpression;
};
