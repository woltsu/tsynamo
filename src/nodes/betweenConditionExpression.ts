export type BetweenConditionExpression = {
  readonly kind: "BetweenConditionExpression";
  readonly key: string;
  readonly left: unknown;
  readonly right: unknown;
};
