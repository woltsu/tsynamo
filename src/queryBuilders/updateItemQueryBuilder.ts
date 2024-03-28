import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateExpressionOperands } from "../nodes/operands";
import { ReturnValuesOptions } from "../nodes/returnValuesNode";
import { SetUpdateExpressionFunction } from "../nodes/setUpdateExpressionFunction";
import { UpdateNode } from "../nodes/updateNode";
import { QueryCompiler } from "../queryCompiler";
import {
  ExecuteOutput,
  GetFromPath,
  ObjectKeyPaths,
  PickPk,
  PickSkRequired,
  StripKeys,
  PickNonKeys,
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
import { SetUpdateExpressionFunctionQueryBuilder } from "./setUpdateExpressionFunctionQueryBuilder";

export interface UpdateItemQueryBuilderInterface<
  DDB,
  Table extends keyof DDB,
  O
> {
  // conditionExpression
  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  // orConditionExpression
  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operand: UpdateExpressionOperands,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operand: Extract<UpdateExpressionOperands, "=">,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operand: Exclude<UpdateExpressionOperands, "=">,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => [SetUpdateExpressionFunction, number]
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  remove<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    attribute: Key
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  // TODO: add
  // TODO: delete?

  returnValues(
    option: ReturnValuesOptions
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  compile(): UpdateCommand;
  execute(): Promise<ExecuteOutput<O>[] | undefined>;
}

export class UpdateItemQueryBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements UpdateItemQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: UpdateItemQueryBuilderProps;

  constructor(props: UpdateItemQueryBuilderProps) {
    this.#props = props;
  }

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.conditionExpression },
    });

    const expressionNode = eB.expression(...args)._getNode();

    return new UpdateItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        conditionExpression: expressionNode,
      },
    });
  }

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.conditionExpression },
    });

    const expressionNode = eB.orExpression(...args)._getNode();

    return new UpdateItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        conditionExpression: expressionNode,
      },
    });
  }

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    ...args:
      | [
          key: Key,
          operand: UpdateExpressionOperands,
          value: StripKeys<GetFromPath<DDB[Table], Key>>
        ]
      | [
          key: Key,
          operand: Extract<UpdateExpressionOperands, "=">,
          value: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => SetUpdateExpressionFunction
        ]
      | [
          key: Key,
          operand: Exclude<UpdateExpressionOperands, "=">,
          value: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => [SetUpdateExpressionFunction, number]
        ]
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
    const [key, operand, right] = args;

    if (typeof right === "function") {
      const setUpdateExpressionBuilder =
        new SetUpdateExpressionFunctionQueryBuilder<DDB, Table, O>();

      if (operand === "=") {
        // TODO: Get rid of casting?
        const builder = right as (
          builder: SetUpdateExpressionFunctionQueryBuilder<
            DDB,
            Table,
            DDB[Table]
          >
        ) => SetUpdateExpressionFunction;

        const expression = builder(setUpdateExpressionBuilder);
        return new UpdateItemQueryBuilder<DDB, Table, O>({
          ...this.#props,
          node: {
            ...this.#props.node,
            updateExpression: {
              ...this.#props.node.updateExpression,
              setUpdateExpressions:
                this.#props.node.updateExpression.setUpdateExpressions.concat({
                  kind: "SetUpdateExpression",
                  operation: operand,
                  key,
                  right: expression,
                }),
            },
          },
        });
      } else {
        const builder = right as (
          builder: SetUpdateExpressionFunctionQueryBuilder<
            DDB,
            Table,
            DDB[Table]
          >
        ) => [SetUpdateExpressionFunction, number];

        const [expression, number] = builder(setUpdateExpressionBuilder);
        return new UpdateItemQueryBuilder<DDB, Table, O>({
          ...this.#props,
          node: {
            ...this.#props.node,
            updateExpression: {
              ...this.#props.node.updateExpression,
              setUpdateExpressions:
                this.#props.node.updateExpression.setUpdateExpressions.concat({
                  kind: "SetUpdateExpression",
                  operation: operand,
                  key,
                  right: expression,
                  value: number,
                }),
            },
          },
        });
      }
    } else {
      return new UpdateItemQueryBuilder<DDB, Table, O>({
        ...this.#props,
        node: {
          ...this.#props.node,
          updateExpression: {
            ...this.#props.node.updateExpression,
            setUpdateExpressions:
              this.#props.node.updateExpression.setUpdateExpressions.concat({
                kind: "SetUpdateExpression",
                operation: operand,
                key,
                right: {
                  kind: "SetUpdateExpressionValue",
                  value: right,
                },
              }),
          },
        },
      });
    }
  }

  remove<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    attribute: Key
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
    return new UpdateItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        updateExpression: {
          ...this.#props.node.updateExpression,
          removeUpdateExpressions:
            this.#props.node.updateExpression.removeUpdateExpressions.concat({
              kind: "RemoveUpdateExpression",
              attribute,
            }),
        },
      },
    });
  }

  returnValues(
    option: ReturnValuesOptions
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
    return new UpdateItemQueryBuilder<DDB, Table, O>({
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

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    keys: Keys
  ) {
    return new UpdateItemQueryBuilder<DDB, Table, O>({
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

  compile = (): UpdateCommand => {
    return this.#props.queryCompiler.compile(this.#props.node);
  };

  execute = async (): Promise<ExecuteOutput<O>[] | undefined> => {
    const putCommand = this.compile();
    const data = await this.#props.ddbClient.send(putCommand);
    return data.Attributes as any;
  };
}

preventAwait(
  UpdateItemQueryBuilder,
  "Don't await UpdateItemQueryBuilder instances directly. To execute the query you need to call the `execute` method"
);

interface UpdateItemQueryBuilderProps {
  readonly node: UpdateNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}
