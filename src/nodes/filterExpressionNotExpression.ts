import { FilterExpressionNode } from "./filterExpressionNode";
import { JoinType } from "./operationNode";

export type FilterExpressionNotExpression = {
  readonly kind: "FilterExpressionNotExpression";
  readonly expr: FilterExpressionNode;
  readonly joinType?: JoinType;
};
