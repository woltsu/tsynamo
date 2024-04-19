import { TransactWriteItemNode } from "./transactWriteItemNode";

export type WriteTransactionNode = {
  readonly kind: "WriteTransactionNode";
  readonly transactWriteItems: TransactWriteItemNode[];
};
