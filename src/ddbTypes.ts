export type PartitionKey<T> = T & { _PK: true };

export type SortKey<T> = T & { _SK: true };
