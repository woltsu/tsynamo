import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetNode } from "../nodes/getNode";
import { QueryCompiler } from "../queryCompiler";
import {
  ExecuteOutput,
  ObjectFullPaths,
  PickPk,
  PickSkRequired,
  SelectAttributes,
} from "../typeHelpers";
import { preventAwait } from "../util/preventAwait";

export interface GetQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
  /**
   * An object of attribute names to attribute values, representing the primary key of the item to retrieve.
   *
   * For the primary key, you must provide all of the attributes. For example, with a simple primary key, you only need to provide a value for the partition key. For a composite primary key, you must provide values for both the partition key and the sort key.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .getItem("UserEvents")
   *  .keys({
   *     userId: "123", // partition key
   *     eventId: 222,  // sort key
   *   })
   *  .execute();
   * ```
   */
  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): GetQueryBuilder<DDB, Table, O>;

  /**
   * Determines the read consistency model: If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   *
   * set this to true, if you must have up-to-date data.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *  .getItem("myTable")
   *  .keys({
   *    userId: TEST_DATA[0].userId,
   *    dataTimestamp: TEST_DATA[0].dataTimestamp,
   *   })
   *  .consistentRead(true)
   *  .attributes(["somethingElse", "someBoolean"])
   *  .execute()
   * ```
   */
  consistentRead(enabled: boolean): GetQueryBuilder<DDB, Table, O>;

  /**
   * List of attributes to get from the table.
   * 
   * Example
   *
   * ```ts
   * await tsynamoClient
   *  .getItem("myTable")
   *  .keys({
   *    userId: TEST_DATA[0].userId,
   *    dataTimestamp: TEST_DATA[0].dataTimestamp,
   *   })
      .attributes(["someBoolean", "nested.nestedBoolean", "cats[1].age"])
   *  .execute()
   * ```
   */
  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): GetQueryBuilder<DDB, Table, SelectAttributes<DDB[Table], A>>;

  /**
   * Compiles into an DynamoDB DocumentClient Command.
   */
  compile(): GetCommand;
  /**
   * Executes the command and returns its output.
   */
  execute(): Promise<ExecuteOutput<O> | undefined>;
}

export class GetQueryBuilder<DDB, Table extends keyof DDB, O>
  implements GetQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: GetQueryBuilderProps;

  constructor(props: GetQueryBuilderProps) {
    this.#props = props;
  }

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    keys: Keys
  ): GetQueryBuilder<DDB, Table, O> {
    return new GetQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        keys: {
          kind: "KeysNode",
          keys,
        },
      },
    });
  }

  consistentRead(enabled: boolean): GetQueryBuilder<DDB, Table, O> {
    return new GetQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        consistentRead: {
          kind: "ConsistentReadNode",
          enabled,
        },
      },
    });
  }

  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): GetQueryBuilder<DDB, Table, SelectAttributes<DDB[Table], A>> {
    return new GetQueryBuilder({
      ...this.#props,
      node: {
        ...this.#props.node,
        attributes: {
          kind: "AttributesNode",
          attributes,
        },
      },
    }) as any;
  }

  compile(): GetCommand {
    return this.#props.queryCompiler.compile(this.#props.node);
  }

  execute = async (): Promise<ExecuteOutput<O> | undefined> => {
    const command = this.compile();
    const item = await this.#props.ddbClient.send(command);
    return (item.Item as ExecuteOutput<O>) ?? undefined;
  };

  public get node() {
    return this.#props.node;
  }
}

preventAwait(
  GetQueryBuilder,
  "Don't await GetQueryBuilder instances directly. To execute the query you need to call the `execute` method"
);

interface GetQueryBuilderProps {
  readonly node: GetNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
