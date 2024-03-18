import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { FilterExpressionJoinTypeNode } from "../nodes/filterExpressionJoinTypeNode";
import { FilterExpressionNode } from "../nodes/filterExpressionNode";
import { GetNode } from "../nodes/getNode";
import { KeyConditionNode } from "../nodes/keyConditionNode";
import { QueryNode } from "../nodes/queryNode";
import {
  getAttributeNameFrom,
  getExpressionAttributeNameFrom,
  mergeObjectIntoMap,
} from "./compilerUtil";
import { AttributesNode } from "../nodes/attributesNode";
import { PutNode } from "../nodes/putNode";

export class QueryCompiler {
  compile(rootNode: QueryNode): QueryCommand;
  compile(rootNode: GetNode): GetCommand;
  compile(rootNode: PutNode): PutCommand;
  compile(rootNode: QueryNode | GetNode | PutNode) {
    switch (rootNode.kind) {
      case "GetNode":
        return this.compileGetNode(rootNode);
      case "QueryNode":
        return this.compileQueryNode(rootNode);
      case "PutNode":
        return this.compilePutNode(rootNode);
    }
  }

  compileGetNode(getNode: GetNode): GetCommand {
    const {
      table: tableNode,
      keys: keysNode,
      consistentRead: consistentReadNode,
      attributes: attributesNode,
    } = getNode;

    const { ProjectionExpression, ExpressionAttributeNames } =
      this.compileAttributeNamesNode(attributesNode);

    return new GetCommand({
      TableName: tableNode.table,
      Key: keysNode?.keys,
      ConsistentRead: consistentReadNode?.enabled,
      ProjectionExpression,
      ExpressionAttributeNames,
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

    const attributeNames = new Map();
    const keyConditionAttributeValues = new Map();
    const filterExpressionAttributeValues = new Map();

    const compiledKeyConditionExpression = this.compileKeyConditionExpression(
      keyConditionsNode,
      keyConditionAttributeValues,
      attributeNames
    );

    const compiledFilterExpression = this.compileFilterExpression(
      filterExpressionNode,
      filterExpressionAttributeValues,
      attributeNames
    );

    const { ProjectionExpression, ExpressionAttributeNames } =
      this.compileAttributeNamesNode(attributesNode);

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
      ProjectionExpression: ProjectionExpression,
      ExpressionAttributeNames:
        attributeNames.size > 0 || ExpressionAttributeNames
          ? {
              ...Object.fromEntries(attributeNames),
              ...ExpressionAttributeNames,
            }
          : undefined,
    });
  }

  compilePutNode(putNode: PutNode) {
    const {
      table: tableNode,
      item: itemNode,
      returnValues: returnValuesNode,
    } = putNode;

    return new PutCommand({
      TableName: tableNode.table,
      Item: itemNode?.item,
      ReturnValues: returnValuesNode?.option,
    });
  }

  compileAttributeNamesNode(node?: AttributesNode) {
    const ProjectionExpression = node?.attributes
      .map((att) => getExpressionAttributeNameFrom(att))
      .join(", ");

    const ExpressionAttributeNames = node?.attributes
      .map((att) => getAttributeNameFrom(att))
      .reduce((acc, curr) => {
        curr.forEach(([key, value]) => {
          acc[key] = value;
        });
        return acc;
      }, {} as Record<string, string>);

    return {
      ProjectionExpression,
      ExpressionAttributeNames,
    };
  }

  compileAttributeName(path: string) {
    const expressionAttributeName = getExpressionAttributeNameFrom(path);
    const attributeNameMap = getAttributeNameFrom(path).reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    return {
      expressionAttributeName,
      attributeNameMap,
    };
  }

  compileFilterExpression = (
    expression: FilterExpressionNode,
    filterExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) => {
    let res = "";

    expression.expressions.forEach((joinNode, i) => {
      if (i !== 0) {
        res += ` ${joinNode.joinType} `;
      }

      res += this.compileFilterExpressionJoinNodes(
        joinNode,
        filterExpressionAttributeValues,
        attributeNames
      );
    });

    return res;
  };

  compileFilterExpressionJoinNodes = (
    { expr }: FilterExpressionJoinTypeNode,
    filterExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) => {
    let res = "";
    const offset = filterExpressionAttributeValues.size;
    const attributeValue = `:filterExpressionValue${offset}`;
    let attributeName: string | undefined = undefined;

    // NOTE: We want to use attribute names instead of directly using the given keys
    if ("key" in expr) {
      const { expressionAttributeName, attributeNameMap } =
        this.compileAttributeName(expr.key);

      attributeName = expressionAttributeName;
      mergeObjectIntoMap(attributeNames, attributeNameMap);
    }

    switch (expr.kind) {
      case "FilterExpressionNode": {
        res += "(";
        res += this.compileFilterExpression(
          expr,
          filterExpressionAttributeValues,
          attributeNames
        );
        res += ")";
        break;
      }

      case "FilterExpressionComparatorExpressions": {
        res += `${attributeName} ${expr.operation} ${attributeValue}`;
        filterExpressionAttributeValues.set(attributeValue, expr.value);
        break;
      }

      case "FilterExpressionNotExpression": {
        res += "NOT (";
        res += this.compileFilterExpression(
          expr.expr,
          filterExpressionAttributeValues,
          attributeNames
        );
        res += ")";
        break;
      }

      case "BetweenConditionExpression": {
        res += `${attributeName} BETWEEN ${attributeValue}left AND ${attributeValue}right`;
        filterExpressionAttributeValues.set(`${attributeValue}left`, expr.left);
        filterExpressionAttributeValues.set(
          `${attributeValue}right`,
          expr.right
        );
        break;
      }

      case "AttributeExistsFunctionExpression": {
        res += `attribute_exists(${attributeName})`;
        break;
      }

      case "AttributeNotExistsFunctionExpression": {
        res += `attribute_not_exists(${attributeName})`;
        break;
      }

      case "BeginsWithFunctionExpression": {
        res += `begins_with(${attributeName}, ${attributeValue})`;
        filterExpressionAttributeValues.set(attributeValue, expr.substr);
        break;
      }

      case "ContainsFunctionExpression": {
        res += `contains(${attributeName}, ${attributeValue})`;
        filterExpressionAttributeValues.set(attributeValue, expr.value);
        break;
      }
    }

    return res;
  };

  compileKeyConditionExpression = (
    keyConditions: KeyConditionNode[],
    keyConditionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) => {
    let res = "";
    keyConditions.forEach((keyCondition, i) => {
      if (i !== 0) {
        res += " AND ";
      }

      const { expressionAttributeName, attributeNameMap } =
        this.compileAttributeName(keyCondition.operation.key);

      const attributeValue = `:keyConditionValue${i}`;
      if (keyCondition.operation.kind === "KeyConditionComparatorExpression") {
        res += `${expressionAttributeName} ${keyCondition.operation.operation} ${attributeValue}`;
        keyConditionAttributeValues.set(
          attributeValue,
          keyCondition.operation.value
        );
      } else if (keyCondition.operation.kind === "BetweenConditionExpression") {
        res += `${expressionAttributeName} BETWEEN ${attributeValue}left AND ${attributeValue}right`;
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
        res += `begins_with(${expressionAttributeName}, ${attributeValue})`;
        keyConditionAttributeValues.set(
          attributeValue,
          keyCondition.operation.substr
        );
      }

      mergeObjectIntoMap(attributeNames, attributeNameMap);
    });

    return res;
  };
}
