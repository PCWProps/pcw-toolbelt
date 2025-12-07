/**
 * BlueprintManager - Load and execute project structure blueprints
 * Allows rapid scaffolding of complex project architectures
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { BlueprintDefinition, BlueprintFile, ScaffoldResult } from "./types";

export class BlueprintManager {
  private static instance: BlueprintManager;
  private blueprintsCache: Map<string, BlueprintDefinition> = new Map();

  private constructor() {}

  public static getInstance(): BlueprintManager {
    if (!BlueprintManager.instance) {
      BlueprintManager.instance = new BlueprintManager();
    }
    return BlueprintManager.instance;
  }

  /**
   * Get all available blueprints
   */
  public async getAvailableBlueprints(): Promise<BlueprintDefinition[]> {
    const blueprints: BlueprintDefinition[] = [];

    try {
      const extensionPath = vscode.extensions.getExtension(
        "pcwprops.pcw-toolbelt"
      )?.extensionPath;
      if (!extensionPath) {
        throw new Error("Extension path not found");
      }

      const blueprintsPath = path.join(
        extensionPath,
        "src",
        "blueprints",
        "definitions"
      );

      if (!fs.existsSync(blueprintsPath)) {
        vscode.window.showWarningMessage("Blueprints directory not found");
        return [];
      }

      const files = fs.readdirSync(blueprintsPath);

      for (const file of files) {
        if (file.endsWith(".json")) {
          const blueprint = await this.loadBlueprint(file.replace(".json", ""));
          if (blueprint) {
            blueprints.push(blueprint);
          }
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error loading blueprints: ${error}`);
    }

    return blueprints;
  }

  /**
   * Load a specific blueprint by name
   */
  public async loadBlueprint(
    name: string
  ): Promise<BlueprintDefinition | null> {
    // Check cache first
    if (this.blueprintsCache.has(name)) {
      return this.blueprintsCache.get(name)!;
    }

    try {
      const extensionPath = vscode.extensions.getExtension(
        "pcwprops.pcw-toolbelt"
      )?.extensionPath;
      if (!extensionPath) {
        throw new Error("Extension path not found");
      }

      const blueprintPath = path.join(
        extensionPath,
        "src",
        "blueprints",
        "definitions",
        `${name}.json`
      );

      if (!fs.existsSync(blueprintPath)) {
        vscode.window.showWarningMessage(`Blueprint not found: ${name}`);
        return null;
      }

      const content = fs.readFileSync(blueprintPath, "utf-8");
      const blueprint: BlueprintDefinition = JSON.parse(content);

      // Cache the blueprint
      this.blueprintsCache.set(name, blueprint);

      return blueprint;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error loading blueprint ${name}: ${error}`
      );
      return null;
    }
  }

  /**
   * Scaffold a blueprint in the target directory
   */
  public async scaffoldBlueprint(
    blueprint: BlueprintDefinition,
    targetPath: string,
    variables?: { [key: string]: string }
  ): Promise<ScaffoldResult> {
    const result: ScaffoldResult = {
      success: true,
      created: [],
      skipped: [],
      errors: [],
      filesCreated: 0,
      foldersCreated: 0,
    };

    // Merge default variables with provided ones
    const defaultVars: { [key: string]: string } = {};
    if (blueprint.variables) {
      for (const varDef of blueprint.variables) {
        defaultVars[varDef.name] = varDef.default || "";
      }
    }

    const allVariables: { [key: string]: string } = {
      ...defaultVars,
      ...variables,
      PROJECT_NAME: path.basename(targetPath),
      TIMESTAMP: new Date().toISOString(),
      AUTHOR: blueprint.author || "Unknown",
    };

    try {
      // Create folders first
      for (const folder of blueprint.folders) {
        const folderPath = this.resolvePath(
          targetPath,
          folder.path,
          allVariables
        );

        if (fs.existsSync(folderPath)) {
          result.skipped.push(folderPath);
          continue;
        }

        try {
          fs.mkdirSync(folderPath, { recursive: true });
          result.created.push(folderPath);
          result.foldersCreated++;
        } catch (error) {
          result.errors.push(`Failed to create folder ${folderPath}: ${error}`);
          result.success = false;
        }
      }

      // Create files
      for (const file of blueprint.files) {
        const filePath = this.resolvePath(targetPath, file.path, allVariables);

        if (fs.existsSync(filePath)) {
          result.skipped.push(filePath);
          continue;
        }

        try {
          const content = this.resolveFileContent(file, allVariables);
          const dir = path.dirname(filePath);

          // Ensure directory exists
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filePath, content);
          result.created.push(filePath);
          result.filesCreated++;
        } catch (error) {
          result.errors.push(`Failed to create file ${filePath}: ${error}`);
          result.success = false;
        }
      }
    } catch (error) {
      result.errors.push(`Scaffolding error: ${error}`);
      result.success = false;
    }

    return result;
  }

  /**
   * Resolve path with variables
   */
  private resolvePath(
    basePath: string,
    relativePath: string,
    variables: { [key: string]: string }
  ): string {
    let resolved = relativePath;

    // Replace variables in path
    for (const [key, value] of Object.entries(variables)) {
      resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }

    return path.join(basePath, resolved);
  }

  /**
   * Resolve file content from template or direct content
   */
  private resolveFileContent(
    file: BlueprintFile,
    variables: { [key: string]: string }
  ): string {
    let content = file.content || "";

    if (file.template) {
      // Load template file
      try {
        const extensionPath = vscode.extensions.getExtension(
          "pcwprops.pcw-toolbelt"
        )?.extensionPath;
        if (extensionPath) {
          const templatePath = path.join(
            extensionPath,
            "src",
            "blueprints",
            "templates",
            file.template
          );

          if (fs.existsSync(templatePath)) {
            content = fs.readFileSync(templatePath, "utf-8");
          }
        }
      } catch (error) {
        console.error(`Failed to load template ${file.template}:`, error);
      }
    }

    // Replace variables in content
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }

    return content;
  }

  /**
   * Clear blueprints cache
   */
  public clearCache(): void {
    this.blueprintsCache.clear();
  }

  /**
   * Validate a blueprint definition
   */
  public validateBlueprint(blueprint: BlueprintDefinition): string[] {
    const errors: string[] = [];

    if (!blueprint.name) {
      errors.push("Blueprint must have a name");
    }

    if (!blueprint.description) {
      errors.push("Blueprint must have a description");
    }

    if (!blueprint.version) {
      errors.push("Blueprint must have a version");
    }

    if (!blueprint.folders || blueprint.folders.length === 0) {
      errors.push("Blueprint must define at least one folder");
    }

    if (!blueprint.files || blueprint.files.length === 0) {
      errors.push("Blueprint must define at least one file");
    }

    // Check for duplicate paths
    const paths = new Set<string>();
    for (const folder of blueprint.folders || []) {
      if (paths.has(folder.path)) {
        errors.push(`Duplicate folder path: ${folder.path}`);
      }
      paths.add(folder.path);
    }

    for (const file of blueprint.files || []) {
      if (paths.has(file.path)) {
        errors.push(`Duplicate file path: ${file.path}`);
      }
      paths.add(file.path);
    }

    return errors;
  }
}
