import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("UpdateItemQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;
  let ddbClient: DynamoDBDocumentClient;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();
    ddbClient = await getDDBClientFor(testContainer);

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient,
    });
  });

  it("handles update item query with SET statements", async () => {
    const res = await tsynamoClient
      .updateItem("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .set("someBoolean", "=", (qb) => {
        return qb.ifNotExists("someBoolean", true);
      })
      .set("tags", "=", (qb) => {
        return qb.listAppend(
          (qbb) => qbb.ifNotExists("tags", []),
          ["test_tag"]
        );
      })
      .set("somethingElse", "+=", (qb) => {
        return [qb.ifNotExists("somethingElse", 1), 2];
      })
      .returnValues("ALL_NEW")
      .execute();

    expect(res).toMatchSnapshot();
  });

  it("handles update item query with REMOVE statements", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "1010",
        dataTimestamp: 200,
        somethingElse: 313,
        someBoolean: true,
      })
      .execute();

    await tsynamoClient
      .updateItem("myTable")
      .keys({ userId: "1010", dataTimestamp: 200 })
      .remove("somethingElse")
      .execute();

    const foundItem = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: "1010",
        dataTimestamp: 200,
      })
      .execute();

    expect(foundItem).toMatchSnapshot();
  });

  it("handles update item query with ADD statements", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({
        userId: "1010",
        dataTimestamp: 200,
        someBoolean: true,
      })
      .execute();

    await tsynamoClient
      .updateItem("myTable")
      .keys({ userId: "1010", dataTimestamp: 200 })
      .add("somethingElse", 7)
      .add("someSet", new Set(["item1", "item2"]))
      .execute();

    const foundItem = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: "1010",
        dataTimestamp: 200,
      })
      .execute();

    expect(foundItem).toMatchSnapshot();
  });
});
