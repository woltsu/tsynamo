export type ReturnValuesOptions =
  | "NONE"
  | "ALL_OLD"
  | "UPDATED_OLD"
  | "ALL_NEW"
  | "UPDATED_NEW";

export type ReturnValuesNode = {
  readonly kind: "ReturnValuesNode";
  readonly option: ReturnValuesOptions;
};

export type ReturnOldValuesNode = {
  readonly kind: "ReturnValuesNode";
  readonly option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">;
};
