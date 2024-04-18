import { TransactItemNode } from "./TransactItemNode";

export type TransactionNode = {
  readonly kind: "TransactionNode";
  readonly transactItems: TransactItemNode[];
};
