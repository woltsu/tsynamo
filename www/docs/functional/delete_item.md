---
id: delete_item
hide_title: true
description: Delete Item
slug: /delete-item
sidebar_position: 4
sidebar_label: Delete item
---
[AWS Docs](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/delete-item.html)

Deletes a single item in a table by primary key. You can perform a conditional delete operation (using `.conditionalExpression`) that deletes the item if it exists, or if it has an expected attribute value.

In addition to deleting an item, you can also return the item's attribute values in the same operation, using the `.returning` parameter.

## Simple delete item
```typescript
await tsynamoClient
  .deleteItem("myTable")
  .keys({
    userId: "123",
    eventId: 313,
  })
  .execute();
```

## Simple delete item with ConditionExpression
```typescript
await tsynamoClient
  .deleteItem("myTable")
  .keys({
    userId: "123",
    eventId: 313,
  })
  .conditionExpression("eventType", "attribute_not_exists")
  .execute();
```
