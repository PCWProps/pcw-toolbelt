/**
 * GuardrailsManager - Define and enforce coding standards
 * Creates project-specific rules for AI code generation
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface GuardrailRule {
  id: string;
  category: "style" | "security" | "performance" | "architecture" | "naming";
  rule: string;
  severity: "error" | "warning" | "info";
  examples?: {
    good?: string[];
    bad?: string[];
  };
}

export interface GuardrailsConfig {
  projectName: string;
  framework: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
  rules: GuardrailRule[];
  customPatterns?: {
    fileNaming?: string[];
    functionNaming?: string[];
    classNaming?: string[];
  };
}

export class GuardrailsManager {
  private static instance: GuardrailsManager;
  private readonly configFileName = ".pcw-guardrails.json";

  private constructor() {}

  public static getInstance(): GuardrailsManager {
    if (!GuardrailsManager.instance) {
      GuardrailsManager.instance = new GuardrailsManager();
    }
    return GuardrailsManager.instance;
  }

  /**
   * Get the guardrails config file path for the workspace
   */
  private getConfigPath(workspacePath: string): string {
    return path.join(workspacePath, this.configFileName);
  }

  /**
   * Check if guardrails config exists
   */
  public configExists(workspacePath: string): boolean {
    return fs.existsSync(this.getConfigPath(workspacePath));
  }

  /**
   * Load existing guardrails config
   */
  public async loadConfig(
    workspacePath: string
  ): Promise<GuardrailsConfig | null> {
    const configPath = this.getConfigPath(workspacePath);

    if (!fs.existsSync(configPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error loading guardrails config: ${error}`
      );
      return null;
    }
  }

  /**
   * Create new guardrails config with interactive prompts
   */
  public async createConfig(
    workspacePath: string
  ): Promise<GuardrailsConfig | null> {
    try {
      // Detect project info
      const projectName = path.basename(workspacePath);
      const frameworks = await this.detectFrameworks(workspacePath);

      // Ask for framework confirmation
      const frameworkItems = [
        "WordPress",
        "React",
        "Vue",
        "Angular",
        "Node.js",
        "TypeScript",
        "PHP",
        "Python",
      ];

      const selectedFrameworks = await vscode.window.showQuickPick(
        frameworkItems,
        {
          canPickMany: true,
          placeHolder: `Select frameworks used in ${projectName}`,
          ignoreFocusOut: true,
        }
      );

      if (!selectedFrameworks) {
        return null;
      }

      // Ask for coding style preferences
      const indentStyle = await vscode.window.showQuickPick(
        ["Spaces (2)", "Spaces (4)", "Tabs"],
        {
          placeHolder: "Select indentation style",
          ignoreFocusOut: true,
        }
      );

      const namingConvention = await vscode.window.showQuickPick(
        ["camelCase", "snake_case", "PascalCase", "kebab-case"],
        {
          placeHolder: "Select function naming convention",
          ignoreFocusOut: true,
        }
      );

      // Generate default rules based on selections
      const config: GuardrailsConfig = {
        projectName,
        framework: selectedFrameworks,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rules: this.generateDefaultRules(
          selectedFrameworks,
          indentStyle,
          namingConvention
        ),
        customPatterns: {
          fileNaming: [],
          functionNaming: [],
          classNaming: [],
        },
      };

      // Save config
      const configPath = this.getConfigPath(workspacePath);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return config;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error creating guardrails config: ${error}`
      );
      return null;
    }
  }

  /**
   * Detect frameworks used in the project
   */
  private async detectFrameworks(workspacePath: string): Promise<string[]> {
    const frameworks: string[] = [];

    // Check for common framework files
    const checks = [
      { file: "wp-config.php", framework: "WordPress" },
      { file: "package.json", framework: "Node.js" },
      { file: "composer.json", framework: "PHP" },
      { file: "tsconfig.json", framework: "TypeScript" },
      { file: "angular.json", framework: "Angular" },
      { file: "vue.config.js", framework: "Vue" },
    ];

    for (const check of checks) {
      if (fs.existsSync(path.join(workspacePath, check.file))) {
        frameworks.push(check.framework);
      }
    }

    // Check package.json for React
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (
        packageJson.dependencies?.react ||
        packageJson.devDependencies?.react
      ) {
        frameworks.push("React");
      }
    }

    return frameworks;
  }

  /**
   * Generate default rules based on framework selection
   */
  private generateDefaultRules(
    frameworks: string[],
    indentStyle?: string,
    namingConvention?: string
  ): GuardrailRule[] {
    const rules: GuardrailRule[] = [];

    // Universal style rules
    if (indentStyle) {
      rules.push({
        id: "indent-style",
        category: "style",
        rule: `Use ${indentStyle.toLowerCase()} for indentation`,
        severity: "warning",
      });
    }

    if (namingConvention) {
      rules.push({
        id: "function-naming",
        category: "naming",
        rule: `Functions must use ${namingConvention} naming convention`,
        severity: "warning",
        examples: {
          good: [this.getExampleName(namingConvention, "good")],
          bad: [this.getExampleName(namingConvention, "bad")],
        },
      });
    }

    // Framework-specific rules
    if (frameworks.includes("WordPress")) {
      rules.push(
        {
          id: "wp-sanitize-input",
          category: "security",
          rule: "Always sanitize user input using WordPress sanitization functions",
          severity: "error",
          examples: {
            good: ["$value = sanitize_text_field($_POST['field']);"],
            bad: ["$value = $_POST['field'];"],
          },
        },
        {
          id: "wp-escape-output",
          category: "security",
          rule: "Always escape output using esc_html(), esc_attr(), or esc_url()",
          severity: "error",
          examples: {
            good: ["echo esc_html($user_input);"],
            bad: ["echo $user_input;"],
          },
        },
        {
          id: "wp-nonce-verification",
          category: "security",
          rule: "Verify nonces for all form submissions",
          severity: "error",
        },
        {
          id: "wp-prepare-queries",
          category: "security",
          rule: "Use $wpdb->prepare() for all database queries",
          severity: "error",
        }
      );
    }

    if (frameworks.includes("React")) {
      rules.push(
        {
          id: "react-hooks-deps",
          category: "architecture",
          rule: "Include all dependencies in useEffect, useMemo, and useCallback arrays",
          severity: "error",
        },
        {
          id: "react-key-prop",
          category: "architecture",
          rule: "Always provide unique key prop when rendering lists",
          severity: "error",
        },
        {
          id: "react-functional-components",
          category: "style",
          rule: "Prefer functional components with hooks over class components",
          severity: "info",
        }
      );
    }

    if (frameworks.includes("TypeScript")) {
      rules.push(
        {
          id: "ts-explicit-types",
          category: "style",
          rule: "Define explicit types for function parameters and return values",
          severity: "warning",
        },
        {
          id: "ts-no-any",
          category: "style",
          rule: 'Avoid using "any" type; use specific types or unknown',
          severity: "warning",
        }
      );
    }

    // Universal security rules
    rules.push(
      {
        id: "no-hardcoded-secrets",
        category: "security",
        rule: "Never hardcode API keys, passwords, or tokens in source code",
        severity: "error",
        examples: {
          bad: ['const API_KEY = "sk_live_1234567890";'],
          good: ["const API_KEY = process.env.API_KEY;"],
        },
      },
      {
        id: "validate-env-vars",
        category: "security",
        rule: "Validate all environment variables at startup",
        severity: "warning",
      }
    );

    // Universal performance rules
    rules.push(
      {
        id: "avoid-nested-loops",
        category: "performance",
        rule: "Avoid deeply nested loops; consider using maps or reduce",
        severity: "info",
      },
      {
        id: "cache-expensive-operations",
        category: "performance",
        rule: "Cache results of expensive operations",
        severity: "info",
      }
    );

    return rules;
  }

  /**
   * Get example function name based on convention
   */
  private getExampleName(convention: string, type: "good" | "bad"): string {
    const examples: Record<string, { good: string; bad: string }> = {
      camelCase: {
        good: "function getUserData() {}",
        bad: "function get_user_data() {}",
      },
      snake_case: {
        good: "function get_user_data() {}",
        bad: "function getUserData() {}",
      },
      PascalCase: {
        good: "function GetUserData() {}",
        bad: "function getUserData() {}",
      },
      "kebab-case": {
        good: "const get-user-data = () => {}",
        bad: "const getUserData = () => {}",
      },
    };

    return examples[convention]?.[type] || "";
  }

  /**
   * Update guardrails config with new rules
   */
  public async updateConfig(
    workspacePath: string,
    updates: Partial<GuardrailsConfig>
  ): Promise<boolean> {
    try {
      const config = await this.loadConfig(workspacePath);

      if (!config) {
        vscode.window.showErrorMessage(
          "No guardrails config found. Create one first."
        );
        return false;
      }

      const updatedConfig: GuardrailsConfig = {
        ...config,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const configPath = this.getConfigPath(workspacePath);
      fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error updating guardrails config: ${error}`
      );
      return false;
    }
  }

  /**
   * Format config as readable text
   */
  public formatConfig(config: GuardrailsConfig): string {
    let output = "═══════════════════════════════════════════════════════\n";
    output += "       PCW TOOLBELT - PROJECT GUARDRAILS              \n";
    output += "═══════════════════════════════════════════════════════\n\n";

    output += `📋 Project: ${config.projectName}\n`;
    output += `🔧 Frameworks: ${config.framework.join(", ")}\n`;
    output += `📅 Created: ${new Date(
      config.createdAt
    ).toLocaleDateString()}\n`;
    output += `🔄 Updated: ${new Date(
      config.updatedAt
    ).toLocaleDateString()}\n\n`;

    // Group rules by category
    const categories = [
      "security",
      "architecture",
      "style",
      "performance",
      "naming",
    ];
    const categoryIcons: Record<string, string> = {
      security: "🔒",
      architecture: "🏗️",
      style: "✨",
      performance: "⚡",
      naming: "📝",
    };

    for (const category of categories) {
      const categoryRules = config.rules.filter((r) => r.category === category);

      if (categoryRules.length > 0) {
        output += `${
          categoryIcons[category]
        } ${category.toUpperCase()} RULES:\n\n`;

        categoryRules.forEach((rule, idx) => {
          const severityIcon =
            rule.severity === "error"
              ? "🔴"
              : rule.severity === "warning"
              ? "🟡"
              : "🔵";
          output += `${idx + 1}. ${severityIcon} ${rule.rule}\n`;

          if (rule.examples?.good) {
            output += `   ✅ Good: ${rule.examples.good.join(", ")}\n`;
          }
          if (rule.examples?.bad) {
            output += `   ❌ Bad: ${rule.examples.bad.join(", ")}\n`;
          }
          output += "\n";
        });
      }
    }

    return output;
  }

  /**
   * Scan codebase for common patterns and suggest rules
   */
  public async scanForPatterns(
    workspacePath: string
  ): Promise<GuardrailRule[]> {
    const suggestedRules: GuardrailRule[] = [];

    // This is a placeholder for pattern detection
    // In a full implementation, we would:
    // 1. Scan all files in the workspace
    // 2. Detect common patterns (naming conventions, indentation, etc.)
    // 3. Generate rules based on detected patterns

    return suggestedRules;
  }
}
