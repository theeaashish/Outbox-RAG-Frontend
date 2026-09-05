export interface Project {
  id: string;
  name: string;
  description: string | null;
  knowledge_base_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

export interface ProjectListResponse {
  results: Project[];
}
