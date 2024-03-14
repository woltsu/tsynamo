import { JoinType } from "./operationNode";

export type BetweenConditionExpression = {
  readonly kind: "BetweenConditionExpression";
  readonly key: string;
  readonly left: unknown;
  readonly right: unknown;
  readonly joinType?: JoinType;
};
