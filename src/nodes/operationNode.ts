// TODO: Support BETWEEN & BEGINS WITH
export type ComparisonOperator = "=" | "<" | "<=" | ">" | ">=";
export type JoinType = "AND" | "OR";

export type OperationNode = {
  readonly kind: "OperationNode";
  readonly key: string;
  readonly operation: ComparisonOperator;
  readonly value: unknown;
  readonly joinType: JoinType;
};
