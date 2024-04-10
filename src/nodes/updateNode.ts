import { ExpressionNode } from "./expressionNode";
import { ItemNode } from "./itemNode";
import { KeysNode } from "./keysNode";
import { ReturnValuesNode } from "./returnValuesNode";
import { TableNode } from "./tableNode";
import { UpdateExpression } from "./updateExpression";

export type UpdateNode = {
  readonly kind: "UpdateNode";
  readonly table: TableNode;
  readonly conditionExpression: ExpressionNode;
  readonly updateExpression: UpdateExpression;
  readonly keys?: KeysNode;
  readonly returnValues?: ReturnValuesNode;
};
