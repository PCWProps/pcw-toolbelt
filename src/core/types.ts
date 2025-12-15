/**
 * Types for Context-Aware Rule System
 */

export type FrameworkContext =
  | "elementor"
  | "wordpress"
  | "react"
  | "woocommerce"
  | "unknown";

export interface RuleFix {
  /** Human-friendly description of the suggested fix */
  description: string;
  /** Optional regex replacement to auto-apply the fix */
  replace?: {
    pattern: string;
    replacement: string;
    flags?: string;
  };
}

export interface Rule {
  /** Stable identifier for overrides and mapping */
  id?: string;
  /** Regex used to detect the issue (or required pattern when mustExist=true) */
  pattern: string;
  /** User-facing message to display */
  message: string;
  /** Severity shown in output, problems panel, etc. */
  severity: "error" | "warning" | "info";
  /** Optional category grouping */
  category?: string;
  /** If true, an issue is reported when the pattern is NOT found in the file */
  mustExist?: boolean;
  /** Optional suggestion text for remediation */
  suggestion?: string;
  /** Optional fix metadata for auto-fix suggestions */
  fix?: RuleFix;
}

export interface RuleSet {
  context: FrameworkContext;
  description: string;
  rules: Rule[];
  source?: string;
}

export interface ContextSignature {
  context: FrameworkContext;
  patterns: string[];
}

export interface AuditResult {
  context: FrameworkContext;
  file: string;
  issues: AuditIssue[];
  timestamp: Date;
}

export interface AuditIssue {
  line: number;
  column: number;
  rule: Rule;
  matched: string;
  suggestion?: string;
  fix?: RuleFix;
}
