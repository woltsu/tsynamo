---
id: put_item
hide_title: true
description: Put Item
slug: /put-item
sidebar_position: 3
sidebar_label: Put item
---

[AWS Docs](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/update-item.html)

Edits an existing item's attributes, or adds a new item to the table if it does not already exist. You can put, delete, or add attribute values. You can also perform a conditional update on an existing item (insert a new attribute name-value pair if it doesn't exist, or replace an existing name-value pair if it has certain expected attribute values).

You can also return the item's attribute values (using `.returning`) in the same UpdateItem operation using the ReturnValues parameter.

## Simple put item

```typescript
await tsynamoClient
  .putItem("myTable")
  .item({
    userId: "123",
    eventId: 313,
  })
  .execute();
```

## Put item with ConditionExpression

```typescript
await tsynamoClient
  .putItem("myTable")
  .item({
    userId: "123",
    eventId: 313,
  })
  .conditionExpression("userId", "attribute_not_exists")
  .execute();
```

## Put item with multiple ConditionExpressions

```typescript
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