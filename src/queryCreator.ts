import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DeleteItemQueryBuilder } from "./queryBuilders/deleteItemQueryBuilder";
import { GetQueryBuilder } from "./queryBuilders/getItemQueryBuilder";
import {
  PutItemQueryBuilder,
  PutItemQueryBuilderInterface,
} from "./queryBuilders/putItemQueryBuilder";
import {
  QueryQueryBuilder,
  QueryQueryBuilderInterface,
} from "./queryBuilders/queryQueryBuilder";
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
  getItemFrom<Table extends keyof DDB & string>(
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
  ): QueryQueryBuilderInterface<DDB, Table, DDB[Table]> {
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
  ): PutItemQueryBuilderInterface<DDB, Table, DDB[Table]> {
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
   * @param table Table to perform the put item command to
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
}

export interface QueryCreatorProps {
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
