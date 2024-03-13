import { AttributesNode } from "./attributesNode";
import { ConsistentReadNode } from "./consistentReadNode";
import { FilterExpressionNode } from "./filterExpressionNode";
import { KeyConditionNode } from "./keyConditionNode";
import { LimitNode } from "./limitNode";
import { ScanIndexForwardNode } from "./scanIndexForwardNode";
import { TableNode } from "./tableNode";

export type QueryNode = {
  readonly kind: "QueryNode";
  readonly table: TableNode;
  readonly keyConditions: KeyConditionNode[];
  readonly filterExpression: FilterExpressionNode;
  readonly consistentRead?: ConsistentReadNode;
  readonly scanIndexForward?: ScanIndexForwardNode;
  readonly limit?: LimitNode;
  readonly attributes?: AttributesNode;
};
