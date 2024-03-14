import { FilterExpressionNode } from "./filterExpressionNode";

export type FilterExpressionNotExpression = {
  readonly kind: "FilterExpressionNotExpression";
  readonly expr: FilterExpressionNode;
};
