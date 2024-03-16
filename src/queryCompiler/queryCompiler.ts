import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { FilterExpressionJoinTypeNode } from "../nodes/filterExpressionJoinTypeNode";
import { FilterExpressionNode } from "../nodes/filterExpressionNode";
import { GetNode } from "../nodes/getNode";
import { KeyConditionNode } from "../nodes/keyConditionNode";
import { QueryNode } from "../nodes/queryNode";

export class QueryCompiler {
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
    const {
      table: tableNode,
      filterExpression: filterExpressionNode,
      keyConditions: keyConditionsNode,
      limit: limitNode,
      scanIndexForward: scanIndexForwardNode,
      consistentRead: consistentReadNode,
      attributes: attributesNode,
    } = queryNode;

    const keyConditionAttributeValues = new Map();
    const filterExpressionAttributeValues = new Map();

    const compiledKeyConditionExpression = this.compileKeyConditionExpression(
      keyConditionsNode,
      keyConditionAttributeValues
    );

    const compiledFilterExpression = this.compileFilterExpression(
      filterExpressionNode,
      filterExpressionAttributeValues
    );

    return new QueryCommand({
      TableName: tableNode.table,
      KeyConditionExpression: compiledKeyConditionExpression,
      FilterExpression: compiledFilterExpression
        ? compiledFilterExpression
        : undefined,
      Limit: limitNode?.limit,
      ExpressionAttributeValues: {
        ...Object.fromEntries(keyConditionAttributeValues),
        ...Object.fromEntries(filterExpressionAttributeValues),
      },
      ScanIndexForward: scanIndexForwardNode?.enabled,
      ConsistentRead: consistentReadNode?.enabled,
      ProjectionExpression: attributesNode?.attributes?.join(", "),
    });
  }

  compileFilterExpression = (
    expression: FilterExpressionNode,
    filterExpressionAttributeValues: Map<string, unknown>
  ) => {
    let res = "";

    expression.expressions.forEach((joinNode, i) => {
      if (i !== 0) {
        res += ` ${joinNode.joinType} `;
      }

      res += this.compileFilterExpressionJoinNodes(
        joinNode,
        filterExpressionAttributeValues
      );
    });

    return res;
  };

  compileFilterExpressionJoinNodes = (
    { expr }: FilterExpressionJoinTypeNode,
    filterExpressionAttributeValues: Map<string, unknown>
  ) => {
    let res = "";
    const offset = filterExpressionAttributeValues.size;
    const attributeValue = `:filterExpressionValue${offset}`;

    switch (expr.kind) {
      case "FilterExpressionNode": {
        res += "(";
        res += this.compileFilterExpression(
          expr,
          filterExpressionAttributeValues
        );
        res += ")";
        break;
      }

      case "FilterExpressionComparatorExpressions": {
        // TODO: Instead of expr.key, use AttributeNames here to avoid
        // problems with using reserved words.
        res += `${expr.key} ${expr.operation} ${attributeValue}`;
        filterExpressionAttributeValues.set(attributeValue, expr.value);
        break;
      }

      case "FilterExpressionNotExpression": {
        res += "NOT (";
        res += this.compileFilterExpression(
          expr.expr,
          filterExpressionAttributeValues
        );
        res += ")";
        break;
      }

      case "BetweenConditionExpression": {
        res += `${expr.key} BETWEEN ${attributeValue}left AND ${attributeValue}right`;
        filterExpressionAttributeValues.set(`${attributeValue}left`, expr.left);
        filterExpressionAttributeValues.set(
          `${attributeValue}right`,
          expr.right
        );
        break;
      }

      case "AttributeExistsFunctionExpression": {
        res += `attribute_exists(${expr.key})`;
        break;
      }

      case "AttributeNotExistsFunctionExpression": {
        res += `attribute_not_exists(${expr.key})`;
        break;
      }

      case "BeginsWithFunctionExpression": {
        res += `begins_with(${expr.key}, ${attributeValue})`;

        filterExpressionAttributeValues.set(attributeValue, expr.substr);
      }
    }

    return res;
  };

  compileKeyConditionExpression = (
    keyConditions: KeyConditionNode[],
    keyConditionAttributeValues: Map<string, unknown>
  ) => {
    let res = "";
    keyConditions.forEach((keyCondition, i) => {
      if (i !== 0) {
        res += " AND ";
      }

      const attributeValue = `:keyConditionValue${i}`;
      if (keyCondition.operation.kind === "KeyConditionComparatorExpression") {
        // TODO: Instead of expr.key, use AttributeNames here to avoid
        // problems with using reserved words.
        res += `${keyCondition.operation.key} ${keyCondition.operation.operation} ${attributeValue}`;
        keyConditionAttributeValues.set(
          attributeValue,
          keyCondition.operation.value
        );
      } else if (keyCondition.operation.kind === "BetweenConditionExpression") {
        res += `${keyCondition.operation.key} BETWEEN ${attributeValue}left AND ${attributeValue}right`;
        keyConditionAttributeValues.set(
          `${attributeValue}left`,
          keyCondition.operation.left
        );
        keyConditionAttributeValues.set(
          `${attributeValue}right`,
          keyCondition.operation.right
        );
      } else if (
        keyCondition.operation.kind === "BeginsWithFunctionExpression"
      ) {
        res += `begins_with(${keyCondition.operation.key}, ${attributeValue})`;
        keyConditionAttributeValues.set(
          attributeValue,
          keyCondition.operation.substr
        );
      }
    });

    return res;
  };
}
