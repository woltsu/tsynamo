import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("UpdateItemQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient: await getDDBClientFor(testContainer),
    });
  });

  it("handles update item query with SET statements", async () => {
    await tsynamoClient
      .updateItem("myTable")
      .set("someBoolean", "=", (qb) => {
        return qb.ifNotExists("someBoolean", true);
      })
      .set("dataTimestamp", "+=", 1)
      .execute();
  });
});
