import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { conversationKeys } from "./keys";
import {
  applyConversationTitleToCache,
  DEFAULT_CONVERSATION_TITLE,
  formatConversationTitle,
} from "./title";
import type { Conversation, ConversationCursorPage } from "./types";

describe("formatConversationTitle", () => {
  it("falls back to New chat for null, undefined, or whitespace titles", () => {
    assert.equal(formatConversationTitle(null), DEFAULT_CONVERSATION_TITLE);
    assert.equal(
      formatConversationTitle(undefined),
      DEFAULT_CONVERSATION_TITLE
    );
    assert.equal(formatConversationTitle("   "), DEFAULT_CONVERSATION_TITLE);
  });

  it("returns trimmed non-empty titles", () => {
    assert.equal(
      formatConversationTitle("  SQL Join Optimization  "),
      "SQL Join Optimization"
    );
  });
});

describe("applyConversationTitleToCache", () => {
  it("updates both detail and list caches when the conversation is present", () => {
    const queryClient = new QueryClient();
    const convA: Conversation = {
      id: "conv-1",
      knowledge_base_id: "kb-1",
      title: null,
      created_at: "2026-11-25T10:00:00Z",
      updated_at: "2026-11-25T10:00:00Z",
    };
    const convB: Conversation = {
      id: "conv-2",
      knowledge_base_id: "kb-1",
      title: "Existing Chat",
      created_at: "2026-11-25T09:00:00Z",
      updated_at: "2026-11-25T09:00:00Z",
    };
    const page: ConversationCursorPage = {
      items: [convA, convB],
      page_info: {
        has_next_page: false,
        has_previous_page: false,
        next_cursor: null,
        previous_cursor: null,
        page_size: 20,
      },
    };

    queryClient.setQueryData(conversationKeys.detail("conv-1"), convA);
    queryClient.setQueryData(conversationKeys.list("kb-1"), page);

    applyConversationTitleToCache(queryClient, {
      conversationId: "conv-1",
      title: "SQL Index Internals",
    });

    const updatedDetail = queryClient.getQueryData<Conversation>(
      conversationKeys.detail("conv-1")
    );
    assert.equal(updatedDetail?.title, "SQL Index Internals");

    const updatedList = queryClient.getQueryData<ConversationCursorPage>(
      conversationKeys.list("kb-1")
    );
    assert.equal(updatedList?.items[0]?.title, "SQL Index Internals");
    assert.equal(updatedList?.items[1]?.title, "Existing Chat");
  });

  it("invalidates list queries if the conversation is missing from cached lists", () => {
    const queryClient = new QueryClient();
    let invalidatedCount = 0;
    const originalInvalidate = queryClient.invalidateQueries.bind(queryClient);
    queryClient.invalidateQueries = ((filters) => {
      invalidatedCount += 1;
      return originalInvalidate(filters);
    }) as typeof queryClient.invalidateQueries;

    applyConversationTitleToCache(queryClient, {
      conversationId: "conv-missing",
      title: "Vector Search Architecture",
    });

    assert.equal(invalidatedCount, 1);
  });

  it("updates array-shaped list caches and safely skips unexpected cache shapes", () => {
    const queryClient = new QueryClient();
    const convA: Conversation = {
      id: "conv-arr-1",
      knowledge_base_id: "kb-arr",
      title: null,
      created_at: "2026-11-25T10:00:00Z",
      updated_at: "2026-11-25T10:00:00Z",
    };

    queryClient.setQueryData(conversationKeys.list("kb-unexpected"), {
      unexpected: true,
    });
    queryClient.setQueryData(conversationKeys.list("kb-arr"), [convA]);

    applyConversationTitleToCache(queryClient, {
      conversationId: "conv-arr-1",
      title: "Array Cache Title",
    });

    const updated = queryClient.getQueryData<Conversation[]>(
      conversationKeys.list("kb-arr")
    );
    assert.equal(updated?.[0]?.title, "Array Cache Title");
    assert.deepEqual(
      queryClient.getQueryData(conversationKeys.list("kb-unexpected")),
      { unexpected: true }
    );
  });

  it("skips no-op cache writes when detail and list already match the title", () => {
    const queryClient = new QueryClient();
    const convA: Conversation = {
      id: "conv-noop",
      knowledge_base_id: "kb-noop",
      title: "Same Title",
      created_at: "2026-11-25T10:00:00Z",
      updated_at: "2026-11-25T10:00:00Z",
    };
    const page: ConversationCursorPage = {
      items: [convA],
      page_info: {
        has_next_page: false,
        has_previous_page: false,
        next_cursor: null,
        previous_cursor: null,
        page_size: 20,
      },
    };

    queryClient.setQueryData(conversationKeys.detail("conv-noop"), convA);
    queryClient.setQueryData(conversationKeys.list("kb-noop"), page);

    let setQueryDataCalls = 0;
    const originalSetQueryData = queryClient.setQueryData.bind(queryClient);
    queryClient.setQueryData = ((...args: unknown[]) => {
      setQueryDataCalls += 1;
      return (originalSetQueryData as (...a: unknown[]) => unknown)(...args);
    }) as typeof queryClient.setQueryData;

    applyConversationTitleToCache(queryClient, {
      conversationId: "conv-noop",
      title: "Same Title",
    });

    assert.equal(setQueryDataCalls, 1);
    assert.equal(
      queryClient.getQueryData(conversationKeys.detail("conv-noop")),
      convA
    );
    assert.equal(
      queryClient.getQueryData(conversationKeys.list("kb-noop")),
      page
    );
  });
});
