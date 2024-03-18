import { ExpressionJoinTypeNode } from "./expressionJoinTypeNode";

export type ExpressionNode = {
  readonly kind: "ExpressionNode";
  readonly expressions: ExpressionJoinTypeNode[];
};
