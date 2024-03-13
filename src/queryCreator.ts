import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GetQueryBuilder } from "./queryBuilders/getItemQueryBuilder";
import {
  QueryQueryBuilder,
  QueryQueryBuilderInterface,
} from "./queryBuilders/queryQueryBuilder";

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
    });
  }

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
          kind: "FilterExpressionNode",
          expressions: [],
        },
      },
      ddbClient: this.#props.ddbClient,
    });
  }
}

export interface QueryCreatorProps {
  readonly ddbClient: DynamoDBDocumentClient;
}
