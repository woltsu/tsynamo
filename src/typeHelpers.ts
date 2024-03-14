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
export type SelectAttributes<
  Table,
  Attributes extends ReadonlyArray<keyof Table>
> = {
  [A in Attributes[number]]: Table[A];
};

export type IsNotSpecificString<
  T extends string,
  SpecificString extends string
> = T extends SpecificString ? never : T;
