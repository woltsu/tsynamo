import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetNode } from "../nodes/getNode";
import { QueryNode } from "../nodes/queryNode";
import { QueryCommand } from "@aws-sdk/client-dynamodb";

export class QueryCompiler {
  compileGetNode(getNode: GetNode): GetCommand {
    const {
      table: tableNode,
      keys: keysNode,
      consistentRead: consistentReadNode,
      attributes: attributesNode,
    } = getNode;

    return new GetCommand({
      TableName: tableNode.table,
      Key: keysNode?.keys,
      ConsistentRead: consistentReadNode?.enabled,
      ProjectionExpression: attributesNode?.attributes.join(", "),
    });
  }

  compileQueryNode(queryNode: QueryNode): QueryCommand {
    return new QueryCommand({ TableName: ":D" });
  }

  compile(rootNode: QueryNode): QueryCommand;
  compile(rootNode: GetNode): GetCommand;
  compile(rootNode: QueryNode | GetNode) {
    switch (rootNode.kind) {
      case "GetNode":
        return this.compileGetNode(rootNode);
      case "QueryNode":
        return this.compileQueryNode(rootNode);
    }
  }
}
