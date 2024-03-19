import { ExpressionNode } from "./expressionNode";
import { ItemNode } from "./itemNode";
import { ReturnValuesNode } from "./returnValuesNode";
import { TableNode } from "./tableNode";

export type PutNode = {
  readonly kind: "PutNode";
  readonly table: TableNode;
  readonly conditionExpression: ExpressionNode;
  readonly item?: ItemNode;
  readonly returnValues?: ReturnValuesNode;
};
