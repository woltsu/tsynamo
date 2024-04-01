---
id: query_item
hide_title: true
description: Query Item
slug: /query-item
sidebar_position: 2
sidebar_label: Query item
---
[AWS Docs](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/query.html)

A single `Query` operation will read up to the maximum number of items set (if using the `Limit` parameter) or a maximum of 1 MB of data and then apply any filtering to the results using FilterExpression. 

:::info
FilterExpression is applied after a Query finishes, but before the results are returned. A FilterExpression cannot contain key attributes(`.filterExpression()`). You need to specify those attributes in the KeyConditionExpression (`.keyCondition()`).
:::

You can query a table, a local secondary index, or a global secondary index.

## Partition key condition

```typescript
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .execute();
```

## Partition and sort key condition

```typescript
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .keyCondition("eventId", "<", 1000)
  .execute();
```

## Simple filter expression

```typescript
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "=", "LOG_IN_EVENT")
  .execute();
```

## Filter expression with a function

```typescript
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "begins_with", "LOG")
  .execute();
```

## Multiple filter expressions

```typescript
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("eventType", "begins_with", "LOG_IN")
  .orFilterExpression("eventType", "begins_with", "SIGN_IN")
  .execute();
```

## Nested filter expressions

```typescript
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

:::info

This would compile as the following FilterExpression: `eventType = "LOG_IN" OR (eventType = "UNAUTHORIZED_ACCESS" AND userAuthenticated = true)`

:::

## NOT filter expression

```typescript
await tsynamoClient
  .query("UserEvents")
  .keyCondition("userId", "=", "123")
  .filterExpression("NOT", (qb) =>
    qb.filterExpression("eventType", "=", "LOG_IN")
  )
  .execute();

```