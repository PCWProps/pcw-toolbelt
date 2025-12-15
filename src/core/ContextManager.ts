/**
 * ContextManager - Context-Aware Framework Detection & Rule Loading
 *
 * This class detects the framework context of a file by scanning for signatures,
 * loads the appropriate rules dynamically, and audits files against best practices.
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  FrameworkContext,
  ContextSignature,
  RuleSet,
  AuditResult,
  AuditIssue,
  Rule,
} from "./types";
import * as https from "https";

export class ContextManager {
  private static instance: ContextManager;
  private rulesCache: Map<string, RuleSet> = new Map();

  // Signature patterns for framework detection
  private readonly signatures: ContextSignature[] = [
    {
      context: "elementor",
      patterns: [
        "\\\\Elementor\\\\Widget_Base",
        "extends\\s+Widget_Base",
        "namespace\\s+Elementor",
        "use\\s+Elementor\\\\Widget_Base",
      ],
    },
    {
      context: "wordpress",
      patterns: [
        "add_action\\s*\\(",
        "add_filter\\s*\\(",
        "wp_enqueue_",
        "register_post_type\\s*\\(",
        "get_template_part\\s*\\(",
      ],
    },
    {
      context: "react",
      patterns: [
        "useEffect\\s*\\(",
        "useState\\s*\\(",
        "className\\s*=",
        "import\\s+React",
        "from\\s+['\"]react['\"]",
      ],
    },
    {
      context: "woocommerce",
      patterns: [
        "WC_Order",
        "WC_Product",
        "woocommerce_",
        "WC\\(\\)",
        "class\\s+WC_",
      ],
    },
  ];

  private getCacheKey(context: FrameworkContext): string {
    const workspaceRoot = this.getWorkspaceRoot();
    return `${workspaceRoot ?? "global"}::${context}`;
  }

  private getWorkspaceRoot(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].uri.fsPath
      : null;
  }

  private constructor() {}

  /**
   * Singleton instance getter
   */
  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  /**
   * Detect framework context from file content
   * @param content File content to analyze
   * @returns Detected framework context
   */
  public detectContext(content: string): FrameworkContext {
    for (const signature of this.signatures) {
      for (const pattern of signature.patterns) {
        const regex = new RegExp(pattern, "i");
        if (regex.test(content)) {
          return signature.context;
        }
      }
    }
    return "unknown";
  }

  /**
   * Detect context from multiple possible signatures (returns first match)
   * @param content File content to analyze
   * @returns Array of all detected contexts (for multi-framework files)
   */
  public detectAllContexts(content: string): FrameworkContext[] {
    const contexts: Set<FrameworkContext> = new Set();

    for (const signature of this.signatures) {
      for (const pattern of signature.patterns) {
        const regex = new RegExp(pattern, "i");
        if (regex.test(content)) {
          contexts.add(signature.context);
          break; // Found match for this context, move to next
        }
      }
    }

    return Array.from(contexts);
  }

  /**
   * Load rules for a specific context from JSON file
   * @param context Framework context
   * @returns RuleSet for the context
   */
  public async loadRules(context: FrameworkContext): Promise<RuleSet | null> {
    if (context === "unknown") {
      return null;
    }

    const cacheKey = this.getCacheKey(context);

    // Check cache first
    if (this.rulesCache.has(cacheKey)) {
      return this.rulesCache.get(cacheKey)!;
    }

    try {
      const baseRuleSet = await this.loadBaseRuleSet(context);
      const workspaceRuleSets = await this.loadWorkspaceRuleSets(context);
      const config = await this.loadWorkspaceConfig();
      const remoteRuleSets = await this.loadRemoteRuleSets(
        context,
        config?.repositories
      );

      const mergedRules = this.mergeRuleSets([
        ...(baseRuleSet ? [baseRuleSet] : []),
        ...workspaceRuleSets,
        ...remoteRuleSets,
      ]);

      const rulesWithOverrides = this.applySeverityOverrides(
        mergedRules,
        context,
        config ?? undefined
      );

      const mergedRuleSet: RuleSet = {
        context,
        description:
          baseRuleSet?.description ||
          `${context} rules (including workspace and community overlays)`,
        rules: rulesWithOverrides,
        source: baseRuleSet?.source ?? "merged",
      };

      this.rulesCache.set(cacheKey, mergedRuleSet);

      return mergedRuleSet;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error loading rules for ${context}: ${error}`
      );
      return null;
    }
  }

  private async loadBaseRuleSet(
    context: FrameworkContext
  ): Promise<RuleSet | null> {
    const extensionPath = vscode.extensions.getExtension(
      "pcwprops.pcw-toolbelt"
    )?.extensionPath;
    if (!extensionPath) {
      throw new Error("Extension path not found");
    }

    const rulesPath = path.join(
      extensionPath,
      "src",
      "rules",
      `${context}-rules.json`
    );

    if (!fs.existsSync(rulesPath)) {
      vscode.window.showWarningMessage(
        `Rules file not found: ${context}-rules.json`
      );
      return null;
    }

    const rulesContent = fs.readFileSync(rulesPath, "utf-8");
    const ruleSet: RuleSet = JSON.parse(rulesContent);
    ruleSet.source = "extension";
    return ruleSet;
  }

  private async loadWorkspaceRuleSets(
    context: FrameworkContext
  ): Promise<RuleSet[]> {
    const workspaceRoot = this.getWorkspaceRoot();
    if (!workspaceRoot) {
      return [];
    }

    const rulesDir = path.join(workspaceRoot, ".pcw-rules");
    const filePath = path.join(rulesDir, `${context}-rules.json`);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const rulesContent = fs.readFileSync(filePath, "utf-8");
      const ruleSet: RuleSet = JSON.parse(rulesContent);
      ruleSet.source = filePath;
      return [ruleSet];
    } catch (error) {
      vscode.window.showWarningMessage(
        `Unable to parse workspace rules at ${filePath}: ${error}`
      );
      return [];
    }
  }

  private async loadWorkspaceConfig(): Promise<{
    severityOverrides?: Record<string, Record<string, Rule["severity"]>>;
    repositories?: string[];
  } | null> {
    const workspaceRoot = this.getWorkspaceRoot();
    if (!workspaceRoot) {
      return null;
    }

    const configPath = path.join(workspaceRoot, ".pcw-rules", "config.json");
    if (!fs.existsSync(configPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      vscode.window.showWarningMessage(
        `Unable to parse .pcw-rules/config.json: ${error}`
      );
      return null;
    }
  }

  private async loadRemoteRuleSets(
    context: FrameworkContext,
    repositories?: string[]
  ): Promise<RuleSet[]> {
    if (!repositories || repositories.length === 0) {
      return [];
    }

    const results: RuleSet[] = [];
    for (const repoUrl of repositories) {
      try {
        const ruleSet = await this.fetchRemoteRuleSet(repoUrl);
        if (ruleSet && (ruleSet.context === context || !ruleSet.context)) {
          ruleSet.context = context;
          ruleSet.source = repoUrl;
          results.push(ruleSet);
        }
      } catch (error) {
        console.warn(`Unable to fetch rules from ${repoUrl}:`, error);
      }
    }

    return results;
  }

  private mergeRuleSets(ruleSets: RuleSet[]): Rule[] {
    const merged: Map<string, Rule> = new Map();

    for (const set of ruleSets) {
      for (const rule of set.rules) {
        const key = rule.id || rule.pattern;
        merged.set(key, { ...rule });
      }
    }

    return Array.from(merged.values());
  }

  private applySeverityOverrides(
    rules: Rule[],
    context: FrameworkContext,
    config?: {
      severityOverrides?: Record<string, Record<string, Rule["severity"]>>;
    }
  ): Rule[] {
    if (!config?.severityOverrides || !config.severityOverrides[context]) {
      return rules;
    }

    const overrides = config.severityOverrides[context];
    return rules.map((rule) => {
      const key = rule.id || rule.pattern;
      const override = overrides[key];
      if (!override) {
        return rule;
      }

      if (["error", "warning", "info"].includes(override)) {
        return { ...rule, severity: override as Rule["severity"] };
      }

      return rule;
    });
  }

  private async fetchRemoteRuleSet(url: string): Promise<RuleSet | null> {
    return new Promise((resolve) => {
      https
        .get(url, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            resolve(null);
            return;
          }

          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString("utf-8");
              const parsed: RuleSet = JSON.parse(body);
              resolve(parsed);
            } catch (error) {
              console.warn(`Failed to parse rules from ${url}:`, error);
              resolve(null);
            }
          });
        })
        .on("error", () => resolve(null));
    });
  }

  /**
   * Audit a file against its detected context rules
   * @param filePath Path to the file to audit
   * @param content File content
   * @returns Audit result with issues found
   */
  public async auditFile(
    filePath: string,
    content: string
  ): Promise<AuditResult> {
    const context = this.detectContext(content);
    const issues: AuditIssue[] = [];

    if (context === "unknown") {
      return {
        context: "unknown",
        file: filePath,
        issues: [],
        timestamp: new Date(),
      };
    }

    const ruleSet = await this.loadRules(context);
    if (!ruleSet) {
      return {
        context,
        file: filePath,
        issues: [],
        timestamp: new Date(),
      };
    }

    for (const rule of ruleSet.rules) {
      const regex = new RegExp(rule.pattern, "gm");

      if (rule.mustExist) {
        const found = regex.test(content);
        regex.lastIndex = 0; // reset for subsequent iterations
        if (!found) {
          issues.push({
            line: 1,
            column: 1,
            rule,
            matched: "(missing)",
            suggestion: rule.suggestion,
            fix: rule.fix,
          });
        }
        continue;
      }

      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const position = this.getPositionFromIndex(content, match.index);
        issues.push({
          line: position.line,
          column: position.column,
          rule,
          matched: match[0],
          suggestion: rule.suggestion,
          fix: rule.fix,
        });

        // Prevent infinite loops for zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    }

    return {
      context,
      file: filePath,
      issues,
      timestamp: new Date(),
    };
  }

  /**
   * Audit multiple files and aggregate results
   * @param files Array of file paths and contents
   * @returns Array of audit results
   */
  public async auditFiles(
    files: Array<{ path: string; content: string }>
  ): Promise<AuditResult[]> {
    const results: AuditResult[] = [];

    for (const file of files) {
      const result = await this.auditFile(file.path, file.content);
      results.push(result);
    }

    return results;
  }

  /**
   * Clear the rules cache (useful for reloading rules after changes)
   */
  public clearCache(): void {
    this.rulesCache.clear();
  }

  private getPositionFromIndex(
    content: string,
    index: number
  ): {
    line: number;
    column: number;
  } {
    const preceding = content.slice(0, index);
    const lines = preceding.split("\n");
    const line = lines.length;
    const column = (lines[lines.length - 1] || "").length + 1;
    return { line, column };
  }

  /**
   * Get available contexts
   */
  public getAvailableContexts(): FrameworkContext[] {
    return this.signatures.map((sig) => sig.context);
  }

  /**
   * Format audit results as human-readable output
   * @param result Audit result to format
   * @returns Formatted string output
   */
  public formatAuditResult(result: AuditResult): string {
    if (result.issues.length === 0) {
      return `✅ No issues found in ${path.basename(result.file)} (${
        result.context
      })`;
    }

    let output = `📋 Audit Report: ${path.basename(result.file)}\n`;
    output += `🎯 Context: ${result.context}\n`;
    output += `⚠️  Issues Found: ${result.issues.length}\n`;
    output += `📅 Timestamp: ${result.timestamp.toISOString()}\n\n`;

    // Group issues by severity
    const errors = result.issues.filter((i) => i.rule.severity === "error");
    const warnings = result.issues.filter((i) => i.rule.severity === "warning");
    const infos = result.issues.filter((i) => i.rule.severity === "info");

    if (errors.length > 0) {
      output += `❌ ERRORS (${errors.length}):\n`;
      errors.forEach((issue) => {
        output += `  Line ${issue.line}:${issue.column} - ${issue.rule.message}\n`;
        output += `    Matched: "${issue.matched}"\n`;
        if (issue.suggestion) {
          output += `    Suggestion: ${issue.suggestion}\n`;
        }
      });
      output += "\n";
    }

    if (warnings.length > 0) {
      output += `⚠️  WARNINGS (${warnings.length}):\n`;
      warnings.forEach((issue) => {
        output += `  Line ${issue.line}:${issue.column} - ${issue.rule.message}\n`;
        output += `    Matched: "${issue.matched}"\n`;
        if (issue.suggestion) {
          output += `    Suggestion: ${issue.suggestion}\n`;
        }
      });
      output += "\n";
    }

    if (infos.length > 0) {
      output += `ℹ️  INFO (${infos.length}):\n`;
      infos.forEach((issue) => {
        output += `  Line ${issue.line}:${issue.column} - ${issue.rule.message}\n`;
        output += `    Matched: "${issue.matched}"\n`;
        if (issue.suggestion) {
          output += `    Suggestion: ${issue.suggestion}\n`;
        }
      });
    }

    return output;
  }
}
