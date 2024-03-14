import { BetweenConditionExpression } from "./betweenConditionExpression";
import { FilterExpressionComparatorExpressions } from "./filterExpressionComparatorExpression";
import { FilterExpressionNode } from "./filterExpressionNode";
import { FilterExpressionNotExpression } from "./filterExpressionNotExpression";

export type JoinType = "AND" | "OR";

export type FilterExpressionJoinTypeNode = {
  readonly kind: "FilterExpressionJoinTypeNode";
  readonly expr:
    | FilterExpressionNode
    | FilterExpressionComparatorExpressions
    | FilterExpressionNotExpression
    | BetweenConditionExpression;
  readonly joinType: JoinType;
};
