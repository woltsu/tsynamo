import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "../index";

describe("TransactionBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;
  let ddbClient: DynamoDBDocumentClient;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();
    ddbClient = await getDDBClientFor(testContainer);

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient,
    });
  });

  it("handles puts", async () => {
    const trx = tsynamoClient.createTransaction();

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
});
