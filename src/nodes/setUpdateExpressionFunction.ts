import { SetUpdateExpressionValue } from "./setUpdateExpressionValue";

export type SetUpdateExpressionFunction = {
  readonly kind: "SetUpdateExpressionFunction";
  readonly function:
    | SetUpdateExpressionIfNotExistsFunction
    | SetUpdateExpressionListAppendFunction;
};

export type SetUpdateExpressionIfNotExistsFunction = {
  readonly kind: "SetUpdateExpressionIfNotExistsFunction";
  readonly path: string;
  readonly right: SetUpdateExpressionFunction | SetUpdateExpressionValue;
};

export type SetUpdateExpressionListAppendFunction = {
  readonly kind: "SetUpdateExpressionListAppendFunction";
  readonly left: SetUpdateExpressionFunction | string;
  readonly right: SetUpdateExpressionFunction | SetUpdateExpressionValue;
};
