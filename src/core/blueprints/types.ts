/**
 * Blueprint Types
 */

export interface BlueprintFile {
  path: string;
  content?: string;
  template?: string;
}

export interface BlueprintFolder {
  path: string;
  description?: string;
}

export interface BlueprintVariable {
  name: string;
  description?: string;
  default?: string;
}

export interface BlueprintDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  folders: BlueprintFolder[];
  files: BlueprintFile[];
  dependencies?: string[];
  variables?: BlueprintVariable[];
}

export interface ScaffoldResult {
  success: boolean;
  created: string[];
  skipped: string[];
  filesCreated: number;
  foldersCreated: number;
  error?: string;
  errors: string[];
}
