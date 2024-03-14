import { FilterConditionComparators } from "./operands";

export type FilterExpressionComparatorExpressions = {
  readonly kind: "FilterExpressionComparatorExpressions";
  readonly key: string;
  readonly operation: FilterConditionComparators;
  readonly value: unknown;
};
