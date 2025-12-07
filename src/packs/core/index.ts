import * as vscode from "vscode";
import { generateContextMap } from "./contextMap";
import { auditFile, auditWorkspace, reloadRules } from "../../core/auditor";

/**
 * Core PowerPack - "All Systems Go"
 * Provides foundational tools for project sanity, context, and health
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Core PowerPack: Loading...");

  // Generate Context Map command
  const generateContextMapCmd = vscode.commands.registerCommand(
    "pcw.core.generateContextMap",
    generateContextMap
  );

  // Context-Aware Audit commands
  const auditFileCmd = vscode.commands.registerCommand(
    "pcw.core.auditFile",
    auditFile
  );

  const auditWorkspaceCmd = vscode.commands.registerCommand(
    "pcw.core.auditWorkspace",
    auditWorkspace
  );

  const reloadRulesCmd = vscode.commands.registerCommand(
    "pcw.core.reloadRules",
    reloadRules
  );

  // Set Project Guardrails command
  const setGuardrailsCmd = vscode.commands.registerCommand(
    "pcw.core.setGuardrails",
    () => {
      vscode.window.showInformationMessage(
        "Set Guardrails feature coming soon!"
      );
    }
  );

  // Update Guardrails command
  const updateGuardrailsCmd = vscode.commands.registerCommand(
    "pcw.core.updateGuardrails",
    () => {
      vscode.window.showInformationMessage(
        "Update Guardrails feature coming soon!"
      );
    }
  );

  // Secret Scanner command
  const scanSecretsCmd = vscode.commands.registerCommand(
    "pcw.core.scanSecrets",
    () => {
      vscode.window.showInformationMessage(
        "Secret Scanner feature coming soon!"
      );
    }
  );

  context.subscriptions.push(
    generateContextMapCmd,
    auditFileCmd,
    auditWorkspaceCmd,
    reloadRulesCmd,
    setGuardrailsCmd,
    updateGuardrailsCmd,
    scanSecretsCmd
  );

  console.log("Core PowerPack: Activated ✓");
}
