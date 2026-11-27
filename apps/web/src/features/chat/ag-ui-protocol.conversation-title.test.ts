import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  observeCustomEvent,
  parseConversationTitleEvent,
  type AgUiRunFence,
} from "./ag-ui-protocol";

function makeActiveRun(overrides: Partial<AgUiRunFence> = {}): AgUiRunFence {
  return {
    conversationId: "conv-123",
    epoch: 1,
    phase: "active",
    runId: "run-123",
    sourceCount: 0,
    metadataSeen: true,
    citationsSeen: true,
    ...overrides,
  };
}

describe("conversation.title AG-UI event handling", () => {
  it("parses valid conversation.title payloads", () => {
    const parsed = parseConversationTitleEvent({
      conversationId: "conv-123",
      title: "  PostgreSQL Partitioning Guide  ",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.title, "PostgreSQL Partitioning Guide");
    }
  });

  it("accepts valid conversation.title custom events during active runs", () => {
    const run = makeActiveRun();
    const result = observeCustomEvent(run, "conversation.title", {
      conversationId: "conv-123",
      title: "PostgreSQL Partitioning Guide",
    });
    assert.deepEqual(result, {
      type: "conversation.title",
      conversationId: "conv-123",
      title: "PostgreSQL Partitioning Guide",
    });
  });

  it("ignores malformed or mismatched conversation.title payloads non-fatally", () => {
    const run = makeActiveRun();

    const malformed = observeCustomEvent(run, "conversation.title", {
      conversationId: "conv-123",
      title: "   ",
    });
    assert.deepEqual(malformed, { type: "accepted" });

    const wrongConv = observeCustomEvent(run, "conversation.title", {
      conversationId: "conv-other",
      title: "Wrong Conversation",
    });
    assert.deepEqual(wrongConv, { type: "accepted" });

    const beforeMetadata = observeCustomEvent(
      makeActiveRun({ metadataSeen: false }),
      "conversation.title",
      {
        conversationId: "conv-123",
        title: "Early Event",
      }
    );
    assert.deepEqual(beforeMetadata, { type: "accepted" });
  });
});
