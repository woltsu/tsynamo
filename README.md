# Tsynamo

Type-safe DynamoDB query builder! Inspired by [Kysely](https://github.com/kysely-org/kysely/tree/master).

Usable with AWS SDK v3 `DynamoDBDocumentClient`.

> [!NOTE]
> Currently this is a POC and a WIP, and only supports the basic get item query.

![](https://github.com/woltsu/tsynamo/blob/main/assets/demo.gif)

## Installation

Available in [NPM](https://www.npmjs.com/package/tsynamo).

```bash
npm i tsynamo
pnpm install tsynamo
yarn add tsynamo
```

## Usage

First, create the types for your DynamoDB tables:

```ts
import { PartitionKey, SortKey } from "tsynamo";

export interface DDB {
  UserEvents: {
    userId: PartitionKey<string>;
    eventId: SortKey<number>;
    eventType: string;
  };
}
```

and then, pass that to the Tsynamo instance:

```ts
const tsynamoClient = new Tsynamo<DDB>({
  ddbClient: dynamoDbDocumentClient,
});
```


