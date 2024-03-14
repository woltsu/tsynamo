import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PartitionKey, SortKey } from "./ddbTypes";
import { Tsynamo } from "./index";

interface DDB {
  myTable: {
    userId: PartitionKey<string>;
    dataTimestamp: SortKey<number>;
    somethingElse: number;
    someBoolean: boolean;
    nested: {
      nestedString: number;
      nestedBoolean: boolean;
    };
  };
  myOtherTable: {
    userId: PartitionKey<string>;
    stringTimestamp: SortKey<string>;
    somethingElse: number;
    someBoolean: boolean;
  };
}

const DDB_PORT = 8000 as const;

describe("tsynamo", () => {
  let ddbClient: DynamoDBDocumentClient;
  let ddbContainer: StartedTestContainer;
  let tsynamoClient: Tsynamo<DDB>;

  beforeAll(async () => {
    ddbContainer = await new GenericContainer("amazon/dynamodb-local")
      .withReuse()
      .withExposedPorts(DDB_PORT)
      .start();

    const containerUrl = `http://${ddbContainer.getHost()}:${ddbContainer.getMappedPort(
      DDB_PORT
    )}`;

    const opts = {
      endpoint: containerUrl,
      region: "us-east-1",
      credentials: {
        accessKeyId: "xxxxx",
        secretAccessKey: "xxxxx",
      },
    };

    ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient(opts));
  }, 60000);

  beforeEach(async () => {
    await setupTestDatabase(ddbClient);

    tsynamoClient = new Tsynamo<DDB>({
      ddbClient,
    });
  });

  describe("getItemFrom", async () => {
    it("handles a basic get item command", async () => {
      const data = await tsynamoClient
        .getItemFrom("myTable")
        .keys({
          userId: TEST_ITEM_2.userId,
          dataTimestamp: TEST_ITEM_2.dataTimestamp,
        })
        .execute();

      expect(data).toEqual(TEST_ITEM_2);
    });

    it("handles selecting specific attributes", async () => {
      const data = await tsynamoClient
        .getItemFrom("myTable")
        .keys({
          userId: TEST_ITEM_1.userId,
          dataTimestamp: TEST_ITEM_1.dataTimestamp,
        })
        .consistentRead(true)
        .attributes(["somethingElse", "someBoolean"])
        .execute();

      expect(data?.somethingElse).toBe(TEST_ITEM_1.somethingElse);
      expect(data?.someBoolean).toBe(TEST_ITEM_1.someBoolean);
      expect(Object.keys(data!).length).toBe(2);
    });
    it("can't await instance directly", async () => {
      expect(
        async () =>
          await tsynamoClient
            .getItemFrom("myTable")
            .keys({
              userId: TEST_ITEM_1.userId,
              timestamp: TEST_ITEM_1.timestamp,
            })
            .consistentRead(true)
            .attributes(["somethingElse", "someBoolean"])
      ).rejects.toThrowError(
        "Don't await GetQueryBuilder instances directly. To execute the query you need to call the `execute` method"
      );
    });
  });

  describe("query", () => {
    it("handles a query with a simple KeyCondition", async () => {
      const data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", TEST_ITEM_1.userId)
        .execute();

      expect(data?.length).toBe(4);
      expect(data).toMatchSnapshot();
    });

    it("handles a KeyCondition with BETWEEN expression", async () => {
      const data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .keyCondition("dataTimestamp", "BETWEEN", 150, 500)
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a KeyCondition with begins_with function", async () => {
      let data = await tsynamoClient
        .query("myOtherTable")
        .keyCondition("userId", "=", "123")
        .keyCondition("stringTimestamp", "begins_with", "11")
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a query with a FilterExpression", async () => {
      const data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", TEST_ITEM_1.userId)
        .filterExpression("someBoolean", "=", true)
        .execute();

      expect(data?.length).toBe(2);
      expect(data).toMatchSnapshot();
    });

    it("handles a query with multiple expressions", async () => {
      const data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .keyCondition("dataTimestamp", "<", 888)
        .filterExpression("someBoolean", "=", true)
        .filterExpression("somethingElse", "<", 0)
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a query with a nested FilterExpression", async () => {
      const data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .keyCondition("dataTimestamp", "<", 888)
        .filterExpression("somethingElse", "<", 2)
        .orFilterExpression((qb) =>
          qb
            .filterExpression("someBoolean", "=", true)
            .filterExpression("somethingElse", "=", 2)
        )
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a query with a NOT FilterExpression", async () => {
      let data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("NOT", (qb) =>
          qb.filterExpression("someBoolean", "=", true)
        )
        .execute();

      expect(data).toMatchSnapshot();

      data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("someBoolean", "=", true)
        .orFilterExpression("NOT", (qb) =>
          qb.filterExpression("somethingElse", "=", 0)
        )
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a query with a BETWEEN FilterExpression", async () => {
      let data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("somethingElse", "BETWEEN", 0, 10)
        .execute();

      expect(data).toMatchSnapshot();

      data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("someBoolean", "=", true)
        .orFilterExpression("somethingElse", "BETWEEN", 9, 10)
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles conditions on nested keys", async () => {
      const data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("nested.nestedBoolean", "=", true)
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a FilterExpression that uses attribute_exists and attribute_not_exists", async () => {
      let data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("nested.nestedString", "attribute_exists")
        .execute();

      expect(data).toMatchSnapshot();

      data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("nested.nestedString", "attribute_not_exists")
        .attributes(["userId"])
        .execute();

      expect(data).toMatchSnapshot();
    });

    it("handles a FilterExpression that uses begins_with", async () => {
      let data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("nested.nestedString", "begins_with", "k")
        .execute();

      expect(data).toMatchSnapshot();

      data = await tsynamoClient
        .query("myTable")
        .keyCondition("userId", "=", "123")
        .filterExpression("nested.nestedString", "begins_with", "ke")
        .execute();

      expect(data).toMatchSnapshot();
    });
  });
});

const TEST_ITEM_1 = {
  userId: "123",
  dataTimestamp: 222,
  somethingElse: 2,
  someBoolean: true,
};

const TEST_ITEM_2 = {
  userId: "321",
  dataTimestamp: 333,
  somethingElse: 3,
  someBoolean: false,
};

const TEST_ITEM_3 = {
  userId: "123",
  dataTimestamp: 333,
  somethingElse: 10,
  someBoolean: false,
};

const TEST_ITEM_4 = {
  userId: "123",
  dataTimestamp: 999,
  somethingElse: 0,
  someBoolean: false,
};

const TEST_ITEM_5 = {
  userId: "123",
  dataTimestamp: 111,
  somethingElse: -5,
  someBoolean: true,
  nested: {
    nestedString: "koy",
    nestedBoolean: false,
  },
};

const TEST_ITEM_6 = {
  userId: "123",
  stringTimestamp: "111",
  somethingElse: -5,
  someBoolean: true,
};

const TEST_ITEM_7 = {
  userId: "123",
  stringTimestamp: "123",
  somethingElse: -5,
  someBoolean: true,
};

const TEST_ITEM_8 = {
  userId: "123",
  dataTimestamp: 999,
  somethingElse: 0,
  someBoolean: false,
  nested: {
    nestedString: "key",
    nestedBoolean: true,
  },
};

/**
 * Re-create a DynamoDB table called "myTable" with some test data.
 */
const setupTestDatabase = async (client: DynamoDBDocumentClient) => {
  try {
    await client.send(
      new DeleteTableCommand({
        TableName: "myTable",
      })
    );
  } catch (e: unknown) {
    if (!(e instanceof ResourceNotFoundException)) {
      throw e;
    }
  }

  try {
    await client.send(
      new DeleteTableCommand({
        TableName: "myOtherTable",
      })
    );
  } catch (e: unknown) {
    if (!(e instanceof ResourceNotFoundException)) {
      throw e;
    }
  }

  await client.send(
    new CreateTableCommand({
      TableName: "myTable",
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" },
        { AttributeName: "dataTimestamp", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "userId",
          AttributeType: "S",
        },
        {
          AttributeName: "dataTimestamp",
          AttributeType: "N",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  await client.send(
    new CreateTableCommand({
      TableName: "myOtherTable",
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" },
        { AttributeName: "stringTimestamp", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "userId",
          AttributeType: "S",
        },
        {
          AttributeName: "stringTimestamp",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myTable",
      Item: TEST_ITEM_1,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myTable",
      Item: TEST_ITEM_2,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myTable",
      Item: TEST_ITEM_3,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myTable",
      Item: TEST_ITEM_4,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myTable",
      Item: TEST_ITEM_5,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myOtherTable",
      Item: TEST_ITEM_6,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myOtherTable",
      Item: TEST_ITEM_7,
    })
  );

  await client.send(
    new PutCommand({
      TableName: "myTable",
      Item: TEST_ITEM_8,
    })
  );
};
