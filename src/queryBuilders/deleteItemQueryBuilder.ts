import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DeleteNode } from "../nodes/deleteNode";
import { ReturnValuesOptions } from "../nodes/returnValuesNode";
import { QueryCompiler } from "../queryCompiler";
import {
  ExecuteOutput,
  ObjectKeyPaths,
  PickPk,
  PickSkRequired,
} from "../typeHelpers";
import { preventAwait } from "../util/preventAwait";
import {
  AttributeBeginsWithExprArg,
  AttributeBetweenExprArg,
  AttributeContainsExprArg,
  AttributeFuncExprArg,
  BuilderExprArg,
  ComparatorExprArg,
  ExprArgs,
  ExpressionBuilder,
  NotExprArg,
} from "./expressionBuilder";

export interface DeleteItemQueryBuilderInterface<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> {
  /**
   * A condition that must be satisfied in order for a DeleteItem operation to be executed.
   *
   * Multiple conditionExpressions are added as `AND` statements. see {@link orConditionExpression} for `OR` statements.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .deleteItem("myTable")
   *   .keys({
   *     userId: "333",
   *     dataTimestamp: 222,
   *    })
   *   .conditionExpression("tags", "contains", "meow")
   *   .execute()
   * ```
   */
  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  /**
   * A {@link conditionExpression} that is concatenated as an OR statement.
   *
   * A condition that must be satisfied in order for a DeleteItem operation to be executed.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .putItem("myTable")
   *   .item({
   *     userId: "333",
   *     dataTimestamp: 222,
   *     someBoolean: true,
   *    })
   *   .conditionExpression("userId", "attribute_not_exists")
   *   .orConditionExpression("someBoolean", "attribute_exists")
   *   .execute()
   * ```
   */
  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  // TODO: returnValues should probably just be `returnValues()` without any parameters as ALL_OLD is the only value it takes.

  /**
   *
   * Use this if you want to get the item attributes as they appeared before they were updated with the PutItem request.
   *
   * The valid values are:
   *
   *  - NONE - If returnValues is not specified, or if its value is NONE, then nothing is returned. (This setting is the default.)
   *
   *  - ALL_OLD - If PutItem overwrote an attribute name-value pair, then the content of the old item is returned.
   *
   * The values returned are strongly consistent.
   */
  returnValues(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  /**
   *
   * Returns the item attributes for a DeleteItem operation that failed a condition check.
   */
  returnValuesOnConditionCheckFailure(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  /**
   * An object of attribute names to attribute values, representing the primary key of the item to delete.
   *
   * For the primary key, you must provide all of the attributes. For example, with a simple primary key, you only need to provide a value for the partition key. For a composite primary key, you must provide values for both the partition key and the sort key.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .deleteItem("myTable")
   *  .keys({
   *     userId: "123", // partition key
   *     eventId: 222,  // sort key
   *   })
   *  .execute();
   * ```
   */
  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): DeleteItemQueryBuilder<DDB, Table, O>;

  /**
   * Compiles into an DynamoDB DocumentClient Command.
   */
  compile(): DeleteCommand;
  /**
   * Executes the command and returns its output.
   */
  execute(): Promise<ExecuteOutput<O>[] | undefined>;
}

export class DeleteItemQueryBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements DeleteItemQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: DeleteItemQueryBuilderProps;

  constructor(props: DeleteItemQueryBuilderProps) {
    this.#props = props;
  }

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.conditionExpression },
    });

    const expressionNode = eB.expression(...args)._getNode();

    return new DeleteItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        conditionExpression: expressionNode,
      },
    });
  }

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): DeleteItemQueryBuilder<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.conditionExpression },
    });

    const expressionNode = eB.orExpression(...args)._getNode();

    return new DeleteItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        conditionExpression: expressionNode,
      },
    });
  }

  returnValues(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): DeleteItemQueryBuilder<DDB, Table, O> {
    return new DeleteItemQueryBuilder<DDB, Table, O>({
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

  returnValuesOnConditionCheckFailure(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): DeleteItemQueryBuilder<DDB, Table, O> {
    return new DeleteItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        returnValuesOnConditionCheckFailure: {
          kind: "ReturnValuesNode",
          option,
        },
      },
    });
  }

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    keys: Keys
  ) {
    return new DeleteItemQueryBuilder<DDB, Table, O>({
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

  compile = (): DeleteCommand => {
    return this.#props.queryCompiler.compile(this.#props.node);
  };

  execute = async (): Promise<ExecuteOutput<O>[] | undefined> => {
    const deleteCommand = this.compile();
    const data = await this.#props.ddbClient.send(deleteCommand);
    return data.Attributes as any;
  };

  public get node() {
    return this.#props.node;
  }
}

preventAwait(
  DeleteItemQueryBuilder,
  "Don't await DeleteItemQueryBuilder instances directly. To execute the query you need to call the `execute` method"
);

interface DeleteItemQueryBuilderProps {
  readonly node: DeleteNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
