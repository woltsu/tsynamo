import { ItemNode } from "./itemNode";
import { ReturnValuesNode } from "./returnValuesNode";
import { TableNode } from "./tableNode";

export type PutNode = {
  readonly kind: "PutNode";
  readonly table: TableNode;
  readonly item?: ItemNode;
  readonly returnValues?: ReturnValuesNode;
};
