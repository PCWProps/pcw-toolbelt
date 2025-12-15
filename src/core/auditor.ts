import * as vscode from "vscode";
import { ContextManager } from "../core/ContextManager";
import { IssueItem } from "./SidePanelProvider";
import { Rule } from "./types";

// Side panel provider will be set after extension activation
let _sidePanelProvider: any;
const diagnosticsCollection =
  vscode.languages.createDiagnosticCollection("pcw-toolbelt");

export function setSidePanelProvider(provider: any) {
  _sidePanelProvider = provider;
  return _sidePanelProvider;
}

export function getSidePanelProvider() {
  return _sidePanelProvider;
}

/**
 * Universal Context-Aware File Auditor
 * Automatically detects framework and applies appropriate rules
 */
export async function auditFile() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage(
      "No active editor found. Please open a file to audit."
    );
    return;
  }

  const document = editor.document;
  const filePath = document.fileName;
  const fileContent = document.getText();

  // Get the ContextManager singleton
  const contextManager = ContextManager.getInstance();

  // Run the audit with progress indication
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Running Context-Aware Audit...",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: "Detecting framework..." });

      // Detect context
      const context = contextManager.detectContext(fileContent);

      if (context === "unknown") {
        vscode.window.showWarningMessage(
          "Unable to detect framework context. This file may not contain WordPress, Elementor, React, or WooCommerce code."
        );
        return;
      }

      progress.report({ message: `Loading ${context} rules...` });

      // Perform audit
      const result = await contextManager.auditFile(filePath, fileContent);

      progress.report({ message: "Analyzing code..." });

      // Display results
      displayAuditResults(result, contextManager);
    }
  );
}

/**
 * Audit all files in the workspace
 */
export async function auditWorkspace() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder opened.");
    return;
  }

  const contextManager = ContextManager.getInstance();

  // Define file patterns to search
  const patterns = ["**/*.php", "**/*.tsx", "**/*.jsx", "**/*.ts", "**/*.js"];

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Auditing Workspace...",
      cancellable: true,
    },
    async (progress, token) => {
      const allResults = [];

      for (const pattern of patterns) {
        if (token.isCancellationRequested) {
          break;
        }

        progress.report({ message: `Scanning ${pattern} files...` });

        const files = await vscode.workspace.findFiles(
          pattern,
          "**/node_modules/**"
        );

        for (let i = 0; i < files.length; i++) {
          if (token.isCancellationRequested) {
            break;
          }

          const file = files[i];
          progress.report({
            message: `Auditing ${file.fsPath.split("/").pop()} (${i + 1}/${
              files.length
            })`,
            increment: (1 / files.length) * 100,
          });

          const document = await vscode.workspace.openTextDocument(file);
          const content = document.getText();

          const result = await contextManager.auditFile(file.fsPath, content);

          if (result.issues.length > 0) {
            allResults.push(result);
          }
        }
      }

      // Display aggregated results
      displayWorkspaceAuditResults(allResults, contextManager);
    }
  );
}

/**
 * Apply available auto-fix replacements for the active file based on rule metadata
 */
export async function applyAutoFixes() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage(
      "No active editor found. Open a file to fix."
    );
    return;
  }

  const document = editor.document;
  const content = document.getText();
  const contextManager = ContextManager.getInstance();
  const context = contextManager.detectContext(content);

  if (context === "unknown") {
    vscode.window.showWarningMessage(
      "Unable to detect framework context for auto-fixes."
    );
    return;
  }

  const ruleSet = await contextManager.loadRules(context);
  if (!ruleSet) {
    vscode.window.showWarningMessage("No rules available for this context.");
    return;
  }

  const fixableRules = ruleSet.rules.filter((rule) => rule.fix?.replace);
  if (fixableRules.length === 0) {
    vscode.window.showInformationMessage(
      "No auto-fix suggestions available for this file."
    );
    return;
  }

  let updatedContent = content;
  const applied: string[] = [];

  for (const rule of fixableRules) {
    const replacement = rule.fix?.replace;
    if (!replacement) continue;

    const regex = new RegExp(replacement.pattern, replacement.flags || "gm");
    if (!regex.test(updatedContent)) {
      continue;
    }

    updatedContent = updatedContent.replace(regex, replacement.replacement);
    applied.push(rule.id || rule.message);
  }

  if (updatedContent === content) {
    vscode.window.showInformationMessage("No matching issues to fix.");
    return;
  }

  await editor.edit((editBuilder) => {
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(content.length)
    );
    editBuilder.replace(fullRange, updatedContent);
  });

  vscode.window.showInformationMessage(
    `Applied ${applied.length} auto-fix(es) for ${context}.`
  );
}

/**
 * Display audit results in output channel and side panel
 */
function displayAuditResults(result: any, contextManager: ContextManager) {
  // Convert audit result to side panel format
  const issues: IssueItem[] = result.issues.map((issue: any) => ({
    line: issue.line,
    column: issue.column,
    severity: issue.rule.severity,
    message: issue.suggestion
      ? `${issue.rule.message} — Suggestion: ${issue.suggestion}`
      : issue.rule.message,
    matched: issue.matched,
    category: issue.rule.category,
    filePath: result.file,
  }));

  // Send to side panel if available
  if (_sidePanelProvider) {
    _sidePanelProvider.showResults(issues, result.context);
  }

  // Update VS Code Problems panel
  updateDiagnostics([result]);

  // Also show in output channel
  const outputChannel = vscode.window.createOutputChannel(
    "PCW ToolBelt - Audit"
  );
  outputChannel.clear();
  outputChannel.appendLine(contextManager.formatAuditResult(result));
  outputChannel.show();

  if (result.issues.length === 0) {
    vscode.window.showInformationMessage(
      `✅ No issues found in ${result.file.split("/").pop()} (${
        result.context
      })`
    );
  } else {
    const errors = result.issues.filter(
      (i: any) => i.rule.severity === "error"
    ).length;
    const warnings = result.issues.filter(
      (i: any) => i.rule.severity === "warning"
    ).length;
    const infos = result.issues.filter(
      (i: any) => i.rule.severity === "info"
    ).length;

    let message = `Found ${result.issues.length} issue(s): `;
    const parts = [];
    if (errors > 0) parts.push(`${errors} error(s)`);
    if (warnings > 0) parts.push(`${warnings} warning(s)`);
    if (infos > 0) parts.push(`${infos} info`);
    message += parts.join(", ");

    vscode.window.showWarningMessage(message);
  }
}

/**
 * Display workspace audit results
 */
function displayWorkspaceAuditResults(
  results: any[],
  contextManager: ContextManager
) {
  // Aggregate all issues for side panel
  const allIssues: IssueItem[] = [];
  results.forEach((result) => {
    result.issues.forEach((issue: any) => {
      allIssues.push({
        line: issue.line,
        column: issue.column,
        severity: issue.rule.severity,
        message: issue.suggestion
          ? `${issue.rule.message} — Suggestion: ${issue.suggestion}`
          : issue.rule.message,
        matched: issue.matched,
        category: issue.rule.category,
        filePath: result.file,
      });
    });
  });

  // Send to side panel if available
  if (_sidePanelProvider && allIssues.length > 0) {
    _sidePanelProvider.showResults(
      allIssues,
      "workspace",
      `${results.length} file(s) with issues`
    );
  }

  // Update VS Code Problems panel
  updateDiagnostics(results);

  const outputChannel = vscode.window.createOutputChannel(
    "PCW ToolBelt - Workspace Audit"
  );
  outputChannel.clear();

  outputChannel.appendLine(
    "═══════════════════════════════════════════════════════"
  );
  outputChannel.appendLine(
    "       PCW TOOLBELT - WORKSPACE AUDIT REPORT          "
  );
  outputChannel.appendLine(
    "═══════════════════════════════════════════════════════\n"
  );

  if (results.length === 0) {
    outputChannel.appendLine("✅ No issues found in workspace!\n");
    vscode.window.showInformationMessage(
      "✅ Workspace audit complete - no issues found!"
    );
  } else {
    outputChannel.appendLine(
      `📊 Summary: ${results.length} file(s) with issues\n`
    );

    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfos = 0;

    results.forEach((result, index) => {
      outputChannel.appendLine(`\n${"─".repeat(60)}\n`);
      outputChannel.appendLine(contextManager.formatAuditResult(result));

      totalErrors += result.issues.filter(
        (i: any) => i.rule.severity === "error"
      ).length;
      totalWarnings += result.issues.filter(
        (i: any) => i.rule.severity === "warning"
      ).length;
      totalInfos += result.issues.filter(
        (i: any) => i.rule.severity === "info"
      ).length;
    });

    outputChannel.appendLine(`\n${"═".repeat(60)}\n`);
    outputChannel.appendLine("📈 TOTALS:");
    outputChannel.appendLine(`   ❌ Errors: ${totalErrors}`);
    outputChannel.appendLine(`   ⚠️  Warnings: ${totalWarnings}`);
    outputChannel.appendLine(`   ℹ️  Info: ${totalInfos}`);
    outputChannel.appendLine(`   📁 Files: ${results.length}`);

    vscode.window.showWarningMessage(
      `Workspace audit complete: ${totalErrors} errors, ${totalWarnings} warnings in ${results.length} files. Check output panel.`
    );
  }

  outputChannel.show();
}

function toDiagnosticSeverity(
  severity: Rule["severity"]
): vscode.DiagnosticSeverity {
  switch (severity) {
    case "error":
      return vscode.DiagnosticSeverity.Error;
    case "warning":
      return vscode.DiagnosticSeverity.Warning;
    default:
      return vscode.DiagnosticSeverity.Information;
  }
}

function updateDiagnostics(results: any[]) {
  diagnosticsCollection.clear();

  const grouped = new Map<string, vscode.Diagnostic[]>();

  results.forEach((result) => {
    const diagnostics: vscode.Diagnostic[] = grouped.get(result.file) || [];

    result.issues.forEach((issue: any) => {
      const start = new vscode.Position(
        Math.max(issue.line - 1, 0),
        Math.max(issue.column - 1, 0)
      );
      const end = new vscode.Position(
        Math.max(issue.line - 1, 0),
        Math.max(issue.column - 1, 0) +
          Math.max((issue.matched || "").length, 1)
      );

      const message = issue.suggestion
        ? `${issue.rule.message}\nSuggestion: ${issue.suggestion}`
        : issue.rule.message;

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(start, end),
        message,
        toDiagnosticSeverity(issue.rule.severity)
      );

      diagnostic.source = "PCW ToolBelt";
      diagnostic.code = issue.rule.id || issue.rule.category;

      diagnostics.push(diagnostic);
    });

    grouped.set(result.file, diagnostics);
  });

  grouped.forEach((diagnostics, filePath) => {
    diagnosticsCollection.set(vscode.Uri.file(filePath), diagnostics);
  });
}

/**
 * Clear the rules cache (useful after editing rule files)
 */
export async function reloadRules() {
  const contextManager = ContextManager.getInstance();
  contextManager.clearCache();
  vscode.window.showInformationMessage(
    "✅ Rules cache cleared. Next audit will reload all rules."
  );
}
