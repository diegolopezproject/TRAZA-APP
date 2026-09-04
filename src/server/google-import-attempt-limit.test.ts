import { describe, expect, it } from "vitest";
import {
  GoogleImportAttemptLimiter,
  type GoogleImportAttemptDataResult,
  type GoogleImportAttemptDataSource,
} from "./google-import-attempt-limit";

const INSTALLATION_LIMIT = 10;
const GLOBAL_LIMIT = 50;

class AtomicDailyUsageDataSource implements GoogleImportAttemptDataSource {
  private usageDay = "2026-09-04";
  private readonly globalCounts = new Map<string, number>();
  private readonly installationCounts = new Map<string, number>();
  private transaction = Promise.resolve();

  setUtcDay(usageDay: string) {
    this.usageDay = usageDay;
  }

  deleteImportedPlace() {
    // Quota is intentionally independent from saved-place lifecycle state.
  }

  async consume(installationId: string): Promise<GoogleImportAttemptDataResult> {
    const transaction = this.transaction.then(async () => {
      await Promise.resolve();
      const installationKey = `${this.usageDay}:${installationId}`;
      const globalCount = this.globalCounts.get(this.usageDay) ?? 0;
      const installationCount = this.installationCounts.get(installationKey) ?? 0;
      if (globalCount >= GLOBAL_LIMIT || installationCount >= INSTALLATION_LIMIT) {
        return { data: false, error: null };
      }
      this.globalCounts.set(this.usageDay, globalCount + 1);
      this.installationCounts.set(installationKey, installationCount + 1);
      return { data: true, error: null };
    });
    this.transaction = transaction.then(() => undefined);
    return transaction;
  }
}

function createHarness() {
  const dataSource = new AtomicDailyUsageDataSource();
  return { dataSource, limiter: new GoogleImportAttemptLimiter(dataSource) };
}

describe("daily Google import attempt limit", () => {
  it("allows attempts 1 through 10 for one installation and blocks attempt 11", async () => {
    const { limiter } = createHarness();
    const outcomes = [];
    for (let attempt = 1; attempt <= 11; attempt += 1) {
      outcomes.push(await limiter.consume("018f47f5-4f43-7c8f-8f47-2b9ef863f483"));
    }

    expect(outcomes.slice(0, 10)).toEqual(
      Array.from({ length: 10 }, () => ({ kind: "allowed" })),
    );
    expect(outcomes[10]).toEqual({ kind: "exhausted" });
  });

  it("allows another installation independently", async () => {
    const { limiter } = createHarness();
    for (let attempt = 0; attempt < INSTALLATION_LIMIT; attempt += 1) {
      await limiter.consume("018f47f5-4f43-7c8f-8f47-2b9ef863f483");
    }

    await expect(
      limiter.consume("028f47f5-4f43-7c8f-8f47-2b9ef863f483"),
    ).resolves.toEqual({ kind: "allowed" });
  });

  it("blocks the global attempt 51", async () => {
    const { limiter } = createHarness();
    const outcomes = [];
    for (let attempt = 0; attempt < GLOBAL_LIMIT + 1; attempt += 1) {
      const installation = `${String(Math.floor(attempt / 10)).padStart(8, "0")}-4f43-7c8f-8f47-2b9ef863f483`;
      outcomes.push(await limiter.consume(installation));
    }

    expect(outcomes.filter((outcome) => outcome.kind === "allowed")).toHaveLength(50);
    expect(outcomes[50]).toEqual({ kind: "exhausted" });
  });

  it("does not restore quota when an imported place is deleted", async () => {
    const { dataSource, limiter } = createHarness();
    for (let attempt = 0; attempt < INSTALLATION_LIMIT; attempt += 1) {
      await limiter.consume("018f47f5-4f43-7c8f-8f47-2b9ef863f483");
    }

    dataSource.deleteImportedPlace();

    await expect(
      limiter.consume("018f47f5-4f43-7c8f-8f47-2b9ef863f483"),
    ).resolves.toEqual({ kind: "exhausted" });
  });

  it("resets availability on the next UTC day", async () => {
    const { dataSource, limiter } = createHarness();
    for (let attempt = 0; attempt < INSTALLATION_LIMIT; attempt += 1) {
      await limiter.consume("018f47f5-4f43-7c8f-8f47-2b9ef863f483");
    }
    dataSource.setUtcDay("2026-09-05");

    await expect(
      limiter.consume("018f47f5-4f43-7c8f-8f47-2b9ef863f483"),
    ).resolves.toEqual({ kind: "allowed" });
  });

  it("does not exceed either cap under concurrent consumption", async () => {
    const { limiter } = createHarness();
    const outcomes = await Promise.all(
      Array.from({ length: 75 }, (_, attempt) =>
        limiter.consume(
          `${String(Math.floor(attempt / 15)).padStart(8, "0")}-4f43-7c8f-8f47-2b9ef863f483`,
        ),
      ),
    );

    expect(outcomes.filter((outcome) => outcome.kind === "allowed")).toHaveLength(50);
    for (let installation = 0; installation < 5; installation += 1) {
      expect(
        outcomes
          .slice(installation * 15, installation * 15 + 15)
          .filter((outcome) => outcome.kind === "allowed"),
      ).toHaveLength(10);
    }
  });

  it("fails closed on a database error or malformed RPC response", async () => {
    const failed = new GoogleImportAttemptLimiter({
      consume: async () => ({ data: null, error: { code: "database-error" } }),
    });
    const malformed = new GoogleImportAttemptLimiter({
      consume: async () => ({ data: "true", error: null }),
    });

    await expect(failed.consume("installation")).resolves.toEqual({ kind: "failed" });
    await expect(malformed.consume("installation")).resolves.toEqual({ kind: "failed" });
  });
});
