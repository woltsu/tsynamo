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
  O
> {
  // conditionExpression
  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  // orConditionExpression
  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  returnValues(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  returnValuesOnConditionCheckFailure(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): DeleteItemQueryBuilderInterface<DDB, Table, O>;

  compile(): DeleteCommand;
  execute(): Promise<ExecuteOutput<O>[] | undefined>;
}

/**
 * @todo support ReturnValuesOnConditionCheckFailure
 */
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
  ): DeleteItemQueryBuilderInterface<DDB, Table, O> {
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
  ): DeleteItemQueryBuilderInterface<DDB, Table, O> {
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
  ): DeleteItemQueryBuilderInterface<DDB, Table, O> {
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
  ): DeleteItemQueryBuilderInterface<DDB, Table, O> {
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
