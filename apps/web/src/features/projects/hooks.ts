"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "./api";
import { projectKeys } from "./keys";
import type { CreateProjectInput, UpdateProjectInput } from "./types";

export function useProjects(options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: projectKeys.list(options),
    queryFn: ({ signal }) => listProjects({ ...options, signal }),
    select: (response) => response.results,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: ({ signal }) => getProject(projectId, { signal }),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
      signal,
    }: {
      projectId: string;
      input: UpdateProjectInput;
      signal?: AbortSignal;
    }) => updateProject(projectId, input, { signal }),
    onSuccess: async (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      signal,
    }: {
      projectId: string;
      signal?: AbortSignal;
    }) => deleteProject(projectId, { signal }),
    onSuccess: async (_data, { projectId }) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
