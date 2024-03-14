import { KeyConditionComparators } from "./operationNode";

export type KeyConditionComparatorExpression = {
  readonly kind: "KeyConditionComparatorExpression";
  readonly key: string;
  readonly operation: KeyConditionComparators;
  readonly value: unknown;
};
