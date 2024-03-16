import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { PartitionKey, SortKey } from "../src";
import {
  CreateTableCommand,
  DeleteTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";

/**
 * Tsynamo interface for testing
 */
export interface DDB {
  myTable: {
    userId: PartitionKey<string>;
    dataTimestamp: SortKey<number>;
    somethingElse: number;
    someBoolean: boolean;
    nested: {
      nestedString: number;
      nestedBoolean: boolean;
      nestedNested: {
        nestedNestedBoolean: boolean;
      };
    };
  };
  myOtherTable: {
    userId: PartitionKey<string>;
    stringTimestamp: SortKey<string>;
    somethingElse: number;
    someBoolean: boolean;
    tuple: [
      {
        beer: string;
      },
      {
        bar: string;
      }
    ];
    cats: {
      name: string;
      age: number;
    }[];
  };
}

/**
 * Re-create DDB tables with test data for integration test environment.
 */
export const setupTestDDB = async (client: DynamoDBDocumentClient) => {
  await createTableIfNotExists(client, "myTable");
  await createTableIfNotExists(client, "myOtherTable");

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

  for (const item of TEST_DATA) {
    if (Object.hasOwn(item, "stringTimestamp")) {
      await client.send(
        new PutCommand({
          TableName: "myOtherTable",
          Item: item,
        })
      );
    } else {
      await client.send(
        new PutCommand({
          TableName: "myTable",
          Item: item,
        })
      );
    }
  }
};

const createTableIfNotExists = async (
  client: DynamoDBDocumentClient,
  table: string
) => {
  try {
    await client.send(
      new DeleteTableCommand({
        TableName: table,
      })
    );
  } catch (e: unknown) {
    if (!(e instanceof ResourceNotFoundException)) {
      throw e;
    }
  }
};

export const TEST_DATA = [
  {
    userId: "123",
    dataTimestamp: 222,
    somethingElse: 2,
    someBoolean: true,
  },
  {
    userId: "321",
    dataTimestamp: 333,
    somethingElse: 3,
    someBoolean: false,
  },
  {
    userId: "123",
    dataTimestamp: 333,
    somethingElse: 10,
    someBoolean: false,
  },
  {
    userId: "123",
    dataTimestamp: 999,
    somethingElse: 0,
    someBoolean: false,
  },
  {
    userId: "123",
    dataTimestamp: 111,
    somethingElse: -5,
    someBoolean: true,
    nested: {
      nestedString: "koy",
      nestedBoolean: false,
    },
  },
  {
    userId: "123",
    stringTimestamp: "111",
    somethingElse: -5,
    someBoolean: true,
  },
  {
    userId: "123",
    stringTimestamp: "123",
    somethingElse: -5,
    someBoolean: true,
    tuple: [
      {
        beer: "karhu",
      },
      {
        bar: "oljenkorsi",
      },
    ],
    cats: [
      {
        name: "Pekka Töpöhäntä",
        age: 42,
      },
      {
        name: "Sylvester J. Pussycat Sr.",
        age: 78,
      },
    ],
  },
  {
    userId: "123",
    dataTimestamp: 999,
    somethingElse: 0,
    someBoolean: false,
    nested: {
      nestedString: "key",
      nestedBoolean: true,
    },
  },
  {
    userId: "123",
    dataTimestamp: 996,
    somethingElse: -9,
    someBoolean: false,
    nested: {
      nestedString: "llol",
      nestedBoolean: true,
      nestedNested: {
        nestedNestedBoolean: true,
      },
    },
  },
] as const;
