import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduledRequestIsAuthorized } from "../src/lib/automation-request";

test("scheduled requests accept Vercel CRON_SECRET even when another automation secret exists", () => {
  const previousCron = process.env.CRON_SECRET;
  const previousAutomation = process.env.MORROW_AUTOMATION_SECRET;
  try {
    process.env.CRON_SECRET = "vercel-test-secret-123";
    process.env.MORROW_AUTOMATION_SECRET = "other-test-secret-456";

    assert.equal(
      scheduledRequestIsAuthorized(
        new Request("https://morrow.example/api/automations/daily-intelligence", {
          headers: { authorization: "Bearer vercel-test-secret-123" },
        })
      ),
      true
    );
    assert.equal(
      scheduledRequestIsAuthorized(
        new Request("https://morrow.example/api/automations/daily-intelligence", {
          headers: { authorization: "Bearer invalid-secret" },
        })
      ),
      false
    );
    assert.equal(
      scheduledRequestIsAuthorized(
        new Request("https://morrow.example/api/automations/daily-intelligence", {
          headers: { authorization: "vercel-test-secret-123" },
        })
      ),
      false
    );
  } finally {
    if (previousCron === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousCron;
    if (previousAutomation === undefined) delete process.env.MORROW_AUTOMATION_SECRET;
    else process.env.MORROW_AUTOMATION_SECRET = previousAutomation;
  }
});
