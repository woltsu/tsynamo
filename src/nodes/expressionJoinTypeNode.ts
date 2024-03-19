import { AttributeExistsFunctionExpression } from "./attributeExistsFunctionExpression";
import { AttributeNotExistsFunctionExpression } from "./attributeNotExistsFunctionExpression";
import { BeginsWithFunctionExpression } from "./beginsWithFunctionExpression";
import { BetweenConditionExpression } from "./betweenConditionExpression";
import { ContainsFunctionExpression } from "./containsFunctionExpression";
import { ExpressionComparatorExpressions } from "./expressionComparatorExpression";
import { ExpressionNode } from "./expressionNode";
import { ExpressionNotExpression } from "./expressionNotExpression";

export type JoinType = "AND" | "OR";

export type ExpressionJoinTypeNode = {
  readonly kind: "ExpressionJoinTypeNode";
  readonly expr:
    | ExpressionNode
    | ExpressionComparatorExpressions
    | ExpressionNotExpression
    | AttributeExistsFunctionExpression
    | AttributeNotExistsFunctionExpression
    | BetweenConditionExpression
    | BeginsWithFunctionExpression
    | ContainsFunctionExpression;
  readonly joinType: JoinType;
};
