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
export type StripKeys<Table> = {
  [P in keyof Table]: Omit<Table[P], "_SK" | "_PK">;
};

/**
 * Returns a subset of a table's properties.
 */
export type SelectAttributes<
  Table,
  Attributes extends ReadonlyArray<keyof Table>
> = {
  [A in Attributes[number]]: Table[A];
};
