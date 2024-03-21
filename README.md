<p align="center">
  <img src="assets/logo.png" width="200px" align="center" alt="Tsynamo logo" />
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

![](assets/demo.gif)

Tsynamo simplifies the DynamoDB API so that you don't have to write commands with raw expressions and hassle with the attribute names and values. Moreover, Tsynamo makes sure you use correct types in your DynamoDB expressions, and the queries are nicer to write with autocompletion!

> Tsynamo is still an early stage project, please post issues if you notice something missing from the API! Currently the `update-item` command is still a work in progress, and support for batch commands is missing.

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

WIP

## Contributors

<p>
    <a href="https://github.com/woltsu/tsynamo/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=woltsu/tsynamo" />
    </a>
</p>
