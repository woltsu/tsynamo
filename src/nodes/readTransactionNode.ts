import { TransactGetItemNode } from "./transactGetItemNode";

export type ReadTransactionNode = {
  readonly kind: "ReadTransactionNode";
  readonly transactGetItems: TransactGetItemNode[];
};
