import type { ProjectItem } from "./sidebar/sidebar-data";

export const MOCK_PROJECT_NAME = "vibl coding project";
export const MOCK_PROJECT_ID = "vibl";
export const MOCK_SCENARIO_NAME = "coding scenario";

export const MOCK_PROJECTS: ProjectItem[] = [
  { id: "boardui", name: "boardui", knowledgeBaseId: "kb-boardui" },
  {
    id: MOCK_PROJECT_ID,
    name: MOCK_PROJECT_NAME,
    knowledgeBaseId: "kb-vibl",
    expanded: true,
    sessions: [
      { id: "landing", title: "landing page design", time: "34m" },
      { id: "image", title: "image generation", time: "now" },
      { id: "coding", title: MOCK_SCENARIO_NAME, time: "now" },
      { id: "mobile", title: "mobile app for vuejs...", time: "5h" },
      { id: "refactor", title: "code refactor dropd...", time: "10h" },
    ],
  },
  {
    id: "strider",
    name: "strider landing page work",
    knowledgeBaseId: "kb-strider",
  },
  {
    id: "pirate",
    name: "pirate mini game iOS",
    knowledgeBaseId: "kb-pirate",
  },
];

export const MOCK_ACTIVE_SESSION_ID = "coding";

export const MOCK_PROMPT =
  "update our color tokens for dark mode and add a reusable theme toggle to the registry. run lint and a production build when you're done.";
