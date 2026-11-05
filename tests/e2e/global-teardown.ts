import { removeTestData } from "./cleanup";

export default async function globalTeardown() {
  await removeTestData();
}
