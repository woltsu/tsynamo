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

  // NOTE: List append can also be func func or val val or func val or val func :-)
  /* listAppend<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
  ): SetUpdateExpressionFunction;

  listAppend<Key extends ObjectKeyPaths<DDB[Table]>>(
    key: Key,
    value: (
      builder: SetUpdateExpressionFunctionQueryBuilder<DDB, Table, DDB[Table]>
    ) => SetUpdateExpressionFunction
  ): SetUpdateExpressionFunction; */
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
}
