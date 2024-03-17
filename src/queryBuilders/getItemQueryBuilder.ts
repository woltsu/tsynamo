import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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
  ): GetQueryBuilderInterface<DDB, Table, O>;

  consistentRead(enabled: boolean): GetQueryBuilderInterface<DDB, Table, O>;

  attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(
    attributes: A
  ): GetQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;

  execute(): Promise<ExecuteOutput<O> | undefined>;
}

export class GetQueryBuilder<DDB, Table extends keyof DDB, O extends DDB[Table]>
  implements GetQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: GetQueryBuilderProps;

  constructor(props: GetQueryBuilderProps) {
    this.#props = props;
  }

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    keys: Keys
  ) {
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

  consistentRead(enabled: boolean): GetQueryBuilderInterface<DDB, Table, O> {
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
  ): GetQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>> {
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

  execute = async (): Promise<ExecuteOutput<O> | undefined> => {
    const command = this.#props.queryCompiler.compile(this.#props.node);
    const item = await this.#props.ddbClient.send(command);
    return (item.Item as ExecuteOutput<O>) ?? undefined;
  };
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
