import { AttributesNode } from "./attributesNode";
import { ConsistentReadNode } from "./consistentReadNode";
import { ExpressionNode } from "./expressionNode";
import { IndexNode } from "./indexNode";
import { KeyConditionNode } from "./keyConditionNode";
import { LimitNode } from "./limitNode";
import { ScanIndexForwardNode } from "./scanIndexForwardNode";
import { TableNode } from "./tableNode";

export type QueryNode = {
  readonly kind: "QueryNode";
  readonly table: TableNode;
  readonly keyConditions: KeyConditionNode[];
  readonly filterExpression: ExpressionNode;
  readonly consistentRead?: ConsistentReadNode;
  readonly scanIndexForward?: ScanIndexForwardNode;
  readonly limit?: LimitNode;
  readonly index?: IndexNode;
  readonly attributes?: AttributesNode;
};
