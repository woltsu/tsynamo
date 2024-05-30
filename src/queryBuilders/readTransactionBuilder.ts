import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ReadTransactionNode } from "../nodes/readTransactionNode";
import { QueryCompiler } from "../queryCompiler";
import { GetQueryBuilder } from "./getItemQueryBuilder";

/**
 * @todo What to show as return type?
 */
export interface ReadTransactionBuilderInterface<DDB> {
  addItem<Table extends keyof DDB, O extends DDB[Table]>(item: {
    Get: GetQueryBuilder<DDB, Table, O>;
  }): void;

  execute(): Promise<unknown[]>;
}

export class ReadTransactionBuilder<DDB>
  implements ReadTransactionBuilderInterface<DDB>
{
  readonly #props: ReadTransactionBuilderProps;

  constructor(props: ReadTransactionBuilderProps) {
    this.#props = props;
  }

  addItem(item: { Get: GetQueryBuilder<DDB, any, any> }) {
    this.#props.node.transactGetItems.push({
      kind: "TransactGetItemNode",
      Get: item.Get.node,
    });
  }

  async execute() {
    const transactionCommand = this.#props.queryCompiler.compile(
      this.#props.node
    );

    return (
      await this.#props.ddbClient.send(transactionCommand)
    ).Responses?.map((o) => o.Item) as unknown[];
  }
}

interface ReadTransactionBuilderProps {
  readonly node: ReadTransactionNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
