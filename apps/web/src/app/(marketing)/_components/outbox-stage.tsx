"use client";

import {
  ArrowUp,
  FileText,
  Layers,
  MessageSquareText,
  Search,
} from "lucide-react";
import { useThemeMode } from "@repo/ui";
import {
  Bar,
  Collapse,
  Field,
  Stage,
  Stream,
  Text,
  Window,
  type Act,
  type Layout,
} from "@/components/stageshow-kit";
import "./outbox-stage.css";

const Q = "How does Outbox keep uploads durable?";
const A =
  "Uploads write both the Document row and OutboxEvent in one ACID transaction (<25ms). Workers then lock each job with a fencing token before committing 768d pgvector chunks.";
const WORDS = A.split(" ").length;

const CITATIONS = [
  {
    id: 1,
    file: "annual-report-2025.pdf",
    page: "p.12",
    score: "0.942 cosine",
    snippet:
      "POST /documents validates the SHA-256 hash, persists the object, and commits Document + OutboxEvent in a single ACID transaction (<25ms).",
  },
  {
    id: 2,
    file: "architecture-spec.md",
    page: "p.4",
    score: "0.891 cosine",
    snippet:
      "Each ingestion worker claims a UUID v4 processing_token and verifies lease ownership via SELECT ... FOR UPDATE before committing chunks.",
  },
] as const;

type SceneState = {
  focused: boolean;
  draft: string;
  sent: boolean;
  status: "idle" | "routing" | "retrieved";
  phase: "idle" | "answer";
  words: number;
  sources: boolean;
  inspected: number | null;
};

const INITIAL_STATE: SceneState = {
  focused: false,
  draft: "",
  sent: false,
  status: "idle",
  phase: "idle",
  words: 0,
  sources: false,
  inspected: null,
};

const POSTER_STATE: SceneState = {
  focused: false,
  draft: "",
  sent: true,
  status: "retrieved",
  phase: "answer",
  words: WORDS,
  sources: true,
  inspected: 1,
};

const REST = {
  wide: { x: 740, y: 310 },
  compact: { x: 276, y: 310 },
};

async function script(a: Act<SceneState>) {
  await a.wait(500);

  // 1. Focus composer & type query
  await a.move({ at: "composer", x: 0.42, y: 0.5 });
  await a.click();
  await a.set({ focused: true });
  await a.type("draft", Q, { interval: 32 });
  await a.wait(260);

  // 2. Click Send button
  await a.move({ at: "send", x: 0.5, y: 0.5 });
  await a.wait(140);
  await a.click();
  await a.set({ sent: true, draft: "", focused: false, status: "routing" });
  await a.wait(720);

  // 3. Retrieval status + word-by-word answer stream
  await a.set({ status: "retrieved", phase: "answer" });
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i });
    await a.wait(36);
  }

  // 4. Staggered citation chips arrive
  await a.wait(220);
  await a.set({ sources: true });
  await a.wait(420);

  // 5. Payoff: cursor inspects citation [1] to open origin-aware provenance popover
  await a.move({ at: "cite-1", x: 0.5, y: 0.5 });
  await a.wait(180);
  await a.click();
  await a.set({ inspected: 1 });
  await a.move("rest");
  await a.wait(2200);

  // 6. Clean exit back to initial state for a seamless infinite loop
  await a.set({ inspected: null });
  await a.wait(200);
  await a.set({ sources: false });
  await a.wait(220);
  await a.set({ phase: "idle", status: "idle", sent: false });
  await a.wait(320);
  a.snap({ words: 0 });
  await a.wait(450);
}

function Sidebar() {
  return (
    <div className="ob-side">
      <div className="ob-workspace">
        <span className="ob-workspace__mark" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5v13M1.5 8h13M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <Text className="ob-workspace__name">Outbox</Text>
        <Text className="ob-workspace__tag">v2</Text>
      </div>

      <div className="ob-side-group">
        <div className="ob-nav" data-active>
          <MessageSquareText
            size={14}
            strokeWidth={1.75}
            className="ob-nav__icon"
            aria-hidden
          />
          <Text className="ob-nav__label">Assistant</Text>
        </div>

        <div className="ob-nav">
          <FileText
            size={14}
            strokeWidth={1.75}
            className="ob-nav__icon"
            aria-hidden
          />
          <Text className="ob-nav__label">Documents</Text>
          <Text className="ob-nav__count">3</Text>
        </div>

        <div className="ob-nav">
          <Search
            size={14}
            strokeWidth={1.75}
            className="ob-nav__icon"
            aria-hidden
          />
          <Text className="ob-nav__label">Search</Text>
        </div>

        <div className="ob-nav">
          <Layers
            size={14}
            strokeWidth={1.75}
            className="ob-nav__icon"
            aria-hidden
          />
          <Text className="ob-nav__label">Outbox</Text>
        </div>
      </div>

      <div className="ob-side-group">
        <div className="ob-side-heading">Indexed sources</div>
        <div className="ob-doc">
          <span className="ob-doc__dot" aria-hidden />
          <Text className="ob-doc__name">annual-report-2025.pdf</Text>
        </div>
        <div className="ob-doc">
          <span className="ob-doc__dot" aria-hidden />
          <Text className="ob-doc__name">architecture-spec.md</Text>
        </div>
        <div className="ob-doc ob-doc--fill">
          <Bar w={6} h={6} r={3} tone={2} />
          <Bar w={104} h={6} tone={2} />
        </div>
        <div className="ob-doc ob-doc--fill">
          <Bar w={6} h={6} r={3} tone={1} />
          <Bar w={84} h={6} tone={1} />
        </div>
      </div>
    </div>
  );
}

function Scene({ s, layout }: { s: SceneState; layout: Layout }) {
  const compact = layout === "compact";
  const activeCitation =
    CITATIONS.find((c) => c.id === s.inspected) ?? null;

  const lead = (
    <div className="ob-crumbs">
      <Text className="ob-crumbs__muted">project-sea</Text>
      <span className="ob-crumbs__sep" aria-hidden>
        /
      </span>
      <Text className="ob-crumbs__active">Assistant</Text>
    </div>
  );

  const toolbar = (
    <div className="ob-toolbar">
      <div className="ob-status-chip">
        <span className="ob-status-chip__dot" aria-hidden />
        <Text>3 docs indexed</Text>
      </div>
    </div>
  );

  const body = (
    <div className="ob-chat">
      <div className="ob-thread">
        <Collapse open={s.sent} reveal="drop" from="below">
          <div className="ob-q">
            <Text>{Q}</Text>
          </div>
        </Collapse>

        <Collapse open={s.status !== "idle"}>
          <div
            className="ob-stage-status"
            data-done={s.status === "retrieved" ? "true" : undefined}
          >
            <span className="ob-stage-status__dot" aria-hidden />
            <Text>
              {s.status === "routing"
                ? "QueryRouter · KNOWLEDGE (0.4ms)"
                : "pgvector HNSW · 2 chunks matched (0.94)"}
            </Text>
          </div>
        </Collapse>

        <Collapse open={s.phase === "answer"}>
          <div className="ob-a">
            <Stream className="ob-stream" text={A} count={s.words} />

            <div className="ob-sources" data-on={s.sources ? "true" : undefined}>
              <div
                className="ob-popover"
                data-open={s.sources && activeCitation !== null ? "true" : undefined}
              >
                {activeCitation && (
                  <>
                    <div className="ob-popover__head">
                      <span className="ob-popover__file">
                        [{activeCitation.id}] {activeCitation.file} ·{" "}
                        {activeCitation.page}
                      </span>
                      <span className="ob-popover__score">
                        {activeCitation.score}
                      </span>
                    </div>
                    <p className="ob-popover__snippet">
                      {activeCitation.snippet}
                    </p>
                  </>
                )}
              </div>

              {CITATIONS.map((cite, idx) => (
                <div
                  key={cite.id}
                  data-target={cite.id === 1 ? "cite-1" : "cite-2"}
                  data-index={idx}
                  data-active={s.inspected === cite.id ? "true" : undefined}
                  className="ob-cite"
                >
                  <span className="ob-cite__num">[{cite.id}]</span>
                  <span>
                    {cite.file} · {cite.page}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Collapse>
      </div>

      <div className="ob-composer-row" data-focused={s.focused ? "true" : undefined}>
        <div className="ob-composer-field" data-target="composer">
          <Field
            value={s.draft}
            placeholder="Ask about your documents…"
            focused={s.focused}
          />
        </div>
        <div
          className="ob-send-btn"
          data-target="send"
          data-disabled={!s.draft ? "true" : undefined}
          aria-hidden="true"
        >
          <ArrowUp size={14} strokeWidth={2.2} />
        </div>
      </div>

      <span
        data-target="rest"
        style={{
          position: "absolute",
          left: REST[layout].x,
          top: REST[layout].y,
        }}
      />
    </div>
  );

  return (
    <div className="ob-mask">
      {compact ? (
        <Window lead={lead} toolbar={toolbar} className="ob-win">
          {body}
        </Window>
      ) : (
        <Window
          lead={lead}
          toolbar={toolbar}
          sidebar={<Sidebar />}
          sidebarWidth={192}
          className="ob-win"
        >
          {body}
        </Window>
      )}
    </div>
  );
}

export function OutboxStage() {
  const theme = useThemeMode();

  return (
    <div className="ob-stage">
      <Stage
        width={920}
        height={464}
        compact={{ below: 640, width: 358, height: 420 }}
        theme={theme}
        greys="cool"
        initial={INITIAL_STATE}
        poster={POSTER_STATE}
        script={script}
        cursor={{ at: REST, style: "real", ripple: true }}
        play="loop"
      >
        {(s, _rect, layout) => <Scene s={s} layout={layout} />}
      </Stage>
    </div>
  );
}
