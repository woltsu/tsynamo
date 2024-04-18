import { DeleteNode } from "./deleteNode";
import { PutNode } from "./putNode";

export type TransactItemNode = {
  readonly kind: "TransactItemNode";
  readonly Put?: PutNode;
  readonly Delete?: DeleteNode;
};
