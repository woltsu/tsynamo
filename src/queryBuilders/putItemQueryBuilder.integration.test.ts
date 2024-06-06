import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("PutItemQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;

  const itemToPut = {
    userId: "333",
    dataTimestamp: 222,
    someBoolean: true,
  };

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient: await getDDBClientFor(testContainer),
    });
  });

  it("handles a simple put query", async () => {
    let result = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: itemToPut.userId,
        dataTimestamp: itemToPut.dataTimestamp,
      })
      .execute();

    expect(result).toBeUndefined();

    await tsynamoClient.putItem("myTable").item(itemToPut).execute();

    result = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: "333",
        dataTimestamp: 222,
      })
      .execute();

    expect(result).toBeDefined();
    expect(result).toEqual(itemToPut);
  });

  it("doesnt return values without returnValues or when its set to NONE", async () => {
    let result = await tsynamoClient
      .putItem("myTable")
      .item(itemToPut)
      .execute();

    expectTypeOf(result).toBeNever();
    expect(result).toBeUndefined();

    let result2 = await tsynamoClient
      .putItem("myTable")
      .item(itemToPut)
      .returnValues("NONE")
      .execute();

    expectTypeOf(result2).toBeNever();
    expect(result2).toBeUndefined();
  });

  it("handles ReturnValues option", async () => {
    let result = await tsynamoClient
      .putItem("myTable")
      .item(itemToPut)
      .returnValues("ALL_OLD")
      .execute();

    expectTypeOf(result).not.toBeNever();

    expect(result).toBeUndefined();

    result = await tsynamoClient
      .putItem("myTable")
      .item({
        ...itemToPut,
        tags: ["kissa"],
      })
      .returnValues("ALL_OLD")
      .execute();

    expect(result).toEqual(itemToPut);
  });

  it("handles an 'attribute_not_exists' ConditionExpression", async () => {
    await tsynamoClient.putItem("myTable").item(itemToPut).execute();
    expect(
      tsynamoClient
        .putItem("myTable")
        .item(itemToPut)
        .conditionExpression("userId", "attribute_not_exists")
        .execute()
    ).rejects.toMatchInlineSnapshot(
      `[ConditionalCheckFailedException: The conditional request failed]`
    );
  });

  it("handles 'contains' ConditionExpression", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "333",
        dataTimestamp: 212,
        tags: ["cats"],
      })
      .execute();

    const oldValues = await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "333",
        dataTimestamp: 212,
        tags: ["cats"],
      })
      .conditionExpression("tags", "contains", "cats")
      .returnValues("ALL_OLD")
      .execute();

    expect(oldValues).toBeTruthy();
    expect(oldValues).toMatchSnapshot();

    expect(
      tsynamoClient
        .putItem("myTable")
        .item({
          userId: "333",
          dataTimestamp: 212,
        })
        .conditionExpression("NOT", (qb) =>
          qb.expression("tags", "contains", "cats")
        )
        .execute()
    ).rejects.toMatchInlineSnapshot(
      `[ConditionalCheckFailedException: The conditional request failed]`
    );
  });

  it("Handles nested ConditionExpressions", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "333",
        dataTimestamp: 212,
        nested: {
          nestedBoolean: false,
        },
      })
      .execute();

    expect(
      tsynamoClient
        .putItem("myTable")
        .item({
          userId: "333",
          dataTimestamp: 212,
        })
        .conditionExpression("nested.nestedBoolean", "=", true)
        .execute()
    ).rejects.toMatchInlineSnapshot(
      `[ConditionalCheckFailedException: The conditional request failed]`
    );
  });
});
