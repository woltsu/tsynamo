export type PartitionKey<T extends string | number | boolean> = T & { _PK: true };

export type SortKey<T extends string | number> = T & { _SK: true };
