import { ExpressionConditionComparators } from "./operands";

export type ExpressionComparatorExpressions = {
  readonly kind: "ExpressionComparatorExpressions";
  readonly key: string;
  readonly operation: ExpressionConditionComparators;
  readonly value: unknown;
};
