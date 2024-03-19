import { ExpressionNode } from "./expressionNode";

export type ExpressionNotExpression = {
  readonly kind: "ExpressionNotExpression";
  readonly expr: ExpressionNode;
};
