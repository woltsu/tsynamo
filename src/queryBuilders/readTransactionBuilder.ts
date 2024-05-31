import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ReadTransactionNode } from "../nodes/readTransactionNode";
import { QueryCompiler } from "../queryCompiler";
import { AllTuples } from "../typeHelpers";
import { GetQueryBuilder } from "./getItemQueryBuilder";

export interface ReadTransactionBuilderInterface<DDB> {
  addItem<Table extends keyof DDB, O extends DDB[Table]>(item: {
    Get: GetQueryBuilder<DDB, Table, O>;
  }): void;

  /**
   * The return value is an array of tuples, where the first item
   * tells the name of the table, and the right item is the result
   * item itself (or undefined if not found). The table can be used
   * for discriminated union to determine the actual type of the result
   * item.
   */
  execute(): Promise<AllTuples<DDB>[]>;
}

export class ReadTransactionBuilder<DDB>
  implements ReadTransactionBuilderInterface<DDB>
{
  readonly #props: ReadTransactionBuilderProps;
  resultTables: string[] = [];

  constructor(props: ReadTransactionBuilderProps) {
    this.#props = props;
  }

  addItem(item: { Get: GetQueryBuilder<DDB, any, any> }) {
    this.resultTables.push(item.Get.node.table.table);

    this.#props.node.transactGetItems.push({
      kind: "TransactGetItemNode",
      Get: item.Get.node,
    });
  }

  async execute(): Promise<AllTuples<DDB>[]> {
    const transactionCommand = this.#props.queryCompiler.compile(
      this.#props.node
    );

    return (
      await this.#props.ddbClient.send(transactionCommand)
    ).Responses?.map((o, i) => [
      this.resultTables[i],
      o.Item,
    ]) as AllTuples<DDB>[];
  }
}

interface ReadTransactionBuilderProps {
  readonly node: ReadTransactionNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
