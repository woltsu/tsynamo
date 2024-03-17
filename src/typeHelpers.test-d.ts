import { SelectAttributes, type ObjectFullPaths } from "./typeHelpers";

describe("typeHelpers typecheck", () => {
  it("ObjectFullPaths typecheck", () => {
    type empty = ObjectFullPaths<{}>;
    expectTypeOf<empty>().toEqualTypeOf<never>();

    type simpleObject = ObjectFullPaths<{ key: string; anotherKey: number }>;
    expectTypeOf<simpleObject>().toEqualTypeOf<"key" | "anotherKey">();

    type nestedObject = ObjectFullPaths<{ key: { nested: string } }>;
    expectTypeOf<nestedObject>().toEqualTypeOf<"key" | "key.nested">();

    type deepNested = ObjectFullPaths<{
      key: { n: { nn: { nnn: { nnnn: string } } } };
    }>;
    expectTypeOf<deepNested>().toEqualTypeOf<
      "key" | "key.n" | "key.n.nn" | "key.n.nn.nnn" | "key.n.nn.nnn.nnnn"
    >();

    type array = ObjectFullPaths<{ array: string[] }>;
    expectTypeOf<array>().toEqualTypeOf<"array" | `array[${number}]`>();

    type arrayWObject = ObjectFullPaths<{
      cats: { name: string; age: number }[];
    }>;
    expectTypeOf<arrayWObject>().toEqualTypeOf<
      | "cats"
      | `cats[${number}]`
      | `cats[${number}].name`
      | `cats[${number}].age`
    >();

    type arrayWArray = ObjectFullPaths<{
      house: { cats: { name: string; age: number }[] }[];
    }>;
    expectTypeOf<arrayWArray>().toEqualTypeOf<
      | "house"
      | `house[${number}]`
      | `house[${number}].cats`
      | `house[${number}].cats[${number}]`
      | `house[${number}].cats[${number}].name`
      | `house[${number}].cats[${number}].age`
    >();

    type tuple = ObjectFullPaths<{
      tuple: [string, number];
    }>;
    expectTypeOf<tuple>().toEqualTypeOf<"tuple" | "tuple[0]" | "tuple[1]">();

    type tupleWObject = ObjectFullPaths<{
      tuple: [{ left: boolean }, { right: boolean }];
    }>;
    expectTypeOf<tupleWObject>().toEqualTypeOf<
      "tuple" | "tuple[0]" | "tuple[1]" | "tuple[0].left" | "tuple[1].right"
    >();

    type tupleWArrayOrTuple = ObjectFullPaths<{
      tuple: [{ left: boolean[] }, { right: [boolean] }];
    }>;
    expectTypeOf<tupleWArrayOrTuple>().toEqualTypeOf<
      | "tuple"
      | "tuple[0]"
      | "tuple[1]"
      | "tuple[0].left"
      | "tuple[1].right"
      | `tuple[0].left[${number}]`
      | "tuple[1].right[0]"
    >();

    // TODO ObjectFullPaths doesnt work with multi-dimensional arrays yet
  });

  it("SelectAttributes typecheck", () => {
    interface Table {
      key: number;
      otherKey: string;
      obj: {
        nestedKey: boolean;
        anotherNestedKey: true;
      };
      tuple: [{ kissa: "koira" }, number];
      cats: {
        name: string;
        age: number;
      }[];
    }

    type selectKey = SelectAttributes<Table, ["key"]>;
    expectTypeOf<selectKey>().toEqualTypeOf<{
      key: number;
    }>();
    type selectObjectKey = SelectAttributes<Table, ["key", "obj"]>;
    expectTypeOf<selectObjectKey>().toEqualTypeOf<{
      key: number;
      obj: {
        nestedKey: boolean;
        anotherNestedKey: true;
      };
    }>();

    type selectAll = SelectAttributes<
      Table,
      ["key", "otherKey", "cats", "obj", "tuple"]
    >;
    expectTypeOf<selectAll>().toEqualTypeOf<Table>();

    type selectNested = SelectAttributes<Table, ["key", "obj.nestedKey"]>;
    expectTypeOf<selectNested>().toEqualTypeOf<{
      key: number;
      obj: {
        nestedKey: boolean;
      };
    }>();

    type selectTuple1 = SelectAttributes<Table, ["key", "tuple[0]"]>;
    expectTypeOf<selectTuple1>().toEqualTypeOf<{
      key: number;
      tuple: {
        0: {
          kissa: "koira";
        };
      };
    }>();

    type selectTuple2 = SelectAttributes<Table, ["key", "tuple[1]"]>;
    // TODO Fix this =(
    // expectTypeOf<selectTuple2>().toEqualTypeOf<{
    //   key: number;
    //   tuple: { 0: number };
    // }>();
  });
});
