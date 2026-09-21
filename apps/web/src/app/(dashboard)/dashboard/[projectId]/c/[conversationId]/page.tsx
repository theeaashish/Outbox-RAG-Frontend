"use client";

import { useParams } from "next/navigation";
import { ConversationRouteGate } from "@/app/(dashboard)/_components/conversation-route-gate";

export default function ConversationPage() {
  const params = useParams<{ projectId: string; conversationId: string }>();
  const projectId = params.projectId;
  const conversationId = params.conversationId;

  if (!projectId || !conversationId) {
    return null;
  }

  return (
    <ConversationRouteGate
      key={`${projectId}-${conversationId}`}
      projectId={projectId}
      conversationId={conversationId}
    />
  );
}
