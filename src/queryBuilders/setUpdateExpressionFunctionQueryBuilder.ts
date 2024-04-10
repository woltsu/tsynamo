import exp from "constants";
import { SetUpdateExpressionFunction } from "../nodes/setUpdateExpressionFunction";
import { GetFromPath, ObjectKeyPaths, StripKeys } from "../typeHelpers";

export interface SetUpdateExpressionFunctionQueryBuilderInterface<
  DDB,
  Table extends keyof DDB,
  O
> {
  ifNotExists<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): SetUpdateExpressionFunction;

  ifNotExists<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction
  ): SetUpdateExpressionFunction;

  listAppend<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): SetUpdateExpressionFunction;

  listAppend<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction
  ): SetUpdateExpressionFunction;

  listAppend<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): SetUpdateExpressionFunction;

  listAppend(
    key: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction
  ): SetUpdateExpressionFunction;
}

export class SetUpdateExpressionFunctionQueryBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements SetUpdateExpressionFunctionQueryBuilderInterface<DDB, Table, O>
{
  private node?: SetUpdateExpressionFunction;

  ifNotExists<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args:
      | [key: Key, value: StripKeys<GetFromPath<DDB[Table], Key>>]
      | [
          key: Key,
          value: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => SetUpdateExpressionFunction
        ]
  ) {
    const [key, right] = args;

    if (typeof right === "function") {
      const setUpdateExpressionBuilder =
        new SetUpdateExpressionFunctionQueryBuilder<DDB, Table, O>();

      const builder = right as (
        builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
      ) => SetUpdateExpressionFunction;

      const expression = builder(setUpdateExpressionBuilder);

      this.node = {
        kind: "SetUpdateExpressionFunction",
        function: {
          kind: "SetUpdateExpressionIfNotExistsFunction",
          path: key,
          right: expression,
        },
      };
    } else {
      this.node = {
        kind: "SetUpdateExpressionFunction",
        function: {
          kind: "SetUpdateExpressionIfNotExistsFunction",
          path: key,
          right: {
            kind: "SetUpdateExpressionValue",
            value: right,
          },
        },
      };
    }

    return this.node;
  }

  listAppend<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args:
      | [key: Key, value: StripKeys<GetFromPath<DDB[Table], Key>>]
      | [
          key: Key,
          value: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => SetUpdateExpressionFunction
        ]
      | [
          key: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => SetUpdateExpressionFunction,
          value: StripKeys<GetFromPath<DDB[Table], Key>>
        ]
      | [
          key: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => SetUpdateExpressionFunction,
          value: (
            builder: SetUpdateExpressionFunctionQueryBuilder<
              DDB,
              Table,
              DDB[Table]
            >
          ) => SetUpdateExpressionFunction
        ]
  ) {
    const [left, right] = args;

    if (typeof left === "function" && typeof right === "function") {
      const setUpdateExpressionBuilderA =
        new SetUpdateExpressionFunctionQueryBuilder<DDB, Table, O>();

      const setUpdateExpressionBuilderB =
        new SetUpdateExpressionFunctionQueryBuilder<DDB, Table, O>();

      const builderLeft = left as (
        builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
      ) => SetUpdateExpressionFunction;

      const builderRight = right as (
        builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
      ) => SetUpdateExpressionFunction;

      const exprLeft = builderLeft(setUpdateExpressionBuilderA);
      const exprRight = builderRight(setUpdateExpressionBuilderB);

      this.node = {
        kind: "SetUpdateExpressionFunction",
        function: {
          kind: "SetUpdateExpressionListAppendFunction",
          left: exprLeft,
          right: exprRight,
        },
      };
    } else if (typeof left === "function") {
      const setUpdateExpressionBuilder =
        new SetUpdateExpressionFunctionQueryBuilder<DDB, Table, O>();

      const builder = left as (
        builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
      ) => SetUpdateExpressionFunction;

      const expr = builder(setUpdateExpressionBuilder);

      this.node = {
        kind: "SetUpdateExpressionFunction",
        function: {
          kind: "SetUpdateExpressionListAppendFunction",
          left: expr,
          right: {
            kind: "SetUpdateExpressionValue",
            value: right,
          },
        },
      };
    } else if (typeof right === "function") {
      const setUpdateExpressionBuilder =
        new SetUpdateExpressionFunctionQueryBuilder<DDB, Table, O>();

      const builder = right as (
        builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
      ) => SetUpdateExpressionFunction;

      const expr = builder(setUpdateExpressionBuilder);

      this.node = {
        kind: "SetUpdateExpressionFunction",
        function: {
          kind: "SetUpdateExpressionListAppendFunction",
          left,
          right: expr,
        },
      };
    } else {
      this.node = {
        kind: "SetUpdateExpressionFunction",
        function: {
          kind: "SetUpdateExpressionListAppendFunction",
          left,
          right: {
            kind: "SetUpdateExpressionValue",
            value: right,
          },
        },
      };
    }

    return this.node;
  }
}
