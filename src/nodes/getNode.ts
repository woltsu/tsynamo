import { AttributesNode } from "./attributesNode";
import { ConsistentReadNode } from "./consistentReadNode";
import { KeysNode } from "./keysNode";
import { TableNode } from "./tableNode";

export type GetNode = {
  readonly kind: "GetNode";
  readonly table: TableNode;
  readonly keys?: KeysNode;
  readonly consistentRead?: ConsistentReadNode;
  readonly attributes?: AttributesNode;
};
