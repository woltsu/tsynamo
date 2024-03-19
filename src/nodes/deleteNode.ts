import { ExpressionNode } from "./expressionNode";
import { KeysNode } from "./keysNode";
import { ReturnOldValuesNode, ReturnValuesNode } from "./returnValuesNode";
import { TableNode } from "./tableNode";

export type DeleteNode = {
  readonly kind: "DeleteNode";
  readonly table: TableNode;
  readonly conditionExpression: ExpressionNode;
  readonly returnValues?: ReturnValuesNode;
  readonly returnValuesOnConditionCheckFailure?: ReturnOldValuesNode;
  readonly keys?: KeysNode;
};
