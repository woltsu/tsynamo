import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DeleteItemQueryBuilder } from "./queryBuilders/deleteItemQueryBuilder";
import { GetQueryBuilder } from "./queryBuilders/getItemQueryBuilder";
import { PutItemQueryBuilder } from "./queryBuilders/putItemQueryBuilder";
import { QueryQueryBuilder } from "./queryBuilders/queryQueryBuilder";
import { ReadTransactionBuilder } from "./queryBuilders/readTransactionBuilder";
import { UpdateItemQueryBuilder } from "./queryBuilders/updateItemQueryBuilder";
import { WriteTransactionBuilder } from "./queryBuilders/writeTransactionBuilder";
import { QueryCompiler } from "./queryCompiler";

export class QueryCreator<DDB> {
  readonly #props: QueryCreatorProps;

  constructor(args: QueryCreatorProps) {
    this.#props = args;
  }

  /**
   *
   * Creates a GetItem Command to get items from the given DynamoDB table.
   *
   * The GetItem operation returns a set of attributes for the item with the given primary key. If there is no matching item, GetItem does not return any data and there will be no Item element in the response.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .getItem("UserEvents")
   *  .keys({
   *     userId: "123",
   *     eventId: 222,
   *   })
   *  .attributes(["userId"])
   *  .execute();
   * ```
   *
   * @param table DynamoDB Table name to perform the get-item command to
   *
   * @see https://docs.aws.amazon.com/cli/latest/reference/dynamodb/get-item.html
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/GetItemCommand/
   */
  getItem<Table extends keyof DDB & string>(
    table: Table
  ): GetQueryBuilder<DDB, Table, DDB[Table]> {
    return new GetQueryBuilder<DDB, Table, DDB[Table]>({
      node: {
        kind: "GetNode",
        table: {
          kind: "TableNode",
          table,
        },
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }

  /**
   *
   * Creates a Query Command to query items from the given DynamoDB table.
   *
   * You must provide the name of the partition key attribute and a single value for that attribute as a key condition. Query returns all items with that partition key value.
   *
   * Optionally, you can provide a sort key attribute and use a comparison operator to refine the search results.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   * .query("UserEvents")
   * .keyCondition("userId", "=", "123")
   * .filterExpression("eventType", "begins_with", "LOG")
   * .execute();
   * ```
   * @param table Table to perform the query command to
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/QueryCommand/
   */
  query<Table extends keyof DDB & string>(
    table: Table
  ): QueryQueryBuilder<DDB, Table, DDB[Table]> {
    return new QueryQueryBuilder<DDB, Table, DDB[Table]>({
      node: {
        kind: "QueryNode",
        table: {
          kind: "TableNode",
          table,
        },
        keyConditions: [],
        filterExpression: {
          kind: "ExpressionNode",
          expressions: [],
        },
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }

  /**
   *
   * Creates a Put Item Command to put items in the given DynamoDB table.
   *
   * Creates a new item, or replaces an old item with a new item. If an item that has the same primary key as the new item already exists in the specified table, the new item completely replaces the existing item.
   *
   * You can perform a conditional put operation (add a new item if one with the specified primary key doesn't exist), or replace an existing item if it has certain attribute values. You can return the item's attribute values in the same operation, using the returnValues function.
   *
   * When you add an item, the primary key attributes are the only required attributes.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   * .putItem("myTable")
   * .item({
   *   userId: "123",
   *   eventId: 313,
   *  })
   * .conditionExpression("userId", "attribute_not_exists")
   * .execute();
   * ```
   * @param table Table to perform the put item command to
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/PutItemCommand/
   */
  putItem<Table extends keyof DDB & string, O>(
    table: Table
  ): PutItemQueryBuilder<DDB, Table, O> {
    return new PutItemQueryBuilder({
      node: {
        kind: "PutNode",
        table: {
          kind: "TableNode",
          table,
        },
        conditionExpression: {
          kind: "ExpressionNode",
          expressions: [],
        },
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }

  /**
   * Creates a Delete Item command to the given DynamoDB Table.
   *
   * Deletes a single item in a table by primary key. You can perform a conditional delete operation that deletes the item if it exists, or if it has an expected attribute value.
   *
   * In addition to deleting an item, you can also return the item's attribute values in the same operation, using the returnValues function.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   * .deleteItem("myTable")
   * .keys({
   *   userId: "123",
   *   eventId: 313,
   * })
   * .conditionExpression("eventType", "attribute_not_exists")
   * .execute();
   * ```
   * @param table Table to perform the delete item command to
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/DeleteItemCommand/
   */
  deleteItem<Table extends keyof DDB & string, O>(
    table: Table
  ): DeleteItemQueryBuilder<DDB, Table, O> {
    return new DeleteItemQueryBuilder({
      node: {
        kind: "DeleteNode",
        table: {
          kind: "TableNode",
          table,
        },
        conditionExpression: {
          kind: "ExpressionNode",
          expressions: [],
        },
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }

  /**
   *
   * Creates an Update Item Command to the given DynamoDB table.
   *
   * Edits an existing item's attributes, or adds a new item to the table if it does not already exist. You can put, delete, or add attribute values. You can also perform a conditional update on an existing item (insert a new attribute name-value pair if it doesn't exist, or replace an existing name-value pair if it has certain expected attribute values).
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   * .updateItem("myTable")
   * .keys({ userId: "1", dataTimestamp: 2 })
   * .set("nested.nestedBoolean", "=", true)
   * .remove("nested.nestedString")
   * .add("somethingElse", 10)
   * .add("someSet", new Set(["4", "5"]))
   * .delete("nested.nestedSet", new Set(["4", "5"]))
   * .conditionExpression("somethingElse", ">", 0)
   * .execute();
   * ```
   * @param table Table to perform the update item command to
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/UpdateItemCommand/
   */
  updateItem<Table extends keyof DDB & string>(
    table: Table
  ): UpdateItemQueryBuilder<DDB, Table, DDB[Table]> {
    return new UpdateItemQueryBuilder<DDB, Table, DDB[Table]>({
      node: {
        kind: "UpdateNode",
        table: {
          kind: "TableNode",
          table,
        },
        conditionExpression: {
          kind: "ExpressionNode",
          expressions: [],
        },
        updateExpression: {
          kind: "UpdateExpression",
          setUpdateExpressions: [],
          removeUpdateExpressions: [],
          addUpdateExpressions: [],
          deleteUpdateExpressions: [],
        },
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }

  /**
   * Returns a builder that can be used to group many different write
   * operations together and execute them in a transaction.
   *
   * @param clientRequestToken
   * From AWS documentation: Providing a ClientRequestToken makes the call to TransactWriteItems idempotent, meaning that multiple identical calls have the same effect as one single call.
   * Although multiple identical calls using the same client request token produce the same result on the server (no side effects), the responses to the calls might not be the same. If the ReturnConsumedCapacity parameter is set, then the initial TransactWriteItems call returns the amount of write capacity units consumed in making the changes. Subsequent TransactWriteItems calls with the same client token return the number of read capacity units consumed in reading the item.
   * A client request token is valid for 10 minutes after the first request that uses it is completed. After 10 minutes, any request with the same client token is treated as a new request. Do not resubmit the same request with the same client token for more than 10 minutes, or the result might not be idempotent.
   * If you submit a request with the same client token but a change in other parameters within the 10-minute idempotency window, DynamoDB returns an IdempotentParameterMismatch exception.
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/TransactWriteItemsCommand/
   */
  createWriteTransaction(clientRequestToken?: string) {
    return new WriteTransactionBuilder<DDB>({
      node: {
        kind: "WriteTransactionNode",
        transactWriteItems: [],
        clientRequestToken,
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }

  /**
   * Returns a builder that can be used to group many different get
   * operations together and execute them in a transaction.
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/TransactGetItemsCommand/
   */
  createReadTransaction() {
    return new ReadTransactionBuilder<DDB>({
      node: {
        kind: "ReadTransactionNode",
        transactGetItems: [],
      },
      ddbClient: this.#props.ddbClient,
      queryCompiler: this.#props.queryCompiler,
    });
  }
}

export interface QueryCreatorProps {
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
