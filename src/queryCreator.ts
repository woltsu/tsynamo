import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DeleteItemQueryBuilder } from "./queryBuilders/deleteItemQueryBuilder";
import { GetQueryBuilder } from "./queryBuilders/getItemQueryBuilder";
import { PutItemQueryBuilder } from "./queryBuilders/putItemQueryBuilder";
import { QueryQueryBuilder } from "./queryBuilders/queryQueryBuilder";
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
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/TransactWriteItemsCommand/
   */
  createWriteTransaction() {
    return new WriteTransactionBuilder<DDB>({
      node: {
        kind: "WriteTransactionNode",
        transactWriteItems: [],
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
