import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { WriteTransactionNode } from "../nodes/writeTransactionNode";
import { QueryCompiler } from "../queryCompiler";
import { DeleteItemQueryBuilder } from "./deleteItemQueryBuilder";
import { PutItemQueryBuilder } from "./putItemQueryBuilder";
import { UpdateItemQueryBuilder } from "./updateItemQueryBuilder";

export interface WriteTransactionBuilderInterface<DDB> {
  /**
   * @todo add support for ConditionCheck items
   */
  addItem(item: {
    Put?: PutItemQueryBuilder<DDB, any, any>;
    Delete?: DeleteItemQueryBuilder<DDB, any, any>;
    Update?: UpdateItemQueryBuilder<DDB, any, any>;
  }): void;

  execute(): Promise<void>;
}

export class WriteTransactionBuilder<DDB>
  implements WriteTransactionBuilderInterface<DDB>
{
  readonly #props: WriteTransactionBuilderProps;

  constructor(props: WriteTransactionBuilderProps) {
    this.#props = props;
  }

  addItem(item: {
    Put?: PutItemQueryBuilder<DDB, any, any>;
    Delete?: DeleteItemQueryBuilder<DDB, any, any>;
    Update?: UpdateItemQueryBuilder<DDB, any, any>;
  }) {
    this.#props.node.transactWriteItems.push({
      kind: "TransactWriteItemNode",
      Put: item.Put?.node,
      Delete: item.Delete?.node,
      Update: item.Update?.node,
    });
  }

  async execute() {
    const transactionCommand = this.#props.queryCompiler.compile(
      this.#props.node
    );

    await this.#props.ddbClient.send(transactionCommand);
  }
}

interface WriteTransactionBuilderProps {
  readonly node: WriteTransactionNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
