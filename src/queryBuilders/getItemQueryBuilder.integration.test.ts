import { beforeAll, describe, expect, it } from "vitest";
import { DDB, TEST_DATA } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "./../index";

describe("GetItemQueryBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient: await getDDBClientFor(testContainer),
    });
  });

  it("handles a basic get item command", async () => {
    const data = await tsynamoClient
      .getItemFrom("myTable")
      .keys({
        userId: TEST_DATA[1].userId,
        dataTimestamp: TEST_DATA[1].dataTimestamp,
      })
      .execute();

    expect(data).toEqual(TEST_DATA[1]);
  });

  it("handles selecting specific attributes", async () => {
    const data = await tsynamoClient
      .getItemFrom("myTable")
      .keys({
        userId: TEST_DATA[0].userId,
        dataTimestamp: TEST_DATA[0].dataTimestamp,
      })
      .consistentRead(true)
      .attributes(["somethingElse", "someBoolean"])
      .execute();

    expect(data?.somethingElse).toBe(TEST_DATA[0].somethingElse);
    expect(data?.someBoolean).toBe(TEST_DATA[0].someBoolean);
    expect(Object.keys(data!).length).toBe(2);
  });

  it("handles selecting nested attributes", async () => {
    const data = await tsynamoClient
      .getItemFrom("myTable")
      .keys({
        userId: TEST_DATA[4].userId,
        dataTimestamp: TEST_DATA[4].dataTimestamp,
      })
      .consistentRead(true)
      .attributes(["someBoolean", "nested.nestedBoolean"])
      .execute();

    expect(data?.someBoolean).toBe(TEST_DATA[4].someBoolean);
    expect(data?.nested?.nestedBoolean).toBe(TEST_DATA[4].nested.nestedBoolean);
    expect(Object.keys(data!).length).toBe(2);
  });

  it("handles selecting deeply nested attributes", async () => {
    const data = await tsynamoClient
      .getItemFrom("myTable")
      .keys({
        userId: TEST_DATA[8].userId,
        dataTimestamp: TEST_DATA[8].dataTimestamp,
      })
      .consistentRead(true)
      .attributes(["someBoolean", "nested.nestedNested.nestedNestedBoolean"])
      .execute();

    expect(data?.someBoolean).toBe(TEST_DATA[8].someBoolean);
    expect(data?.nested?.nestedNested?.nestedNestedBoolean).toBe(
      TEST_DATA[8].nested.nestedNested.nestedNestedBoolean
    );
    expect(Object.keys(data!).length).toBe(2);
  });

  it("handles selecting attributes from arrays and tuples", async () => {
    const data = await tsynamoClient
      .getItemFrom("myOtherTable")
      .keys({
        userId: TEST_DATA[6].userId,
        stringTimestamp: "123",
      })
      .consistentRead(true)
      .attributes(["cats[1].age"])
      .execute();

    expect(Object.keys(data!).length).toBe(1);
    expect(data?.cats?.length).toEqual(1);
    expect(data?.cats?.[0].age).toEqual(TEST_DATA[6].cats[1].age);
  });

  it("can't await instance directly", async () => {
    expect(
      async () =>
        await tsynamoClient
          .getItemFrom("myTable")
          .keys({
            userId: TEST_DATA[0].userId,
            dataTimestamp: TEST_DATA[0].dataTimestamp,
          })
          .consistentRead(true)
          .attributes(["somethingElse", "someBoolean"])
    ).rejects.toThrowError(
      "Don't await GetQueryBuilder instances directly. To execute the query you need to call the `execute` method"
    );
  });
});
