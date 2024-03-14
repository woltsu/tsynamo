import { FilterConditionComparators, JoinType } from "./operationNode";

export type FilterExpressionComparatorExpressions = {
  readonly kind: "FilterExpressionComparatorExpressions";
  readonly key: string;
  readonly operation: FilterConditionComparators;
  readonly value: unknown;
  readonly joinType: JoinType;
};
