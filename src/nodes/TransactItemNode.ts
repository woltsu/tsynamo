import { DeleteNode } from "./deleteNode";
import { PutNode } from "./putNode";
import { UpdateNode } from "./updateNode";

export type TransactWriteItemNode = {
  readonly kind: "TransactWriteItemNode";
  readonly Put?: PutNode;
  readonly Delete?: DeleteNode;
  readonly Update?: UpdateNode;
};
