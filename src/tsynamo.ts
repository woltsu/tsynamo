import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCreator } from "./queryCreator";
import { QueryCompiler } from "./queryCompiler/queryCompiler";

export class Tsynamo<DDB> extends QueryCreator<DDB> {
  constructor(args: TsynamoProps) {
    const queryCompiler = new QueryCompiler();

    super({
      ...args,
      queryCompiler,
    });
  }
}

export interface TsynamoProps {
  readonly ddbClient: DynamoDBDocumentClient;
}
