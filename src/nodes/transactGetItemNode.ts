import { GetNode } from "./getNode";

export type TransactGetItemNode = {
  readonly kind: "TransactGetItemNode";
  readonly Get: GetNode;
};
