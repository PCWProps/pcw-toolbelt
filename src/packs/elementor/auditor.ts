import * as vscode from "vscode";
import { auditFile } from "../../core/auditor";

/**
 * Elementor Widget Pre-Flight Audit (modern)
 * Delegates to the universal context-aware auditor so rules stay centralized.
 */
export async function auditWidget() {
  vscode.window.showInformationMessage(
    "Running Elementor audit with the context-aware rule engine..."
  );
  await auditFile();
}
