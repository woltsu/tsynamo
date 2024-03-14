import { FilterExpressionComparatorExpressions } from "./filterExpressionComparatorExpression";
import { JoinType } from "./operationNode";

export type FilterExpressionNode = {
  readonly kind: "FilterExpressionNode";
  readonly expressions: (
    | FilterExpressionNode
    | FilterExpressionComparatorExpressions
  )[];
  readonly joinType?: JoinType;
};
