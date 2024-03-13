import { JoinType, OperationNode } from "./operationNode";

export type FilterExpressionNode = {
  readonly kind: "FilterExpressionNode";
  readonly expressions: (FilterExpressionNode | OperationNode)[];
  readonly joinType?: JoinType;
};
