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

export class ContextManager {
  private static instance: ContextManager;
  private rulesCache: Map<FrameworkContext, RuleSet> = new Map();

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

    // Check cache first
    if (this.rulesCache.has(context)) {
      return this.rulesCache.get(context)!;
    }

    try {
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

      // Cache the rules
      this.rulesCache.set(context, ruleSet);

      return ruleSet;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error loading rules for ${context}: ${error}`
      );
      return null;
    }
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

    // Split content into lines for line number tracking
    const lines = content.split("\n");

    // Run each rule against the content
    for (const rule of ruleSet.rules) {
      const regex = new RegExp(rule.pattern, "gm");

      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          issues.push({
            line: lineIndex + 1,
            column: match.index + 1,
            rule: rule,
            matched: match[0],
          });
        }
      });
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
      });
      output += "\n";
    }

    if (warnings.length > 0) {
      output += `⚠️  WARNINGS (${warnings.length}):\n`;
      warnings.forEach((issue) => {
        output += `  Line ${issue.line}:${issue.column} - ${issue.rule.message}\n`;
        output += `    Matched: "${issue.matched}"\n`;
      });
      output += "\n";
    }

    if (infos.length > 0) {
      output += `ℹ️  INFO (${infos.length}):\n`;
      infos.forEach((issue) => {
        output += `  Line ${issue.line}:${issue.column} - ${issue.rule.message}\n`;
        output += `    Matched: "${issue.matched}"\n`;
      });
    }

    return output;
  }
}
