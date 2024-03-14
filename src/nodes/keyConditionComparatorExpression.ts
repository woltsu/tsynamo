import { KeyConditionComparators } from "./operands";

export type KeyConditionComparatorExpression = {
  readonly kind: "KeyConditionComparatorExpression";
  readonly key: string;
  readonly operation: KeyConditionComparators;
  readonly value: unknown;
};
