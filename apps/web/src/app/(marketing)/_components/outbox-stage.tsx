"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowUp,
  Check,
  ChevronRight,
  FileCode2,
  FileText,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import { LogoIcon, useThemeMode } from "@repo/ui";
import {
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

const DOCS = [
  { id: 1, name: "annual-report-2025.pdf", icon: "pdf", score: "0.94" },
  { id: 2, name: "architecture-spec.md", icon: "md", score: "0.89" },
  { id: 3, name: "pgvector-schema.sql", icon: "sql", score: null },
] as const;

const CITATIONS = [
  {
    id: 1,
    file: "annual-report-2025.pdf",
    page: "p.12",
    score: "0.942 cos",
    provenance: "ACID tx · <25ms commit · chunk #12",
    snippet:
      "POST /documents validates the SHA-256 hash, persists the object, and commits Document + OutboxEvent in a single ACID transaction (<25ms).",
  },
  {
    id: 2,
    file: "architecture-spec.md",
    page: "p.4",
    score: "0.891 cos",
    provenance: "UUID v4 fencing token · FOR UPDATE",
    snippet:
      "Each ingestion worker claims a UUID v4 processing_token and verifies lease ownership via SELECT ... FOR UPDATE before committing chunks.",
  },
] as const;

type PressTarget = "send" | "cite-1" | null;

type SceneState = {
  focused: boolean;
  draft: string;
  pressing: PressTarget;
  hoveredCite: number | null;
  sent: boolean;
  status: "idle" | "routing" | "retrieved";
  phase: "idle" | "answer";
  words: number;
  sources: boolean;
  inspected: number | null;
  resetting: boolean;
};

const INITIAL_STATE: SceneState = {
  focused: false,
  draft: "",
  pressing: null,
  hoveredCite: null,
  sent: false,
  status: "idle",
  phase: "idle",
  words: 0,
  sources: false,
  inspected: null,
  resetting: false,
};

const POSTER_STATE: SceneState = {
  focused: false,
  draft: "",
  pressing: null,
  hoveredCite: null,
  sent: true,
  status: "retrieved",
  phase: "answer",
  words: WORDS,
  sources: true,
  inspected: 1,
  resetting: false,
};

const REST = {
  wide: { x: 874, y: 268 },
  compact: { x: 308, y: 294 },
};

async function script(a: Act<SceneState>) {
  // 1. Calm opening beat
  await a.wait(420);

  // 2. Focus composer and type smoothly
  await a.move({ at: "composer", x: 0.34, y: 0.5 });
  await a.click();
  await a.set({ focused: true });
  await a.wait(120);
  await a.type("draft", Q, { interval: 26 });
  await a.wait(220);

  // 3. Tactile send press (0.97 scale -> release -> send)
  await a.move({ at: "send", x: 0.5, y: 0.5 });
  await a.wait(110);
  await a.set({ pressing: "send" });
  await a.click();
  await a.wait(90);
  await a.set({
    pressing: null,
    sent: true,
    draft: "",
    focused: false,
    status: "routing",
  });

  // 4. Retrieval shimmer beat
  await a.wait(660);
  await a.set({ status: "retrieved", phase: "answer" });
  await a.wait(120);

  // 5. Stream grounded answer
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i });
    await a.wait(30);
  }

  // 6. Staggered citation reveal
  await a.wait(160);
  await a.set({ sources: true });
  await a.wait(360);

  // 7. Hover anticipation + tactile click on Citation 1
  await a.move({ at: "cite-1", x: 0.5, y: 0.5 });
  await a.set({ hoveredCite: 1 });
  await a.wait(160);
  await a.set({ pressing: "cite-1" });
  await a.click();
  await a.wait(85);
  await a.set({ pressing: null, inspected: 1 });

  // 8. Clear cursor to open space for reading
  await a.move("rest");
  await a.set({ hoveredCite: null });
  await a.wait(2600);

  // 9. Crisp popover exit + unified canvas exhale
  await a.set({ inspected: null });
  await a.wait(160);
  await a.set({ resetting: true });
  await a.wait(270);
  a.snap(INITIAL_STATE);
  await a.wait(360);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function Sidebar({ state }: { state: SceneState }) {
  const retrievedIds = state.status === "retrieved" ? [1, 2] : [];
  const activeIndex = state.inspected ? state.inspected - 1 : -1;

  return (
    <aside className="ob-sidebar" aria-label="Workspace navigation">
      <div className="ob-brand">
        <LogoIcon className="size-5 shrink-0" />
        <Text className="ob-brand-name">Outbox</Text>
      </div>

      <div className="ob-nav-section">
        <div className="ob-nav-label">Workspace</div>
        <div className="ob-nav-item" data-active="true">
          <MessageSquare size={14} strokeWidth={1.75} className="ob-nav-icon" />
          <Text>Assistant</Text>
        </div>
        <div className="ob-nav-item">
          <FileText size={14} strokeWidth={1.75} className="ob-nav-icon" />
          <Text>Documents</Text>
          <Text className="ob-nav-count">3</Text>
        </div>
        <div className="ob-nav-item">
          <Search size={14} strokeWidth={1.75} className="ob-nav-icon" />
          <Text>Search</Text>
        </div>
        <div className="ob-nav-item">
          <Activity size={14} strokeWidth={1.75} className="ob-nav-icon" />
          <Text>Ops</Text>
        </div>
      </div>

      <div className="ob-nav-section">
        <div className="ob-nav-label">Indexed sources</div>

        <div className="ob-doc-list">
          <span
            className="ob-doc-rail"
            data-visible={activeIndex >= 0}
            style={{
              transform: `translateY(${Math.max(0, activeIndex) * 32}px)`,
            }}
            aria-hidden="true"
          />

          {DOCS.map((doc) => {
            const isHit = retrievedIds.includes(doc.id);
            const isInspected = state.inspected === doc.id;

            return (
              <div
                key={doc.id}
                className="ob-doc-item"
                data-hit={isHit}
                data-inspected={isInspected}
              >
                <span className="ob-doc-icon" aria-hidden="true">
                  {doc.icon === "sql" ? (
                    <FileCode2 size={13} strokeWidth={1.7} />
                  ) : (
                    <FileText size={13} strokeWidth={1.7} />
                  )}
                </span>
                <Text className="ob-doc-name">{doc.name}</Text>
                {doc.score && (
                  <span
                    className="ob-doc-score"
                    data-visible={isHit}
                    aria-hidden="true"
                  >
                    {doc.score}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet engine status footer — anchors sidebar without badge clutter */}
      <div className="ob-sidebar-footer">
        <div className="ob-engine-row">
          <span className="ob-engine-label">Outbox</span>
          <span className="ob-engine-val">ACID · 0 lag</span>
        </div>
        <div className="ob-engine-row">
          <span className="ob-engine-label">Index</span>
          <span className="ob-engine-val">pgvector 768d</span>
        </div>
      </div>
    </aside>
  );
}

function Scene({ state, layout }: { state: SceneState; layout: Layout }) {
  const isCompact = layout === "compact";
  const hasDraft = state.draft.length > 0;
  const isStreaming = state.phase === "answer" && state.words < WORDS;

  return (
    <Window className="ob-window">
      <div className="ob-shell" data-compact={isCompact}>
        {!isCompact && <Sidebar state={state} />}

        <div className="ob-main">
          <div className="ob-topbar">
            <div className="ob-topbar-left">
              <Text className="ob-topbar-muted">project-sea</Text>
              <ChevronRight
                size={12}
                strokeWidth={1.8}
                className="ob-topbar-sep"
                aria-hidden="true"
              />
              <Text className="ob-topbar-title">Assistant</Text>
            </div>

            {/* Crossfading topbar status (never hard-snaps) */}
            <div className="ob-topbar-status">
              <span className="ob-status-dot" data-state={state.status} />
              <span className="ob-topbar-status-stack">
                <span
                  className="ob-topbar-status-text"
                  data-active={state.status !== "routing"}
                >
                  3 docs ready
                </span>
                <span
                  className="ob-topbar-status-text"
                  data-active={state.status === "routing"}
                >
                  Searching pgvector…
                </span>
              </span>
            </div>
          </div>

          <div className="ob-viewport ob-mask">
            {/* Serene opening state — crossfades out on send */}
            <div
              className="ob-empty"
              data-visible={!state.sent && !state.resetting}
              aria-hidden={state.sent}
            >
              <div className="ob-empty-mark">
                <LogoIcon className="size-4" />
              </div>
              <Text className="ob-empty-title">Ask your indexed corpus</Text>
              <Text className="ob-empty-sub">
                3 documents · 231 pgvector chunks synced
              </Text>
            </div>

            <div className="ob-thread" data-resetting={state.resetting}>
              <Collapse open={state.sent} reveal="drop" from="below">
                <div className="ob-turn">
                  <div className="ob-user-row">
                    <div className="ob-user-bubble">
                      <Text>{Q}</Text>
                    </div>
                  </div>

                  {/* Assistant response with refined visual hierarchy */}
                  <div className="ob-assistant">
                    <div className="ob-telemetry" data-state={state.status}>
                      <div
                        className="ob-telemetry-layer"
                        data-active={state.status === "routing"}
                      >
                        <Search
                          size={13}
                          strokeWidth={1.8}
                          className="ob-telemetry-icon"
                        />
                        <span className="ob-shimmer-text">
                          Searching 768d pgvector index…
                        </span>
                      </div>

                      <div
                        className="ob-telemetry-layer"
                        data-active={state.status === "retrieved"}
                      >
                        <span className="ob-check-badge" aria-hidden="true">
                          <Check size={10} strokeWidth={2.7} />
                        </span>
                        <Text className="ob-telemetry-label">
                          Retrieved 2 grounded chunks
                        </Text>
                        <span className="ob-telemetry-meta">
                          18ms · 0.942 cos
                        </span>
                      </div>
                    </div>

                    <Collapse open={state.phase === "answer"}>
                      <div className="ob-answer-block">
                        <p className="ob-answer-text">
                          <Stream text={A} count={state.words} />
                          <span
                            className="ob-caret"
                            data-visible={isStreaming}
                            aria-hidden="true"
                          />
                        </p>

                        <div
                          className="ob-citations"
                          data-visible={state.sources}
                        >
                          {CITATIONS.map((cite, idx) => {
                            const isOpen = state.inspected === cite.id;
                            const isHovered = state.hoveredCite === cite.id;
                            const isPressed =
                              state.pressing === `cite-${cite.id}`;

                            return (
                              <div
                                key={cite.id}
                                className="ob-cite-anchor"
                                style={
                                  {
                                    "--ob-stagger": `${idx * 48}ms`,
                                  } as CSSProperties
                                }
                              >
                                <div
                                  data-target={`cite-${cite.id}`}
                                  className="ob-cite"
                                  data-visible={state.sources}
                                  data-hovered={isHovered}
                                  data-pressed={isPressed}
                                  data-active={isOpen}
                                >
                                  <span className="ob-cite-num">{cite.id}</span>
                                  <span className="ob-cite-file">
                                    {cite.file}
                                  </span>
                                  <span className="ob-cite-page">
                                    {cite.page}
                                  </span>
                                </div>

                                {/* Origin-aware translucent evidence card: opens below on wide, above on compact */}
                                <div
                                  className="ob-popover"
                                  role="dialog"
                                  aria-label={`Source ${cite.id}: ${cite.file}`}
                                  data-open={isOpen}
                                  data-align={idx === 0 ? "left" : "right"}
                                  data-placement={isCompact ? "top" : "bottom"}
                                >
                                  <div className="ob-popover-head">
                                    <span className="ob-popover-index">
                                      {cite.id}
                                    </span>
                                    <span className="ob-popover-file">
                                      {cite.file}
                                    </span>
                                    <span className="ob-popover-page">
                                      {cite.page}
                                    </span>
                                    <span className="ob-popover-score">
                                      {cite.score}
                                    </span>
                                  </div>
                                  <blockquote className="ob-popover-snippet">
                                    {cite.snippet}
                                  </blockquote>
                                  <div className="ob-popover-foot">
                                    <ShieldCheck
                                      size={11}
                                      strokeWidth={2}
                                      className="ob-popover-shield"
                                    />
                                    <span>{cite.provenance}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Collapse>
                  </div>
                </div>
              </Collapse>
            </div>
          </div>

          <div className="ob-composer-wrap">
            <div
              data-target="composer"
              className="ob-composer"
              data-focused={state.focused}
            >
              <Field
                className="ob-field"
                value={state.draft}
                focused={state.focused}
                placeholder="Ask about ingestion, leases, or embeddings…"
              />
              <div
                data-target="send"
                aria-hidden="true"
                className="ob-send-btn"
                data-ready={hasDraft}
                data-pressed={state.pressing === "send"}
              >
                <ArrowUp size={14} strokeWidth={2.4} />
              </div>
            </div>
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
    </Window>
  );
}

export function OutboxStage() {
  const theme = useThemeMode();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="ob-stage" data-theme={theme}>
      <Stage<SceneState>
        width={1060}
        height={520}
        compact={{ below: 640, width: 358, height: 420 }}
        theme={theme}
        greys="cool"
        initial={reducedMotion ? POSTER_STATE : INITIAL_STATE}
        poster={POSTER_STATE}
        script={script}
        cursor={{ at: REST, style: "real", ripple: true }}
        play="loop"
      >
        {(state, _rect, layout) => <Scene state={state} layout={layout} />}
      </Stage>
    </div>
  );
}
