import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetNode } from "../nodes/getNode";
import {
  PickPk,
  PickSkRequired,
  SelectAttributes,
  StripKeys,
} from "../typeHelpers";

export interface GetQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): GetQueryBuilderInterface<DDB, Table, O>;

  consistentRead(enabled: boolean): GetQueryBuilderInterface<DDB, Table, O>;

  attributes<A extends ReadonlyArray<keyof DDB[Table]> & string[]>(
    attributes: A
  ): GetQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;

  execute(): Promise<StripKeys<O> | undefined>;
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

  attributes<A extends readonly (keyof DDB[Table])[] & string[]>(
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
    });
  }

  execute = async (): Promise<StripKeys<O> | undefined> => {
    const command = new GetCommand({
      TableName: this.#props.node.table?.table,
      Key: this.#props.node.keys?.keys,
      ConsistentRead: this.#props.node.consistentRead?.enabled,
      AttributesToGet: this.#props.node.attributes?.attributes,
    });

    const item = await this.#props.ddbClient.send(command);

    return (item.Item as O) ?? undefined;
  };
}

interface GetQueryBuilderProps {
  readonly node: GetNode;
  readonly ddbClient: DynamoDBDocumentClient;
}
