import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "../index";

describe("WriteTransactionBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;
  let ddbClient: DynamoDBDocumentClient;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();
    ddbClient = await getDDBClientFor(testContainer);

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient,
    });
  });

  it("handles a transaction with puts", async () => {
    const trx = tsynamoClient.createWriteTransaction();

    trx.addItem({
      Put: tsynamoClient
        .putItem("myTable")
        .item({ userId: "9999", dataTimestamp: 1 }),
    });

    trx.addItem({
      Put: tsynamoClient
        .putItem("myTable")
        .item({ userId: "9999", dataTimestamp: 2 }),
    });

    await trx.execute();

    const result = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "9999")
      .execute();

    expect(result).toMatchSnapshot();
  });

  it("handles a transaction with deletes", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({ userId: "9999", dataTimestamp: 1 })
      .execute();

    await tsynamoClient
      .putItem("myOtherTable")
      .item({ userId: "9999", stringTimestamp: "123" })
      .execute();

    let foundItem: unknown = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: "9999",
        dataTimestamp: 1,
      })
      .execute();

    expect(foundItem).toBeDefined();

    foundItem = await tsynamoClient
      .getItem("myOtherTable")
      .keys({
        userId: "9999",
        stringTimestamp: "123",
      })
      .execute();

    expect(foundItem).toBeDefined();

    const trx = tsynamoClient.createWriteTransaction();

    trx.addItem({
      Delete: tsynamoClient.deleteItem("myTable").keys({
        userId: "9999",
        dataTimestamp: 1,
      }),
    });

    trx.addItem({
      Delete: tsynamoClient.deleteItem("myOtherTable").keys({
        userId: "9999",
        stringTimestamp: "123",
      }),
    });

    await trx.execute();

    foundItem = await tsynamoClient
      .getItem("myTable")
      .keys({
        userId: "9999",
        dataTimestamp: 1,
      })
      .execute();

    expect(foundItem).toBeUndefined();

    foundItem = await tsynamoClient
      .getItem("myOtherTable")
      .keys({
        userId: "9999",
        stringTimestamp: "9999",
      })
      .execute();

    expect(foundItem).toBeUndefined();
  });

  it("handles a transaction with updates", async () => {
    await tsynamoClient
      .putItem("myTable")
      .item({ userId: "1", dataTimestamp: 1 })
      .execute();

    await tsynamoClient
      .putItem("myTable")
      .item({ userId: "1", dataTimestamp: 2 })
      .execute();

    const trx = tsynamoClient.createWriteTransaction();

    trx.addItem({
      Update: tsynamoClient
        .updateItem("myTable")
        .keys({ userId: "9999", dataTimestamp: 1 })
        .set("someBoolean", "=", true),
    });

    trx.addItem({
      Update: tsynamoClient
        .updateItem("myTable")
        .keys({ userId: "9999", dataTimestamp: 2 })
        .set("tags", "=", ["a", "b", "c"]),
    });

    await trx.execute();

    const result = await tsynamoClient
      .query("myTable")
      .keyCondition("userId", "=", "9999")
      .execute();

    expect(result).toMatchSnapshot();
  });

  it("handles a transaction with failing conditions", async () => {
    // Create a conflicting entry
    await tsynamoClient
      .putItem("myTable")
      .item({ userId: "1", dataTimestamp: 2 })
      .execute();

    const trx = tsynamoClient.createWriteTransaction();

    trx.addItem({
      Put: tsynamoClient
        .putItem("myTable")
        .item({
          userId: "1",
          dataTimestamp: 2,
          someBoolean: true,
        })
        .conditionExpression("userId", "attribute_not_exists"),
    });

    expect(trx.execute()).rejects.toMatchSnapshot();
  });

  it("handles a transaction with a client request token", async () => {
    const trx = tsynamoClient.createWriteTransaction("hello token");

    trx.addItem({
      Put: tsynamoClient.putItem("myTable").item({
        userId: "1",
        dataTimestamp: 2,
      }),
    });

    await trx.execute();

    trx.addItem({
      Put: tsynamoClient.putItem("myTable").item({
        userId: "1",
        dataTimestamp: 2,
        someBoolean: true,
      }),
    });

    expect(trx.execute()).rejects.toMatchSnapshot();
  });
});
