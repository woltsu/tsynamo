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
      .getItemFrom("myTable")
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
      .getItemFrom("myTable")
      .keys({ userId: "1", dataTimestamp: 2 })
      .execute();

    expect(itemAfterDeletion).toBeUndefined();
  });
});
