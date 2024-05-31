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
   * @param table Table to perform the get-item command to
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
   * @param table Table to perform the put item command to
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/PutItemCommand/
   */
  putItem<Table extends keyof DDB & string>(
    table: Table
  ): PutItemQueryBuilder<DDB, Table, DDB[Table]> {
    return new PutItemQueryBuilder<DDB, Table, DDB[Table]>({
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
   *
   * @param table Table to perform the delete item command to
   *
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/DeleteItemCommand/
   */
  deleteItem<Table extends keyof DDB & string>(
    table: Table
  ): DeleteItemQueryBuilder<DDB, Table, DDB[Table]> {
    return new DeleteItemQueryBuilder<DDB, Table, DDB[Table]>({
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
