# Tsynamo

Type-safe DynamoDB query builder! Inspired by [Kysely](https://github.com/kysely-org/kysely/tree/master).

Usable with AWS SDK v3 `DynamoDBDocumentClient`.

> [!NOTE]
> Currently this is a POC and a WIP, and only supports the basic get item query.

![](https://github.com/woltsu/tsynamo/blob/main/assets/demo.gif)

# Installation

Available in [NPM](https://www.npmjs.com/package/tsynamo).

```bash
npm i tsynamo
pnpm install tsynamo
yarn add tsynamo
```

# Usage

## Creating a Tsynamo client

First, you need to define the types for your DynamoDB tables:

```ts
import { PartitionKey, SortKey } from "tsynamo";

export interface DDB {
  UserEvents: {
    userId: PartitionKey<string>;
    eventId: SortKey<number>;
    eventType: string;
    userAuthenticated: boolean;
  };
}
```

> Notice that you can have multiple tables in the DDB schema. You can also have nested attributes in the table.

Then, you need to create the DynamoDB Document Client:

```ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    /* Configure client... */
  })
);
```

> The document client must come from @aws-sdk/lib-dynamodb!

Finally, create a Tsynamo client with the defined DynamoDB types and client:

```ts
const tsynamoClient = new Tsynamo<DDB>({
  ddbClient: dynamoDbDocumentClient,
});
```

## Get item

```ts
await tsynamoClient
  .getItemFrom("UserEvents")
  .keys({
    userId: "123",
    eventId: 222,
  })
  .attributes(["userId"])
  .execute();
```

## Query item

### Partition key condition

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .execute();
```

### Partition and sort key conditions

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .keyCondition("eventId", "<", 1000)
  .execute();
```

### Simple filter expression

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "=", "LOG_IN_EVENT")
  .execute();
```

### Filter expression with a function

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "begins_with", "LOG")
  .execute();
```

### Multiple filter expressions

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "begins_with", "LOG_IN")
  .orFilterExpression("eventType", "begins_with", "SIGN_IN")
  .execute();
```

### Nested filter expressions

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "=", "LOG_IN")
  .orFilterExpression((qb) =>
    qb
      .filterExpression("eventType", "=", "UNAUTHORIZED_ACCESS")
      .filterExpression("userAuthenticated", "=", true)
  )
  .orFilterExpression("eventType", "begins_with", "SIGN_IN")
  .execute();
```

> This would compile as the following FilterExpression:
> `eventType = "LOG_IN" OR (eventType = "UNAUTHORIZED_ACCESS" AND userAuthenticated = true`)

## Delete item

WIP

## Put item

WIP

## Update item

WIP

## Scan

WIP
