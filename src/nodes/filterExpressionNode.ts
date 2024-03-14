import { FilterExpressionJoinTypeNode } from "./filterExpressionJoinTypeNode";

export type FilterExpressionNode = {
  readonly kind: "FilterExpressionNode";
  readonly expressions: FilterExpressionJoinTypeNode[];
};
