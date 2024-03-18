import { DDB, TEST_DATA } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("QueryQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient: await getDDBClientFor(testContainer),
    });
  });

  it("handles a query with a simple KeyCondition", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", TEST_DATA[0].userId)
      .execute();

    expect(data?.length).toBe(5);
    expect(data).toMatchSnapshot();
  });

  it("handles a KeyCondition with BETWEEN expression", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .keyCondition("dataTimestamp", "BETWEEN", 150, 500)
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a KeyCondition with begins_with function", async () => {
    let data = await tsynamoClient
      .query("myOtherTable")
      .keyCondition("userId", "=", "123")
      .keyCondition("stringTimestamp", "begins_with", "11")
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a query with a FilterExpression", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", TEST_DATA[0].userId)
      .filterExpression("someBoolean", "=", true)
      .filterExpression("someBoolean", "=", true)
      .execute();

    expect(data?.length).toBe(2);
    expect(data).toMatchSnapshot();
  });

  it("handles a query with multiple expressions", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .keyCondition("dataTimestamp", "<", 888)
      .filterExpression("someBoolean", "=", true)
      .filterExpression("somethingElse", "<", 0)
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a query with a nested FilterExpression", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .keyCondition("dataTimestamp", "<", 888)
      .filterExpression("somethingElse", "<", 2)
      .orFilterExpression((qb) =>
        qb
          .expression("someBoolean", "=", true)
          .expression("somethingElse", "=", 2)
      )
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a query with a NOT FilterExpression", async () => {
    let data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("NOT", (qb) => qb.expression("someBoolean", "=", true))
      .execute();

    expect(data).toMatchSnapshot();

    data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("someBoolean", "=", true)
      .orFilterExpression("NOT", (qb) => qb.expression("somethingElse", "=", 0))
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a query with a BETWEEN FilterExpression", async () => {
    let data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("somethingElse", "BETWEEN", 0, 10)
      .execute();

    expect(data).toMatchSnapshot();

    data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("someBoolean", "=", true)
      .orFilterExpression("somethingElse", "BETWEEN", 9, 10)
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles conditions on nested keys", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("nested.nestedBoolean", "=", true)
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a FilterExpression that uses attribute_exists and attribute_not_exists", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("nested.nestedString", "attribute_exists")
      .execute();

    expect(data).toMatchSnapshot();

    const data2 = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("nested.nestedString", "attribute_not_exists")
      .attributes(["userId", "nested"])
      .execute();

    expect(data2).toMatchSnapshot();
  });

  it("handles a FilterExpression that uses begins_with", async () => {
    let data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("nested.nestedString", "begins_with", "k")
      .execute();

    expect(data).toMatchSnapshot();

    data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("nested.nestedString", "begins_with", "ke")
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a FilterExpression that takes attributes from cats array", async () => {
    let data = await tsynamoClient
      .query("myOtherTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("cats", "attribute_exists")
      .attributes(["cats[0].age"])
      .execute();

    expect(data).toMatchSnapshot();
  });

  it("handles a FilterExpression that uses CONTAINS function", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "313")
      .filterExpression("tags", "contains", "testTag")
      .execute();

    expect(data).toMatchSnapshot();
  });
});
