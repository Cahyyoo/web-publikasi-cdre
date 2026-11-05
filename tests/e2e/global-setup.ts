import { removeTestData } from "./cleanup";

/** Clears anything an interrupted run left behind. */
export default async function globalSetup() {
  await removeTestData();
}
