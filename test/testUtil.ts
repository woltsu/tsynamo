import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GenericContainer, StartedTestContainer } from "testcontainers";

const DDB_PORT = 8000 as const;

export const startDDBTestContainer = async () => {
  return new GenericContainer("amazon/dynamodb-local:2.5.0")
    .withReuse()
    .withExposedPorts(DDB_PORT)
    .start();
};

export const getDDBClientFor = async (container: StartedTestContainer) => {
  const containerUrl = `http://${container.getHost()}:${container.getMappedPort(
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

  return DynamoDBDocumentClient.from(new DynamoDBClient(opts));
};
