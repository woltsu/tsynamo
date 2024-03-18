import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PutNode } from "../nodes/putNode";
import { QueryCompiler } from "../queryCompiler";
import { ExecuteOutput } from "../typeHelpers";
import { preventAwait } from "../util/preventAwait";
import { ReturnValuesOptions } from "../nodes/returnValuesNode";

export interface PutItemQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
  execute(): Promise<ExecuteOutput<O>[] | undefined>;

  returnValues(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): PutItemQueryBuilderInterface<DDB, Table, O>;

  item<Item extends ExecuteOutput<O>>(
    item: Item
  ): PutItemQueryBuilderInterface<DDB, Table, O>;
}

/**
 * @todo support ConditionExpression
 */
export class PutItemQueryBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements PutItemQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: PutItemQueryBuilderProps;

  constructor(props: PutItemQueryBuilderProps) {
    this.#props = props;
  }

  item<Item extends ExecuteOutput<O>>(
    item: Item
  ): PutItemQueryBuilderInterface<DDB, Table, O> {
    return new PutItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        item: {
          kind: "ItemNode",
          item,
        },
      },
    });
  }

  returnValues(
    option: ReturnValuesOptions
  ): PutItemQueryBuilderInterface<DDB, Table, O> {
    return new PutItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        returnValues: {
          kind: "ReturnValuesNode",
          option,
        },
      },
    });
  }

  execute = async (): Promise<ExecuteOutput<O>[] | undefined> => {
    const putCommand = this.#props.queryCompiler.compile(this.#props.node);
    const data = await this.#props.ddbClient.send(putCommand);
    return data.Attributes as any;
  };
}

preventAwait(
  PutItemQueryBuilder,
  "Don't await PutQueryBuilder instances directly. To execute the query you need to call the `execute` method"
);

interface PutItemQueryBuilderProps {
  readonly node: PutNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
