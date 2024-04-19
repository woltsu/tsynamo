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
  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): GetQueryBuilder<DDB, Table, O>;

  consistentRead(enabled: boolean): GetQueryBuilder<DDB, Table, O>;

  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): GetQueryBuilder<DDB, Table, SelectAttributes<DDB[Table], A>>;

  compile(): GetCommand;
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
