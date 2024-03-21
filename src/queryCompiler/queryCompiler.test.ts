import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DDB, TEST_DATA } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("QueryQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;

  beforeAll(async () => {
    tsynamoClient = new Tsynamo<DDB>({
      ddbClient: DynamoDBDocumentClient.from(new DynamoDBClient({})),
    });
  });

  it("queryQueryBuilder can be compiled", async () => {
    const data = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "123")
      .filterExpression("someBoolean", "=", true)
      .orFilterExpression("somethingElse", "BETWEEN", 9, 10)
      .attributes(["userId"])
      .compile();

    expect(data).toMatchSnapshot();
  });

  it("putItemQueryBuilder can be compiled", async () => {
    const data = await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "333",
        dataTimestamp: 212,
        tags: ["cats"],
      })
      .compile();

    expect(data).toMatchSnapshot();
  });
  it("getItemQueryBuilder can be compiled", async () => {
    const data = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: TEST_DATA[1].userId,
        dataTimestamp: TEST_DATA[1].dataTimestamp,
      })
      .compile();

    expect(data).toMatchSnapshot();
  });
  it("deleteItemQueryBuilder can be compiled", async () => {
    const data = await tsynamoClient
      .deleteItem("myTable")
      .keys({
        userId: "1",
        dataTimestamp: 2,
      })
      .returnValues("ALL_OLD")
      .compile();

    expect(data).toMatchSnapshot();
  });
});
