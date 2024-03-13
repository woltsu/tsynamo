import { ComparisonOperator } from "./operationNode";

export type KeyConditionNode = {
  readonly kind: "KeyConditionNode";
  readonly key: string;
  readonly operation: ComparisonOperator;
  readonly value: unknown;
};
