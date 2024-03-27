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
        return [qb.ifNotExists("somethingElse", 1), 2]
      })
      .returnValues("ALL_NEW")
      .execute();

    expect(res).toMatchSnapshot();
  });
});
