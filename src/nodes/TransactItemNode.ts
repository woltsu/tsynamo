import { PutNode } from "./putNode";

export type TransactItemNode = {
  readonly kind: "TransactItemNode";
  readonly Put?: PutNode;
};
