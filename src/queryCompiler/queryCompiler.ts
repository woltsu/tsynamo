import {
  TransactGetItem,
  TransactWriteItem,
  Update,
} from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  TransactGetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AddUpdateExpression } from "../nodes/addUpdateExpression";
import { AttributesNode } from "../nodes/attributesNode";
import { DeleteNode } from "../nodes/deleteNode";
import { DeleteUpdateExpression } from "../nodes/deleteUpdateExpression";
import { ExpressionJoinTypeNode } from "../nodes/expressionJoinTypeNode";
import { ExpressionNode } from "../nodes/expressionNode";
import { GetNode } from "../nodes/getNode";
import { KeyConditionNode } from "../nodes/keyConditionNode";
import { PutNode } from "../nodes/putNode";
import { QueryNode } from "../nodes/queryNode";
import { ReadTransactionNode } from "../nodes/readTransactionNode";
import { RemoveUpdateExpression } from "../nodes/removeUpdateExpression";
import { SetUpdateExpression } from "../nodes/setUpdateExpression";
import { SetUpdateExpressionFunction } from "../nodes/setUpdateExpressionFunction";
import { UpdateExpression } from "../nodes/updateExpression";
import { UpdateNode } from "../nodes/updateNode";
import { WriteTransactionNode } from "../nodes/writeTransactionNode";
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
  compile(rootNode: WriteTransactionNode): TransactWriteCommand;
  compile(rootNode: ReadTransactionNode): TransactGetCommand;
  compile(
    rootNode:
      | QueryNode
      | GetNode
      | PutNode
      | DeleteNode
      | UpdateNode
      | WriteTransactionNode
      | ReadTransactionNode
  ) {
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
      case "WriteTransactionNode":
        return this.compileWriteTransactionNode(rootNode);
      case "ReadTransactionNode":
        return this.compileReadTransactionNode(rootNode);
    }
  }

  compileGetNode(getNode: GetNode): GetCommand {
    return new GetCommand(this.compileGetCmdInput(getNode));
  }

  compileGetCmdInput(getNode: GetNode): GetCommandInput {
    const {
      table: tableNode,
      keys: keysNode,
      consistentRead: consistentReadNode,
      attributes: attributesNode,
    } = getNode;

    const { ProjectionExpression, ExpressionAttributeNames } =
      this.compileAttributeNamesNode(attributesNode);

    return {
      TableName: tableNode.table,
      Key: keysNode?.keys,
      ConsistentRead: consistentReadNode?.enabled,
      ProjectionExpression,
      ExpressionAttributeNames,
    };
  }

  compileQueryNode(queryNode: QueryNode): QueryCommand {
    const {
      table: tableNode,
      filterExpression: filterExpressionNode,
      keyConditions: keyConditionsNode,
      limit: limitNode,
      index: indexNode,
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
      IndexName: indexNode?.index,
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
    return new PutCommand(this.compilePutCmdInput(putNode));
  }

  compilePutCmdInput(putNode: PutNode): PutCommandInput {
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

    return {
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
    };
  }

  compileDeleteNode(deleteNode: DeleteNode) {
    return new DeleteCommand(this.compileDeleteCmdInput(deleteNode));
  }

  compileDeleteCmdInput(deleteNode: DeleteNode): DeleteCommandInput {
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

    return {
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
    };
  }

  compileUpdateNode(updateNode: UpdateNode) {
    return new UpdateCommand(this.compileUpdateCmdInput(updateNode));
  }

  compileUpdateCmdInput(updateNode: UpdateNode) {
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

    return {
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
    };
  }

  compileWriteTransactionNode(transactionNode: WriteTransactionNode) {
    const TransactItems = transactionNode.transactWriteItems.map((item) => {
      const compiledTransactItem: TransactWriteItem = {};

      if (item.Put) {
        compiledTransactItem.Put = this.compilePutCmdInput(item.Put);
      }

      if (item.Delete) {
        compiledTransactItem.Delete = this.compileDeleteCmdInput(item.Delete);
      }

      if (item.Update) {
        compiledTransactItem.Update = this.compileUpdateCmdInput(
          item.Update
        ) as Update;
      }

      return compiledTransactItem;
    });

    return new TransactWriteCommand({
      TransactItems: TransactItems,
      ClientRequestToken: transactionNode.clientRequestToken,
    });
  }

  compileReadTransactionNode(transactionNode: ReadTransactionNode) {
    const TransactItems = transactionNode.transactGetItems.map((item) => {
      const compiledGet = this.compileGetCmdInput(item.Get);

      const compiledTransactItem: TransactGetItem = {
        Get: compiledGet,
      };

      return compiledTransactItem;
    });

    return new TransactGetCommand({
      TransactItems: TransactItems,
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
    let res = "";

    if (node.setUpdateExpressions.length > 0) {
      res += "SET ";
      res += node.setUpdateExpressions
        .map((setUpdateExpression) => {
          return this.compileSetUpdateExpression(
            setUpdateExpression,
            updateExpressionAttributeValues,
            attributeNames
          );
        })
        .join(", ");
    }

    if (node.removeUpdateExpressions.length > 0) {
      res += " REMOVE ";
      res += node.removeUpdateExpressions
        .map((removeUpdateExpression) => {
          return this.compileRemoveUpdateExpression(
            removeUpdateExpression,
            attributeNames
          );
        })
        .join(", ");
    }

    if (node.addUpdateExpressions.length > 0) {
      res += " ADD ";
      res += node.addUpdateExpressions
        .map((addUpdateExpression) => {
          return this.compileAddUpdateExpression(
            addUpdateExpression,
            updateExpressionAttributeValues,
            attributeNames
          );
        })
        .join(", ");
    }

    if (node.deleteUpdateExpressions.length > 0) {
      res += " DELETE ";
      res += node.deleteUpdateExpressions
        .map((deleteUpdateExpression) => {
          return this.compileDeleteUpdateExpression(
            deleteUpdateExpression,
            updateExpressionAttributeValues,
            attributeNames
          );
        })
        .join(", ");
    }

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
    updateExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) {
    const { function: functionNode } = functionExpression;
    let res = "";

    switch (functionNode.kind) {
      case "SetUpdateExpressionIfNotExistsFunction": {
        let rightValue = "";
        const offset = updateExpressionAttributeValues.size;
        const attributeValue = `:setUpdateExpressionValue${offset}`;

        if (functionNode.right.kind === "SetUpdateExpressionValue") {
          rightValue = attributeValue;

          updateExpressionAttributeValues.set(
            attributeValue,
            functionNode.right.value
          );
        } else {
          rightValue = this.compileSetUpdateExpressionFunction(
            functionNode.right,
            updateExpressionAttributeValues,
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
            updateExpressionAttributeValues,
            attributeNames
          );
        }

        const offset = updateExpressionAttributeValues.size;
        const attributeValue = `:setUpdateExpressionValue${offset}`;

        if (functionNode.right.kind === "SetUpdateExpressionValue") {
          rightValue = attributeValue;

          updateExpressionAttributeValues.set(
            attributeValue,
            functionNode.right.value
          );
        } else {
          rightValue = this.compileSetUpdateExpressionFunction(
            functionNode.right,
            updateExpressionAttributeValues,
            attributeNames
          );
        }

        res += `list_append(${leftValue}, ${rightValue})`;
        return res;
      }
    }
  }

  compileRemoveUpdateExpression(
    node: RemoveUpdateExpression,
    attributeNames: Map<string, string>
  ) {
    const { expressionAttributeName, attributeNameMap } =
      this.compileAttributeName(node.attribute);
    const attributeName = expressionAttributeName;
    mergeObjectIntoMap(attributeNames, attributeNameMap);
    return attributeName;
  }

  compileAddUpdateExpression(
    node: AddUpdateExpression,
    updateExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) {
    const { expressionAttributeName, attributeNameMap } =
      this.compileAttributeName(node.key);
    const attributeName = expressionAttributeName;
    mergeObjectIntoMap(attributeNames, attributeNameMap);

    const offset = updateExpressionAttributeValues.size;
    const attributeValue = `:addUpdateExpressionValue${offset}`;
    updateExpressionAttributeValues.set(attributeValue, node.value);

    return `${attributeName} ${attributeValue}`;
  }

  compileDeleteUpdateExpression(
    node: DeleteUpdateExpression,
    updateExpressionAttributeValues: Map<string, unknown>,
    attributeNames: Map<string, string>
  ) {
    const { expressionAttributeName, attributeNameMap } =
      this.compileAttributeName(node.key);

    const attributeName = expressionAttributeName;
    mergeObjectIntoMap(attributeNames, attributeNameMap);

    const offset = updateExpressionAttributeValues.size;
    const attributeValue = `:deleteUpdateExpressionValue${offset}`;
    updateExpressionAttributeValues.set(attributeValue, node.value);

    return `${attributeName} ${attributeValue}`;
  }
}
