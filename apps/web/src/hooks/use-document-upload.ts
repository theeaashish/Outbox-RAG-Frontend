"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StorageUploadError } from "@/lib/storage-upload";
import {
  uploadDocument,
  type UploadCheckpoint,
} from "@/features/documents/api";
import { useKnowledgeBaseDocuments } from "@/features/documents/hooks";
import { documentKeys } from "@/features/documents/keys";
import type { Document, UploadPhase } from "@/features/documents/types";
import { validateDocumentFile } from "@/utils/file";

export interface UseDocumentUploadOptions {
  onSuccess?: (document: Document) => void;
  onError?: (error: Error) => void;
}

interface UploadState {
  phase: UploadPhase;
  file: File | null;
  progress: number;
  error: string | null;
  retryable: boolean;
  document: Document | null;
}

type UploadAction =
  | { type: "select"; file: File; error: string | null }
  | { type: "reject"; message: string }
  | { type: "phase"; phase: UploadPhase }
  | { type: "progress"; percent: number }
  | { type: "fail"; message: string; retryable?: boolean }
  | { type: "document"; document: Document }
  | { type: "cancel" }
  | { type: "reset" };

const initialState: UploadState = {
  phase: "idle",
  file: null,
  progress: 0,
  error: null,
  retryable: false,
  document: null,
};

const UPLOADING_PHASES = new Set<UploadPhase>([
  "initiating",
  "uploading",
  "finalizing",
]);

function applyDocument(state: UploadState, document: Document): UploadState {
  switch (document.status) {
    case "ready":
      return { ...state, document, phase: "completed", progress: 100 };
    case "failed":
      return {
        ...state,
        document,
        phase: "error",
        error:
          document.last_error ?? "Document processing failed on the server.",
        retryable: false,
      };
    default:
      return { ...state, document, phase: "processing" };
  }
}

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "select":
      return {
        ...initialState,
        file: action.file,
        phase: action.error ? "error" : "selected",
        error: action.error,
      };
    case "reject":
      return {
        ...initialState,
        phase: "error",
        error: action.message,
        retryable: false,
      };
    case "phase":
      return {
        ...state,
        phase: action.phase,
        error: null,
        progress: action.phase === "initiating" ? 0 : state.progress,
      };
    case "progress":
      return state.progress === action.percent
        ? state
        : { ...state, progress: action.percent };
    case "fail":
      return {
        ...state,
        phase: "error",
        error: action.message,
        retryable: action.retryable ?? true,
      };
    case "document":
      return applyDocument(state, action.document);
    case "cancel":
      return { ...state, phase: "selected", progress: 0, error: null };
    case "reset":
      return initialState;
  }
}

export function useDocumentUpload(
  knowledgeBaseId: string,
  options: UseDocumentUploadOptions = {}
) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(uploadReducer, initialState);
  const { file, phase, retryable } = state;

  const checkpointRef = useRef<UploadCheckpoint>({});
  const abortRef = useRef<AbortController | null>(null);
  const notifiedDocIdRef = useRef<string | null>(null);
  const callbacksRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  // Abort active transfer and clear state if switched to another knowledge base
  const prevKbIdRef = useRef(knowledgeBaseId);
  useEffect(() => {
    if (prevKbIdRef.current !== knowledgeBaseId) {
      prevKbIdRef.current = knowledgeBaseId;
      abortRef.current?.abort();
      abortRef.current = null;
      checkpointRef.current = {};
      notifiedDocIdRef.current = null;
      dispatch({ type: "reset" });
    }
  }, [knowledgeBaseId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Follow server indexing status only while processing
  const trackedDocumentId = state.document?.id ?? null;
  const isTrackingProcessing =
    phase === "processing" && Boolean(trackedDocumentId);
  const { data } = useKnowledgeBaseDocuments(
    isTrackingProcessing ? knowledgeBaseId : undefined
  );

  useEffect(() => {
    if (phase !== "processing" || !trackedDocumentId) return;
    const match = data?.results.find((doc) => doc.id === trackedDocumentId);
    if (!match) return;

    const unchanged =
      match.status === state.document?.status &&
      match.last_error === state.document?.last_error;
    if (unchanged) return;

    dispatch({ type: "document", document: match });

    if (notifiedDocIdRef.current === match.id) return;
    if (match.status === "ready") {
      notifiedDocIdRef.current = match.id;
      callbacksRef.current.onSuccess?.(match);
    } else if (match.status === "failed") {
      notifiedDocIdRef.current = match.id;
      callbacksRef.current.onError?.(
        new Error(
          match.last_error ?? "Document processing failed on the server."
        )
      );
    }
  }, [
    data,
    phase,
    state.document?.last_error,
    state.document?.status,
    trackedDocumentId,
  ]);

  const upload = useCallback(async () => {
    if (!file || abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;
    notifiedDocIdRef.current = null;

    try {
      const document = await uploadDocument(knowledgeBaseId, file, {
        signal: controller.signal,
        checkpoint: checkpointRef.current,
        onPhase: (next) => dispatch({ type: "phase", phase: next }),
        onProgress: (percent) => dispatch({ type: "progress", percent }),
      });
      if (controller.signal.aborted) return;

      dispatch({ type: "document", document });
      void queryClient.invalidateQueries({
        queryKey: documentKeys.list(knowledgeBaseId),
      });

      if (document.status === "ready") {
        notifiedDocIdRef.current = document.id;
        callbacksRef.current.onSuccess?.(document);
      } else if (document.status === "failed") {
        notifiedDocIdRef.current = document.id;
        callbacksRef.current.onError?.(
          new Error(
            document.last_error ?? "Document processing failed on the server."
          )
        );
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof StorageUploadError && err.isAborted) return;

      const rawMessage = err instanceof Error ? err.message : "Upload failed.";
      const message = checkpointRef.current.storageDone
        ? `${rawMessage} Your file was uploaded; retry to finish.`
        : rawMessage;
      dispatch({ type: "fail", message });
      callbacksRef.current.onError?.(new Error(message));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [file, knowledgeBaseId, queryClient]);

  const selectFile = useCallback((next: File, overrideError?: string) => {
    if (abortRef.current) return;
    checkpointRef.current = {};
    notifiedDocIdRef.current = null;
    const validationError = overrideError ?? validateDocumentFile(next);
    dispatch({ type: "select", file: next, error: validationError });
    if (validationError) {
      callbacksRef.current.onError?.(new Error(validationError));
    }
  }, []);

  const rejectSelection = useCallback((message: string) => {
    if (abortRef.current) return;
    checkpointRef.current = {};
    notifiedDocIdRef.current = null;
    dispatch({ type: "reject", message });
    callbacksRef.current.onError?.(new Error(message));
  }, []);

  const cancel = useCallback(() => {
    const active = abortRef.current;
    abortRef.current = null;
    active?.abort();
    dispatch({ type: "cancel" });
  }, []);

  const reset = useCallback(() => {
    const active = abortRef.current;
    abortRef.current = null;
    active?.abort();
    checkpointRef.current = {};
    notifiedDocIdRef.current = null;
    dispatch({ type: "reset" });
  }, []);

  const isUploading = UPLOADING_PHASES.has(phase);
  const isValidationError = phase === "error" && !retryable && !state.document;

  return {
    ...state,
    isUploading,
    isValidationError,
    canUpload: phase === "selected",
    canRetry: phase === "error" && retryable,
    canCancel: phase === "initiating" || phase === "uploading",
    canReset: !isUploading,
    isProcessingFailed: state.document?.status === "failed",
    upload,
    selectFile,
    rejectSelection,
    cancel,
    reset,
  };
}
