import { DeleteNode } from "./deleteNode";
import { PutNode } from "./putNode";
import { UpdateNode } from "./updateNode";

export type TransactItemNode = {
  readonly kind: "TransactItemNode";
  readonly Put?: PutNode;
  readonly Delete?: DeleteNode;
  readonly Update?: UpdateNode;
};
