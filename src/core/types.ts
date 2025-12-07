/**
 * Types for Context-Aware Rule System
 */

export type FrameworkContext =
  | "elementor"
  | "wordpress"
  | "react"
  | "woocommerce"
  | "unknown";

export interface Rule {
  pattern: string;
  message: string;
  severity: "error" | "warning" | "info";
  category?: string;
}

export interface RuleSet {
  context: FrameworkContext;
  description: string;
  rules: Rule[];
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
}
