import type { PartitionKey, SortKey } from "./ddbTypes";

/**
 * Returns the properties of a table that are partition keys.
 *
 * @see PartitionKey
 */
export type PickPk<Table> = {
  [P in keyof Table as Table[P] extends { _PK: true } ? P : never]: Omit<
    Table[P],
    "_PK"
  >;
};

/**
 * Returns the properties of a table that are sort keys as optional.
 *
 * @see SortKey
 */
export type PickSk<Table> = {
  [P in keyof Table as Table[P] extends { _SK: true } ? P : never]?: Omit<
    Table[P],
    "_SK"
  >;
};

export type PickAllKeys<Table> = PickPk<Table> & PickSk<Table>;

export type PickNonKeys<Table> = {
  [P in keyof Table as Table[P] extends { _SK: true } | { _PK: true }
    ? never
    : P]: Table[P];
};

/**
 * Returns the properties of a table that are sort keys as required.
 *
 * @see SortKey
 */
export type PickSkRequired<Table> = {
  [P in keyof Table as Table[P] extends { _SK: true } ? P : never]: Omit<
    Table[P],
    "_SK"
  >;
};

/**
 * Removes the branded typing from a property of the table.
 *
 * @see PartitionKey
 * @see SortKey
 */
export type StripKeys<T> = T extends { _PK: true }
  ? Omit<T, "_PK">
  : T extends { _SK: true }
  ? Omit<T, "_SK">
  : T;

/**
 * Returns a subset of a table's properties.
 */
export type SelectAttributesRaw<
  Table,
  Attributes extends ReadonlyArray<keyof Table>
> = {
  [A in Attributes[number]]: Table[A];
};
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type RecursiveSelectAttributes<Table, Properties> = Properties extends [
  infer First,
  ...infer Rest
]
  ? [First, IsTuple<Table>] extends [`${number}`, true]
    ? First extends keyof Table
      ? [RecursiveSelectAttributes<Table[First], Rest>]
      : Table
    : [First, Table] extends [`${number}`, any[]]
    ? RecursiveSelectAttributes<As<Table, any[]>[number], Rest>[]
    : First extends keyof Table
    ? { [key in First]: RecursiveSelectAttributes<Table[First], Rest> }
    : never
  : Table;

export type SelectAttributes<
  Table,
  Attributes extends ReadonlyArray<string>
> = IntersectionToSingleObject<
  UnionToIntersection<
    RecursiveSelectAttributes<Table, ParsePath<Attributes[number]>>
  >
>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
type IntersectionToSingleObject<T> = T extends infer U
  ? { [K in keyof U]: U[K] }
  : never;

// We first need to parse the path string into a list of Properties,
// Then, we recursively access Properties on the input object.
export type GetFromPath<Obj, Path> = RecursiveGet<Obj, ParsePath<Path>>;

// transform the path into a list of properties,
// we need to check if each character  belongs to the
// `"." | "[" | "]"` union type. If it does, we split
// the string at this position. If it does not, we
// keep going.
//
// This is similar to the `RemovePunctuation` generic we have
// seen in this chapter, except we create a tuple type instead
// of a string here.
type ParsePath<
  // our unparsed path string
  Path,
  // `Properties` is our list of properties:
  Properties extends string[] = [],
  // `CurrentProp` is the property name currently in progress:
  CurrentProp extends string = ""
> =
  // Split the path after the first character
  Path extends `${infer First}${infer Rest}`
    ? // if the first character is a delimiter
      First extends "." | "[" | "]"
      ? // we add the CurrentProp to `Properties` if it isn't
        // an empty string.
        ParsePath<
          Rest,
          [...Properties, ...(CurrentProp extends "" ? [] : [CurrentProp])],
          ""
        >
      : // Otherwise, we add the first character to the
        // current property name:
        ParsePath<Rest, Properties, `${CurrentProp}${First}`>
    : // If the input string is empty, we return the list of
      // properties, with the current prop appended to it.
      [...Properties, ...(CurrentProp extends "" ? [] : [CurrentProp])];

// Then we need to loop on the list of properties
// and get the corresponding value from the object.
// We recurse until the list is empty
type RecursiveGet<Obj, Properties> = Properties extends [
  infer First,
  ...infer Rest
]
  ? First extends keyof Obj
    ? RecursiveGet<Obj[First], Rest>
    : // Special case if `Obj` is an array
    // and the path is a number string.
    // in this case we read the array's inner
    // type using `array[number]`.
    [First, Obj] extends [`${number}`, any[]]
    ? RecursiveGet<As<Obj, any[]>[number], Rest>
    : undefined
  : Obj;

type As<A, B> = A extends B ? A : never;

export type ObjectKeyPaths<T> =
  // if `T` is an object
  T extends Record<PropertyKey, unknown>
    ? // Assign the union `keyof T` to a variable `Key`
      keyof T extends infer Key
      ? // Loop over union of keys
        Key extends string | number
        ? // Check if the current key is an object, if it is, concatenate the key and rest of the path recursively
          T[Key] extends Record<PropertyKey, unknown>
          ? `${Key}.${ObjectKeyPaths<T[Key]>}`
          : // Otherwise, just return the current key
            Key
        : // unreachable branch (if key is symbol)
          never
      : // unreachable branch (`extends infer` is always truthy), but needs to be here for syntax
        never
    : // Leaf value reached, don't return anything
      never;

type IsTuple<T> = T extends [any, ...any] ? true : false;

/**
 * Generate union from 0 to N
 * RangeToN<3> => 0 | 1 | 2 | 3
 */
type RangeToN<
  N extends number,
  Result extends any[] = []
> = Result["length"] extends N
  ? Result[number]
  : RangeToN<N, [...Result, Result["length"]]>;

//     T extends (number extends T['length'] ? [] : any[])
export type ObjectFullPaths<T> =
  // if `T` is an object or array
  T extends Record<PropertyKey, unknown>
    ? // Assign the union `keyof T` to a variable `Key`
      keyof T extends infer Key
      ? // Loop over union of keys
        Key extends string | number
        ? // Check if the current key is an object
          T[Key] extends Record<PropertyKey, unknown>
          ? // If it's an object, concatenate the key and rest of the path recursively
            `${Key}` | `${Key}.${ObjectFullPaths<T[Key]>}`
          : // If it's not an object, check if its an array
          T[Key] extends (infer A)[]
          ? IsTuple<T[Key]> extends true
            ? // If tuple create array concatenate the key, specific array accessor for each index of the tuple, and the rest of the path recursively
              | `${Key}`
                | `${Key}${ObjectFullPaths<{
                    [SpecificKey in RangeToN<
                      T[Key]["length"]
                    > as `[${SpecificKey}]`]: T[Key][SpecificKey];
                  }>}`
            : // If it's an array concatenate the key, array accessors, and the rest of the path recursively
              | `${Key}`
                | `${Key}[${number}]`
                | `${Key}[${number}].${ObjectFullPaths<A[][number]>}`
          : `${Key}`
        : // unreachable branch (if key is symbol)
          never
      : // unreachable branch (`extends infer` is always truthy), but needs to be here for syntax
        never
    : // Leaf value reached, don't return anything
      never;
