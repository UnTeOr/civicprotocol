import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no types
import { checkSchemaOwnership, PLATFORM } from "../../scripts/check-schema-ownership.mjs";

describe("schema ownership", () => {
  it(`only touches the ${PLATFORM} schema and approved shared public tables`, () => {
    const violations: string[] = checkSchemaOwnership();
    expect(
      violations,
      violations.length
        ? `Schema ownership violations found. Correct THIS project only:\n${violations
            .map((v) => `  - ${v}`)
            .join("\n")}`
        : "",
    ).toEqual([]);
  });
});
