import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCreator } from "./queryCreator";

export class Tsynamo<DDB> extends QueryCreator<DDB> {
  constructor(args: TsynamoProps) {
    super(args);
  }
}

export interface TsynamoProps {
  readonly ddbClient: DynamoDBDocumentClient;
}
