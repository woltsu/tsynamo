import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCreator } from "./queryCreator";
import { QueryCompiler } from "./queryCompiler/queryCompiler";
/**
 * The main Tsynamo class.
 * Create instance of Tsynamo using the {@link Tsynamo} constructor.
 *
 * Examples
 * ```ts
 * import { PartitionKey, SortKey } from "tsynamo";
 * import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
 * import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
 *
 * interface DDB {
 *   UserEvents: {
 *    userId: PartitionKey<string>;
 *    eventId: SortKey<number>;
 *    eventType: string;
 *    userAuthenticated: boolean;
 *  };
 * };
 *
 * const ddbClient = DynamoDBDocumentClient.from(
 *   new DynamoDBClient({
 *     \/* Configure client... *\/
 *   })
 * );
 * const tsynamoClient = new Tsynamo<DDB>({
 *  ddbClient,
 * });
 * ```
 */
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
