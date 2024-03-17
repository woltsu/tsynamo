import { AttributeExistsFunctionExpression } from "./attributeExistsFunctionExpression";
import { AttributeNotExistsFunctionExpression } from "./attributeNotExistsFunctionExpression";
import { BeginsWithFunctionExpression } from "./beginsWithFunctionExpression";
import { BetweenConditionExpression } from "./betweenConditionExpression";
import { ContainsFunctionExpression } from "./containsFunctionExpression";
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
    | AttributeExistsFunctionExpression
    | AttributeNotExistsFunctionExpression
    | BetweenConditionExpression
    | BeginsWithFunctionExpression
    | ContainsFunctionExpression;
  readonly joinType: JoinType;
};
