import { apiClient } from "@/lib/api";
import type {
  CreateProjectInput,
  Project,
  ProjectListResponse,
  UpdateProjectInput,
} from "./types";

const PROJECTS_PATH = "/api/v1/projects";

export function listProjects(
  options: { signal?: AbortSignal; limit?: number; offset?: number } = {}
): Promise<ProjectListResponse> {
  return apiClient.get<ProjectListResponse>(PROJECTS_PATH, {
    signal: options.signal,
    params: { limit: options.limit, offset: options.offset },
  });
}

export function createProject(
  input: CreateProjectInput,
  options: { signal?: AbortSignal } = {}
): Promise<Project> {
  return apiClient.post<Project>(PROJECTS_PATH, input, {
    signal: options.signal,
  });
}

export function getProject(
  projectId: string,
  options: { signal?: AbortSignal } = {}
): Promise<Project> {
  return apiClient.get<Project>(`${PROJECTS_PATH}/${projectId}`, {
    signal: options.signal,
  });
}

export function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  options: { signal?: AbortSignal } = {}
): Promise<Project> {
  return apiClient.patch<Project>(`${PROJECTS_PATH}/${projectId}`, input, {
    signal: options.signal,
  });
}

export function deleteProject(
  projectId: string,
  options: { signal?: AbortSignal } = {}
): Promise<void> {
  return apiClient.delete<void>(`${PROJECTS_PATH}/${projectId}`, {
    signal: options.signal,
  });
}
