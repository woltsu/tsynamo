import { TransactWriteItemNode } from "./TransactItemNode";

export type WriteTransactionNode = {
  readonly kind: "WriteTransactionNode";
  readonly transactWriteItems: TransactWriteItemNode[];
};
