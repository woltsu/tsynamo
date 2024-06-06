import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("DeleteItemQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient: await getDDBClientFor(testContainer),
    });
  });

  it("handles a simple delete query", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "1",
        dataTimestamp: 2,
      })
      .execute();

    const itemBeforeDeletion = await tsynamoClient
      .getItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .execute();

    expect(itemBeforeDeletion).toBeDefined();

    const deleteResponse = await tsynamoClient
      .deleteItem("myTable")
      .keys({
        userId: "1",
        dataTimestamp: 2,
      })
      .returnValues("ALL_OLD")
      .execute();

    expect(deleteResponse).toMatchSnapshot();

    const itemAfterDeletion = await tsynamoClient
      .getItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .execute();

    expect(itemAfterDeletion).toBeUndefined();
  });

  it("handles a delete query with a ConditionExpression", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "1",
        dataTimestamp: 2,
        tags: ["meow"],
        someBoolean: true,
      })
      .execute();

    expect(
      tsynamoClient
        .deleteItem("myTable")
        .keys({
          userId: "1",
          dataTimestamp: 2,
        })
        .conditionExpression("NOT", (qb) => {
          return qb.expression("tags", "contains", "meow");
        })
        .execute()
    ).rejects.toMatchInlineSnapshot(
      `[ConditionalCheckFailedException: The conditional request failed]`
    );

    const res = await tsynamoClient
      .deleteItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .conditionExpression("NOT", (qb) => {
        return qb.expression("tags", "contains", "meow");
      })
      .orConditionExpression("someBoolean", "attribute_exists")
      .returnValues("ALL_OLD")
      .execute();

    expect(res).toBeDefined();
  });
  it("doesn't return values if no returnValues is specified or its set to NONE", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "1",
        dataTimestamp: 2,
      })
      .execute();

    const res = await tsynamoClient
      .deleteItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .execute();

    expectTypeOf(res).toBeNever();
    expect(res).toBeUndefined();

    const res2 = await tsynamoClient
      .deleteItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .returnValues("NONE")
      .execute();

    expectTypeOf(res2).toBeNever();
    expect(res2).toBeUndefined();
  });
  it("does return values if returnValues is specified", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "1",
        dataTimestamp: 2,
      })
      .execute();

    const res = await tsynamoClient
      .deleteItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .returnValues("ALL_OLD")
      .execute();

    expectTypeOf(res).not.toBeNever();
    expect(res).toBeDefined();
  });
});
