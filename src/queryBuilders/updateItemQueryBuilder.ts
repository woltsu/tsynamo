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
  O
> {
  /**
   * A condition that must be satisfied in order for a UpdateItem operation to be executed.
   *
   * Multiple conditionExpressions are added as `AND` statements. see {@link orConditionExpression} for `OR` statements.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *  .updateItem("myTable")
   *  .keys({
   *     userId: "333",
   *     dataTimestamp: 222,
   *    })
   *   .remove("somethingElse")
   *   .conditionExpression("tags", "contains", "meow")
   *   .execute()
   * ```
   */
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

  /**
   * A {@link conditionExpression} that is concatenated as an OR statement.
   *
   * A condition that must be satisfied in order for a UpdateItem operation to be executed.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *  .updateItem("myTable")
   *  .keys({
   *     userId: "333",
   *     dataTimestamp: 222,
   *    })
   *   .remove("somethingElse")
   *   .conditionExpression("tags", "contains", "meow")
   *   .orConditionExpression("somethingElse", ">", 0)
   *   .execute()
   * ```
   */
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

  /**
   * Adds an SET action to the UpdateItem statement.
   *
   * SET adds one or more attributes and values to an item. If any of these attributes already exist, they are replaced by the new values. You can also use SET to add or subtract from an attribute that is of type Number.
   *
   * SET supports the following functions:
   *
   *  - if_not_exists (path, operand) - if the item does not contain an attribute at the specified path, then if_not_exists evaluates to operand; otherwise, it evaluates to path. You can use this function to avoid overwriting an attribute that may already be present in the item.
   *
   *  - list_append (operand, operand) - evaluates to a list with a new element added to it. You can append the new element to the start or the end of the list by reversing the order of the operands.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .updateItem("myTable")
   *  .keys({ userId: "1", dataTimestamp: 2 })
   *  .set("someBoolean", "=", (qb) => {
   *    return qb.ifNotExists("someBoolean", true);
   *  })
   *  .set("tags", "=", (qb) => {
   *    return qb.listAppend(
   *      (qbb) => qbb.ifNotExists("tags", []),
   *      ["test_tag"]
   *    );
   *  })
   *  .set("somethingElse", "+=", (qb) => {
   *    return [qb.ifNotExists("somethingElse", 1), 2];
   *  })
   *  .returnValues("ALL_NEW")
   *  .execute();
   * ```
   */
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
  /**
   * An object of attribute names to attribute values, representing the primary key of the item to update.
   *
   * For the primary key, you must provide all of the attributes. For example, with a simple primary key, you only need to provide a value for the partition key. For a composite primary key, you must provide values for both the partition key and the sort key.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .updateItem("myTable")
   *  .keys({
   *     userId: "123", // partition key
   *     eventId: 222,  // sort key
   *   })
   *  .execute();
   * ```
   */
  keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(
    pk: Keys
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  // TODO: Make it possible to delete a whole object, and not just nested keys
  /**
   * Adds an REMOVE action to the UpdateItem statement.
   *
   * Removes attributes from the item.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .updateItem("myTable")
   *  .keys({ userId: "1010", dataTimestamp: 200 })
   *  .remove("somethingElse")
   *  .execute();
   * ```
   */
  remove<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    attribute: Key
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;
  /**
   * Adds an ADD action to the UpdateItem statement.
   *
   * Adds the specified value to the item, if the attribute does not already exist. If the attribute does exist, then the behavior of ADD depends on the data type of the attribute:
   *
   * If the existing attribute is a number, and if Value is also a number, then Value is mathematically added to the existing attribute. If Value is a negative number, then it is subtracted from the existing attribute.
   *
   * If you use ADD to increment or decrement a number value for an item that doesn't exist before the update, DynamoDB uses 0 as the initial value.
   *
   * Similarly, if you use ADD for an existing item to increment or decrement an attribute value that doesn't exist before the update, DynamoDB uses 0 as the initial value. For example, suppose that the item you want to update doesn't have an attribute named itemcount, but you decide to ADD the number 3 to this attribute anyway. DynamoDB will create the itemcount attribute, set its initial value to 0, and finally add 3 to it. The result will be a new itemcount attribute in the item, with a value of 3.
   *
   * If the existing data type is a set and if Value is also a set, then Value is added to the existing set. For example, if the attribute value is the set [1,2], and the ADD action specified [3], then the final attribute value is [1,2,3]. An error occurs if an ADD action is specified for a set attribute and the attribute type specified does not match the existing set type.
   *
   * Both sets must have the same primitive data type. For example, if the existing data type is a set of strings, the Value must also be a set of strings.
   *
   * The ADD action only supports Number and set data types. In addition, ADD can only be used on top-level attributes, not nested attributes.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .updateItem("myTable")
   *  .keys({ userId: "1010", dataTimestamp: 200 })
   *  .add("somethingElse", 7)
   *  .add("someSet", new Set(["item1", "item2"]))
   *  .execute();
   * ```
   */
  add<
    Key extends ObjectKeyPaths<
      FilteredKeys<PickNonKeys<DDB[Table]>, Set<unknown> | number>
    >
  >(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;

  /**
   * Adds an DELETE action to the UpdateItem statement.
   *
   * DELETE - Deletes an element from a set.
   *
   * If a set of values is specified, then those values are subtracted from the old set. For example, if the attribute value was the set [a,b,c] and the DELETE action specifies [a,c], then the final attribute value is [b]. Specifying an empty set is an error.
   *
   * The DELETE action only supports set data types. In addition, DELETE can only be used on top-level attributes, not nested attributes.
   *
   * Example
   *
   * ```ts
   *  await tsynamoClient
   *  .updateItem("myTable")
   *  .keys({ userId: "1010", dataTimestamp: 200 })
   *  .delete("someSet", new Set(["2", "3"]))
   *  .execute();
   * ```
   */
  delete<
    Key extends ObjectKeyPaths<
      FilteredKeys<PickNonKeys<DDB[Table]>, Set<unknown>>
    >
  >(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;
  /**
   *
   * Use returnValues if you want to get the item attributes as they appear before or after they are successfully updated. For UpdateItem, the valid values are:
   *
   * - NONE - If returnValues is not specified, or if its value is NONE, then nothing is returned. (This setting is the default for returnValues.)
   *
   * - ALL_OLD - Returns all of the attributes of the item, as they appeared before the UpdateItem operation.
   *
   * - UPDATED_OLD - Returns only the updated attributes, as they appeared before the UpdateItem operation.
   *
   * - ALL_NEW - Returns all of the attributes of the item, as they appear after the UpdateItem operation.
   *
   * - UPDATED_NEW - Returns only the updated attributes, as they appear after the UpdateItem operation.
   */
  returnValues(
    option: ReturnValuesOptions
  ): UpdateItemQueryBuilderInterface<DDB, Table, O>;
  /**
   * Compiles into an DynamoDB DocumentClient Command.
   */
  compile(): UpdateCommand;
  /**
   * Executes the command and returns its output.
   */
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

  add<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(
    attribute: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
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
  ): UpdateItemQueryBuilderInterface<DDB, Table, O> {
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
