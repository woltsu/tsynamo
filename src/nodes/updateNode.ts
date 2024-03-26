import { ExpressionNode } from "./expressionNode";
import { ItemNode } from "./itemNode";
import { ReturnValuesNode } from "./returnValuesNode";
import { TableNode } from "./tableNode";
import { UpdateExpression } from "./updateExpression";

export type UpdateNode = {
  readonly kind: "UpdateNode";
  readonly table: TableNode;
  readonly conditionExpression: ExpressionNode;
  readonly updateExpression: UpdateExpression;
  readonly item?: ItemNode;
  readonly returnValues?: ReturnValuesNode;
};
