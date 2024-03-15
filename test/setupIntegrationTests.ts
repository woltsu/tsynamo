import { StartedTestContainer } from "testcontainers";
import { beforeAll, beforeEach } from "vitest";
import { setupTestDDB } from "./testFixture";
import { getDDBClientFor, startDDBTestContainer } from "./testUtil";

let testContainer: StartedTestContainer;

beforeAll(async () => {
  testContainer = await startDDBTestContainer();
});

beforeEach(async () => {
  const ddbClient = await getDDBClientFor(testContainer);
  await setupTestDDB(ddbClient);
});
