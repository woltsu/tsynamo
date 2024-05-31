<p align="center">
  <img src="https://github.com/woltsu/tsynamo/blob/5fb5bb349887f0b8f0c903cbba93feb2a4a1ae50/assets/logo.png" width="400px" align="center" alt="Tsynamo logo - The logo has the DynamoDB logo on the left and the Typescript logo on the right with a red heart in between" />
  <h1 align="center">Tsynamo</h1>
  <p align="center">
    ✨ Type-friendly DynamoDB query builder! ✨
    <br/>
    Inspired by <a href="https://github.com/kysely-org/kysely/tree/master" rel="nofollow">Kysely</a>
  </p>
</p>
<br/>
<p align="center">
<a href="https://github.com/woltsu/tsynamo/actions?query=branch%main"><img src="https://github.com/woltsu/tsynamo/actions/workflows/deploy.yml/badge.svg?event=push&branch=main" alt="Tsynamo CI status" /></a>
<a href="https://www.npmjs.com/package/tsynamo"><img src="https://img.shields.io/npm/v/tsynamo.svg?style=flat&color=brightgreen" target="_blank" /></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/woltsu/tsynamo" alt="License"></a>
</p>

![](https://github.com/woltsu/tsynamo/blob/5fb5bb349887f0b8f0c903cbba93feb2a4a1ae50/assets/demo.gif)

Tsynamo simplifies the DynamoDB API so that you don't have to write commands with raw expressions and hassle with the attribute names and values. Moreover, Tsynamo makes sure you use correct types in your DynamoDB expressions, and the queries are nicer to write with autocompletion!

> [!WARNING]  
> Tsynamo is still an early stage project, please post issues if you notice something missing from the API!

## Table of contents

- [Table of contents](#table-of-contents)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Creating a Tsynamo client](#creating-a-tsynamo-client)
  - [Get item](#get-item)
  - [Query item](#query-item)
  - [Put item](#put-item)
  - [Delete item](#delete-item)
  - [Update item](#update-item)
  - [Transactions](#transactions)
- [Contributors](#contributors)

## Requirements

- [@aws-sdk/client-dynamodb](https://www.npmjs.com/package/@aws-sdk/client-dynamodb)
- [@aws-sdk/lib-dynamodb](https://www.npmjs.com/package/@aws-sdk/lib-dynamodb)

## Installation

Available in [NPM](https://www.npmjs.com/package/tsynamo).

```bash
npm i tsynamo
pnpm install tsynamo
yarn add tsynamo
```

> [!NOTE]
> You can also try it out at [Tsynamo Playground](https://try.tsynamo.dev)

## Usage

### Creating a Tsynamo client

1. Define the types for your DynamoDB (DDB) tables:

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

> [!TIP]
> Notice that you can have multiple tables in the DDB schema. Nested attributes are supported too.

2. Create a DynamoDB document client:

```ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    /* Configure client... */
  })
);
```

> [!IMPORTANT]
> The document client must come from @aws-sdk/lib-dynamodb!

3. Create a Tsynamo client with the defined DynamoDB types and client:

```ts
const tsynamoClient = new Tsynamo<DDB>({
  ddbClient: dynamoDbDocumentClient,
});
```

## Get item

```ts
await tsynamoClient
  .getItem("UserEvents")
  .keys({
    userId: "123",
    eventId: 222,
  })
  .attributes(["userId"])
  .execute();
```

### Query item

#### Partition key condition

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .execute();
```

#### Partition and sort key conditions

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .keyCondition("eventId", "<", 1000)
  .execute();
```

#### Simple filter expression

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "=", "LOG_IN_EVENT")
  .execute();
```

#### Filter expression with a function

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "begins_with", "LOG")
  .execute();
```

#### Multiple filter expressions

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "begins_with", "LOG_IN")
  .orFilterExpression("eventType", "begins_with", "SIGN_IN")
  .execute();
```

#### Nested filter expressions

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

> [!NOTE]
> This would compile as the following FilterExpression:
> `eventType = "LOG_IN" OR (eventType = "UNAUTHORIZED_ACCESS" AND userAuthenticated = true`)

#### NOT filter expression

```ts
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("NOT", (qb) =>
    qb.filterExpression("eventType", "=", "LOG_IN")
  )
  .execute();
```

> [!NOTE]
> This would compile as the following FilterExpression:
> `NOT eventType = "LOG_IN"`, i.e. return all events whose types is not "LOG_IN"

### Put item

#### Simple put item

```ts
await tsynamoClient
  .putItem("myTable")
  .item({
    userId: "123",
    eventId: 313,
  })
  .execute();
```

#### Put item with ConditionExpression

```ts
await tsynamoClient
  .putItem("myTable")
  .item({
    userId: "123",
    eventId: 313,
  })
  .conditionExpression("userId", "attribute_not_exists")
  .execute();
```

#### Put item with multiple ConditionExpressions

```ts
await tsynamoClient
  .putItem("myTable")
  .item({
    userId: "123",
    eventId: 313,
  })
  .conditionExpression("userId", "attribute_not_exists")
  .orConditionExpression("eventType", "begins_with", "LOG_")
  .execute();
```

### Delete item

#### Simple delete item

```ts
await tsynamoClient
  .deleteItem("myTable")
  .keys({
    userId: "123",
    eventId: 313,
  })
  .execute();
```

#### Simple delete item with ConditionExpression

```ts
await tsynamoClient
  .deleteItem("myTable")
  .keys({
    userId: "123",
    eventId: 313,
  })
  .conditionExpression("eventType", "attribute_not_exists")
  .execute();
```

### Update item

```ts
await tsynamoClient
  .updateItem("myTable")
  .keys({ userId: "1", dataTimestamp: 2 })
  .set("nested.nestedBoolean", "=", true)
  .remove("nested.nestedString")
  .add("somethingElse", 10)
  .add("someSet", new Set(["4", "5"]))
  .delete("nested.nestedSet", new Set(["4", "5"]))
  .conditionExpression("somethingElse", ">", 0)
  .execute();
```

### Transactions

One can also utilise [DynamoDB Transaction](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html) features using Tsynamo. You can perform operations to multiple tables in a single transaction command.

#### Write transaction

DynamoDB enables you to do multiple `Put`, `Update` and `Delete` in a single `WriteTransaction` command. One can also provide an optional `ClientRequestToken` to the transaction to ensure idempotency.

```ts
const trx = tsynamoClient.createWriteTransaction();

trx.addItem({
  Put: tsynamoClient
    .putItem("myTable")
    .item({ userId: "313", dataTimestamp: 1 }),
});

trx.addItem({
  Update: tsynamoClient
    .updateItem("myTable")
    .keys({ userId: "313", dataTimestamp: 2 })
    .set("tags", "=", ["a", "b", "c"]),
});

trx.addItem({
  Delete: tsynamoClient.deleteItem("myTable").keys({
    userId: "313",
    dataTimestamp: 3,
  }),
});

await trx.execute();
```

> [!IMPORTANT]
> When passing the items into the transaction using the tsynamoClient, do not execute the individual calls! Instead just pass in the query builder as the item.

> [!WARNING]  
> DynamoDB also supports doing `ConditionCheck` operations in the transaction, but Tsynamo does not yet support those.

#### Read transaction

Since the read transaction output can affect multiple tables, the resulting output is an array of tuples where the first item is the name of the table and the second item is the item itself (or `undefined` if the item was not found). This can be used as a discriminated union to determine the resulting item's type.

```ts
const trx = tsynamoClient.createReadTransaction();

trx.addItem({
  Get: tsynamoClient.getItem("myTable").keys({
    userId: "123",
    dataTimestamp: 222,
  }),
});

trx.addItem({
  Get: tsynamoClient.getItem("myOtherTable").keys({
    userId: "321",
    stringTimestamp: "222",
  }),
});

const result = await trx.execute();
```

Then, one can loop through the result items as so:

```ts
// note that the items can be undefined if they were not found from DynamoDB
result.forEach(([table, item]) => {
  if (table === "myTable") {
    // item's type is DDB["myTable"]
    // ...
  } else if (table === "myOtherTable") {
    // item's type is DDB["myOtherTable"]
    // ...
  }
});
```

## Contributors

<p>
    <a href="https://github.com/woltsu/tsynamo/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=woltsu/tsynamo" />
    </a>
</p>
