import { FilterExpressionNode } from "./filterExpressionNode";
import { KeyConditionNode } from "./keyConditionNode";
import { LimitNode } from "./limitNode";
import { TableNode } from "./tableNode";

export type QueryNode = {
  readonly kind: "QueryNode";
  readonly table: TableNode;
  readonly keyConditions: KeyConditionNode[];
  readonly filterExpressions: FilterExpressionNode[];
  readonly limit?: LimitNode;
};
