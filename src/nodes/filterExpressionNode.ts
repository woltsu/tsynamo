import { ComparisonOperator } from "./operationNode";

export type JoinType = "AND" | "OR";

export type FilterExpressionNode = {
  readonly kind: "FilterExpressionNode";
  readonly key: string;
  readonly operation: ComparisonOperator;
  readonly value: unknown;
  readonly joinType: JoinType;
};
