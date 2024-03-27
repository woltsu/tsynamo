import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AttributesNode } from "../nodes/attributesNode";
import { DeleteNode } from "../nodes/deleteNode";
import { ExpressionJoinTypeNode } from "../nodes/expressionJoinTypeNode";
import { ExpressionNode } from "../nodes/expressionNode";
import { GetNode } from "../nodes/getNode";
import { KeyConditionNode } from "../nodes/keyConditionNode";
import { PutNode } from "../nodes/putNode";
import { QueryNode } from "../nodes/queryNode";
import { SetUpdateExpression } from "../nodes/setUpdateExpression";
import { SetUpdateExpressionFunction } from "../nodes/setUpdateExpressionFunction";
import { UpdateExpression } from "../nodes/updateExpression";
import { UpdateNode } from "../nodes/updateNode";
import {
  getAttributeNameFrom,
  getExpressionAttributeNameFrom,
  mergeObjectIntoMap,
} from "./compilerUtil";

export class QueryCompiler {
  compile(rootNode: QueryNode): QueryCommand;
  compile(rootNode: GetNode): GetCommand;
  compile(rootNode: PutNode): PutCommand;
  compile(rootNode: DeleteNode): DeleteCommand;
  compile(rootNode: UpdateNode): UpdateCommand;
  compile(rootNode: QueryNode | GetNode | PutNode | DeleteNode | UpdateNode) {
    switch (rootNode.kind) {
      case "GetNode":
        return this.compileGetNode(rootNode);
      case "QueryNode":
        return this.compileQueryNode(rootNode);
      case "PutNode":
        return this.compilePutNode(rootNode);
      case "DeleteNode":
        return this.compileDeleteNode(rootNode);
      case "UpdateNode":
        return this.compileUpdateNode(rootNode);
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

    const compiledFilterExpression = this.compileExpression(
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
      conditionExpression: conditionExpressionNode,
    } = putNode;

    const attributeNames = new Map();
    const filterExpressionAttributeValues = new Map();

    const compiledConditionExpression = this.compileExpression(
      conditionExpressionNode,
      filterExpressionAttributeValues,
      attributeNames
    );

    return new PutCommand({
      TableName: tableNode.table,
      Item: itemNode?.item,
      ReturnValues: returnValuesNode?.option,
      ConditionExpression: compiledConditionExpression
        ? compiledConditionExpression
        : undefined,
      ExpressionAttributeValues:
        filterExpressionAttributeValues.size > 0
          ? {
              ...Object.fromEntries(filterExpressionAttributeValues),
            }
          : undefined,
      ExpressionAttributeNames:
        attributeNames.size > 0
          ? {
              ...Object.fromEntries(attributeNames),
            }
          : undefined,
    });
  }

  compileDeleteNode(deleteNode: DeleteNode) {
    const {
      table: tableNode,
      returnValues: returnValuesNode,
      returnValuesOnConditionCheckFailure:
        returnValuesOnConditionCheckFailureNode,
      keys: keysNode,
      conditionExpression: conditionExpressionNode,
    } = deleteNode;

    const attributeNames = new Map();
    const filterExpressionAttributeValues = new Map();

    const compiledConditionExpression = this.compileExpression(
      conditionExpressionNode,
      filterExpressionAttributeValues,
      attributeNames
    );

    return new DeleteCommand({
      TableName: tableNode.table,
      Key: keysNode?.keys,
      ReturnValues: returnValuesNode?.option,
      ReturnValuesOnConditionCheckFailure:
        returnValuesOnConditionCheckFailureNode?.option,
      ConditionExpression: compiledConditionExpression
        ? compiledConditionExpression
        : undefined,
      ExpressionAttributeValues:
        filterExpressionAttributeValues.size > 0
          ? {
              ...Object.fromEntries(filterExpressionAttributeValues),
            }
          : undefined,
      ExpressionAttributeNames:
        attributeNames.size > 0
          ? {
              ...Object.fromEntries(attributeNames),
            }
          : undefined,
    });
  }

  compileUpdateNode(updateNode: UpdateNode) {
    const {
      table: tableNode,
      conditionExpression: conditionExpressionNode,
      updateExpression: updateExpressionNode,
      keys: keysNode,
      returnValues: returnValuesNode,
    } = updateNode;

    const attributeNames = new Map();
    const filterExpressionAttributeValues = new Map();

    const compiledConditionExpression = this.compileExpression(
      conditionExpressionNode,
      filterExpressionAttributeValues,
      attributeNames
    );

    const compiledUpdateExpression = this.compileUpdateExpression(
      updateExpressionNode,
      filterExpressionAttributeValues,
      attributeNames
    );

    return new UpdateCommand({
      TableName: tableNode.table,
      Key: keysNode?.keys,
      ReturnValues: returnValuesNode?.option,
      ConditionExpression: compiledConditionExpression
        ? compiledConditionExpression
        : undefined,
      UpdateExpression: compiledUpdateExpression
        ? compiledUpdateExpression
        : undefined,
      ExpressionAttributeValues:
        filterExpressionAttributeValues.size > 0
          ? {
              ...Object.fromEntries(filterExpressionAttributeValues),
            }
          : undefined,
      ExpressionAttributeNames:
        attributeNames.size > 0
          ? {
              ...Object.fromEntries(attributeNames),
            }
          : undefined,
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

  compileExpression = (
    expression: ExpressionNode,
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
    { expr }: ExpressionJoinTypeNode,
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
      case "ExpressionNode": {
        res += "(";
        res += this.compileExpression(
          expr,
          filterExpressionAttributeValues,
          attributeNames
        );
        res += ")";
        break;
      }

      case "ExpressionComparatorExpressions": {
        res += `${attributeName} ${expr.operation} ${attributeValue}`;
        filterExpressionAttributeValues.set(attributeValue, expr.value);
        break;
      }

      case "ExpressionNotExpression": {
        res += "NOT (";
        res += this.compileExpression(
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

  compileUpdateExpression(
    node: UpdateExpression,
    updateExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) {
    let res = "SET ";

    res += node.setUpdateExpressions
      .map((setUpdateExpression) => {
        return this.compileSetUpdateExpression(
          setUpdateExpression,
          updateExpressionAttributeValues,
          attributeNames
        );
      })
      .join(", ");

    return res;
  }

  compileSetUpdateExpression(
    expression: SetUpdateExpression,
    updateExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) {
    let res = "";
    const offset = updateExpressionAttributeValues.size;
    const attributeValue = `:setUpdateExpressionValue${offset}`;

    const { expressionAttributeName, attributeNameMap } =
      this.compileAttributeName(expression.key);
    const attributeName = expressionAttributeName;
    mergeObjectIntoMap(attributeNames, attributeNameMap);

    res += `${attributeName} = `;

    switch (expression.right.kind) {
      case "SetUpdateExpressionValue": {
        if (expression.operation !== "=") {
          if (expression.operation === "-=") {
            res += `${attributeName} - `;
          } else {
            res += `${attributeName} + `;
          }
        }

        res += attributeValue;
        updateExpressionAttributeValues.set(
          attributeValue,
          expression.right.value
        );
        return res;
      }

      case "SetUpdateExpressionFunction": {
        const compiledFunc = this.compileSetUpdateExpressionFunction(
          expression.right,
          updateExpressionAttributeValues,
          attributeNames
        );

        if (expression.value !== undefined) {
          const offset = updateExpressionAttributeValues.size;
          const attributeValue = `:setUpdateExpressionValue${offset}Value`;

          if (expression.operation === "+=") {
            // TODO: Put to value map
            res += `${compiledFunc} + ${attributeValue}`;
          } else if (expression.operation === "-=") {
            res += `${compiledFunc} - ${attributeValue}`;
          }

          updateExpressionAttributeValues.set(attributeValue, expression.value);
        } else {
          res += compiledFunc;
        }

        return res;
      }
    }
  }

  compileSetUpdateExpressionFunction(
    functionExpression: SetUpdateExpressionFunction,
    filterExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) {
    const { function: functionNode } = functionExpression;
    let res = "";

    switch (functionNode.kind) {
      case "SetUpdateExpressionIfNotExistsFunction": {
        let rightValue = "";
        const offset = filterExpressionAttributeValues.size;
        const attributeValue = `:setUpdateExpressionValue${offset}`;

        if (functionNode.right.kind === "SetUpdateExpressionValue") {
          rightValue = attributeValue;

          filterExpressionAttributeValues.set(
            attributeValue,
            functionNode.right.value
          );
        } else {
          rightValue = this.compileSetUpdateExpressionFunction(
            functionNode.right,
            filterExpressionAttributeValues,
            attributeNames
          );
        }

        const { expressionAttributeName, attributeNameMap } =
          this.compileAttributeName(functionNode.path);
        const attributeName = expressionAttributeName;
        mergeObjectIntoMap(attributeNames, attributeNameMap);

        res += `if_not_exists(${attributeName}, ${rightValue})`;
        return res;
      }

      case "SetUpdateExpressionListAppendFunction": {
        let leftValue = "";
        let rightValue = "";

        if (typeof functionNode.left === "string") {
          const { expressionAttributeName, attributeNameMap } =
            this.compileAttributeName(functionNode.left);

          const attributeName = expressionAttributeName;
          mergeObjectIntoMap(attributeNames, attributeNameMap);
          leftValue = attributeName;
        } else {
          leftValue = this.compileSetUpdateExpressionFunction(
            functionNode.left,
            filterExpressionAttributeValues,
            attributeNames
          );
        }

        const offset = filterExpressionAttributeValues.size;
        const attributeValue = `:setUpdateExpressionValue${offset}`;

        if (functionNode.right.kind === "SetUpdateExpressionValue") {
          rightValue = attributeValue;

          filterExpressionAttributeValues.set(
            attributeValue,
            functionNode.right.value
          );
        } else {
          rightValue = this.compileSetUpdateExpressionFunction(
            functionNode.right,
            filterExpressionAttributeValues,
            attributeNames
          );
        }

        res += `list_append(${leftValue}, ${rightValue})`;
        return res;
      }
    }
  }
}
