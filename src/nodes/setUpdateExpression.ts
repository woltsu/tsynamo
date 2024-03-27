import { UpdateExpressionOperands } from "./operands";
import { SetUpdateExpressionFunction } from "./setUpdateExpressionFunction";
import { SetUpdateExpressionValue } from "./setUpdateExpressionValue";

export type SetUpdateExpression = {
  readonly kind: "SetUpdateExpression";
  readonly key: string;
  readonly operation: UpdateExpressionOperands;
  readonly right: SetUpdateExpressionFunction | SetUpdateExpressionValue;
  readonly value?: number;
};
