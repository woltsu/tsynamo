import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DDB } from "../../test/testFixture";
import { getDDBClientFor, startDDBTestContainer } from "../../test/testUtil";
import { Tsynamo } from "../index";

describe("ReadTransactionBuilder", () => {
  let tsynamoClient: Tsynamo<DDB>;
  let ddbClient: DynamoDBDocumentClient;

  beforeAll(async () => {
    const testContainer = await startDDBTestContainer();
    ddbClient = await getDDBClientFor(testContainer);

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient,
    });
  });

  it("handles transaction with gets", async () => {
    const trx = tsynamoClient.createReadTransaction();

    trx.addItem({
      Get: tsynamoClient.getItem("myTable").keys({
        userId: "123",
        dataTimestamp: 222,
      }),
    });

    const result = await trx.execute();
    console.log("result", result);
  });
});
