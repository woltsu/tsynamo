import { DDB, TEST_DATA } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("GetItemQueryBuilder", () => {
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
      .getItemFrom("myTable")
      .keys({
        userId: itemToPut.userId,
        dataTimestamp: itemToPut.dataTimestamp,
      })
      .execute();

    expect(result).toBeUndefined();

    await tsynamoClient.putItem("myTable").item(itemToPut).execute();

    result = await tsynamoClient
      .getItemFrom("myTable")
      .keys({
        userId: "333",
        dataTimestamp: 222,
      })
      .execute();

    expect(result).toBeDefined();
    expect(result).toEqual(itemToPut);
  });

  it("handles ReturnValues option", async () => {
    let result = await tsynamoClient
      .putItem("myTable")
      .item(itemToPut)
      .returnValues("ALL_OLD")
      .execute();

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
});
