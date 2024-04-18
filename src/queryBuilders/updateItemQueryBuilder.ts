import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateExpressionOperands } from "../nodes/operands";
import { ReturnValuesOptions } from "../nodes/returnValuesNode";
import { SetUpdateExpressionFunction } from "../nodes/setUpdateExpressionFunction";
import { UpdateNode } from "../nodes/updateNode";
import { QueryCompiler } from "../queryCompiler";
import {
  ExecuteOutput,
  FilteredKeys,
  GetFromPath,
  ObjectKeyPaths,
  PickNonKeys,
  PickPk,
  PickSkRequired,
  StripKeys,
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
  O extends DDB[Table]
> {
  // conditionExpression
  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  // orConditionExpression
  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operand: UpdateExpressionOperands,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operand: Extract<UpdateExpressionOperands, "=">,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  set<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    key: Key,
    operand: Exclude<UpdateExpressionOperands, "=">,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => [SetUpdateExpressionFunction, number]
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  // TODO: Make it possible to delete a whole object, and not just nested keys
  remove<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    attribute: Key
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  add<
    Key extends ObjectKeyPaths<
      FilteredKeys<PickNonKeys<DDB[Table]>, Set<unknown> | number>
    >
  >(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  delete<
    Key extends ObjectKeyPaths<
      FilteredKeys<PickNonKeys<DDB[Table]>, Set<unknown>>
    >
  >(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilder<DDB, Table, O>;

  returnValues(
    option: ReturnValuesOptions
  ): UpdateItemQueryBuilder<DDB, Table, O>;

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
  ): UpdateItemQueryBuilder<DDB, Table, O> {
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
  ): UpdateItemQueryBuilder<DDB, Table, O> {
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
  ): UpdateItemQueryBuilder<DDB, Table, O> {
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
  ): UpdateItemQueryBuilder<DDB, Table, O> {
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

  add<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilder<DDB, Table, O> {
    return new UpdateItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        updateExpression: {
          ...this.#props.node.updateExpression,
          addUpdateExpressions:
            this.#props.node.updateExpression.addUpdateExpressions.concat({
              kind: "AddUpdateExpression",
              key: attribute,
              value,
            }),
        },
      },
    });
  }

  delete<
    Key extends ObjectKeyPaths<FilteredKeys<PickNonKeys<DDB[Table]>, Set<any>>>
  >(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilder<DDB, Table, O> {
    return new UpdateItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        updateExpression: {
          ...this.#props.node.updateExpression,
          deleteUpdateExpressions:
            this.#props.node.updateExpression.deleteUpdateExpressions.concat({
              kind: "DeleteUpdateExpression",
              key: attribute,
              value,
            }),
        },
      },
    });
  }

  returnValues(
    option: ReturnValuesOptions
  ): UpdateItemQueryBuilder<DDB, Table, O> {
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

  public get node() {
    return this.#props.node;
  }
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
