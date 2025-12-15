import * as vscode from "vscode";
import * as path from "path";
import { generateContextMap } from "./contextMap";
import {
  auditFile,
  auditWorkspace,
  reloadRules,
  applyAutoFixes,
  getSidePanelProvider,
} from "../../core/auditor";
import { BlueprintManager } from "../../core/blueprints/BlueprintManager";
import { RedundancyAuditor } from "./redundancy";
import { GuardrailsManager } from "./guardrails";
import { SecretScanner } from "./secretScanner";
import { DependencyHealthChecker } from "./dependencyHealth";
import { StandardsManager } from "../../core/StandardsManager";

/**
 * All Systems Go PowerPack
 * Provides foundational tools for project sanity, context, and health
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("All Systems Go PowerPack: Loading...");

  // Generate Context Map command
  const generateContextMapCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.generateContextMap",
    generateContextMap
  );

  // Context-Aware Audit commands
  const auditFileCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.auditFile",
    auditFile
  );

  const auditWorkspaceCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.auditWorkspace",
    auditWorkspace
  );

  const reloadRulesCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.reloadRules",
    reloadRules
  );

  const applyAutoFixesCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.applyAutoFixes",
    applyAutoFixes
  );

  // Set Project Guardrails command
  const setGuardrailsCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.setGuardrails",
    async () => {
      const manager = GuardrailsManager.getInstance();
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      // Check if config already exists
      if (manager.configExists(workspacePath)) {
        const overwrite = await vscode.window.showWarningMessage(
          "Guardrails config already exists. Overwrite it?",
          "Yes",
          "No"
        );

        if (overwrite !== "Yes") {
          return;
        }
      }

      try {
        vscode.window.showInformationMessage("Creating project guardrails...");

        const config = await manager.createConfig(workspacePath);

        if (config) {
          const formattedConfig = manager.formatConfig(config);

          // Show in output channel
          const outputChannel =
            vscode.window.createOutputChannel("PCW Guardrails");
          outputChannel.clear();
          outputChannel.appendLine(formattedConfig);
          outputChannel.show();

          vscode.window.showInformationMessage(
            `✅ Guardrails created with ${config.rules.length} rules!`
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error creating guardrails: ${error}`);
      }
    }
  );

  // Update Guardrails command
  const updateGuardrailsCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.updateGuardrails",
    async () => {
      const manager = GuardrailsManager.getInstance();
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      try {
        const config = await manager.loadConfig(workspacePath);

        if (!config) {
          vscode.window.showErrorMessage(
            "No guardrails config found. Create one first with 'Set Project Guardrails'."
          );
          return;
        }

        // Show current config
        const formattedConfig = manager.formatConfig(config);
        const outputChannel =
          vscode.window.createOutputChannel("PCW Guardrails");
        outputChannel.clear();
        outputChannel.appendLine(formattedConfig);
        outputChannel.show();

        vscode.window.showInformationMessage(
          `📋 Showing ${config.rules.length} guardrail rules. Edit .pcw-guardrails.json to modify.`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error updating guardrails: ${error}`);
      }
    }
  );

  // Secret Scanner command
  const scanSecretsCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.scanSecrets",
    async () => {
      const scanner = SecretScanner.getInstance();
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      try {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Scanning for secrets...",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

            const result = await scanner.scanWorkspace(workspacePath);
            const formattedResult = scanner.formatResult(result);

            // Display in output channel
            const outputChannel =
              vscode.window.createOutputChannel("PCW Secret Scanner");
            outputChannel.clear();
            outputChannel.appendLine(formattedResult);
            outputChannel.show();

            // Show notification
            if (result.matches.length === 0) {
              vscode.window.showInformationMessage(
                `✅ No secrets detected! Scanned ${result.scannedFiles} files.`
              );
            } else {
              const highSeverity = result.matches.filter(
                (m) => m.pattern.severity === "high"
              ).length;

              vscode.window.showWarningMessage(
                `⚠️ Found ${result.matches.length} potential secrets (${highSeverity} high severity)!`
              );
            }

            progress.report({ increment: 100 });
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error scanning for secrets: ${error}`);
      }
    }
  );

  // Dependency Health Check command
  const checkDependenciesCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.checkDependencies",
    async () => {
      const checker = DependencyHealthChecker.getInstance();
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      try {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Checking dependency health...",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

            const report = await checker.checkHealth(workspacePath);
            const formattedReport = checker.formatReport(report);

            // Display in output channel
            const outputChannel = vscode.window.createOutputChannel(
              "PCW Dependency Health"
            );
            outputChannel.clear();
            outputChannel.appendLine(formattedReport);
            outputChannel.show();

            // Show notification
            if (report.issues.length === 0) {
              vscode.window.showInformationMessage(
                `✅ All ${report.totalDependencies} dependencies are healthy!`
              );
            } else {
              const vulnerable = report.issues.filter(
                (i) => i.type === "vulnerable"
              ).length;

              vscode.window.showWarningMessage(
                `⚠️ Found ${report.issues.length} dependency issues (${vulnerable} vulnerable)!`
              );
            }

            progress.report({ increment: 100 });
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error checking dependencies: ${error}`);
      }
    }
  );

  // Manual refresh of standards cache
  const updateKnowledgeCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.updateKnowledge",
    async () => {
      const mgr = StandardsManager.getInstance();
      const count = await mgr.updateSources();
      vscode.window.showInformationMessage(
        `Knowledge updated for ${count} standards source(s).`
      );
    }
  );

  // Scaffold Blueprint command
  const scaffoldBlueprintCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.scaffoldBlueprint",
    async () => {
      const blueprintManager = BlueprintManager.getInstance();
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          "No workspace folder open. Please open a folder first."
        );
        return;
      }

      const targetPath = workspaceFolders[0].uri.fsPath;

      try {
        // Get available blueprints
        const blueprints = await blueprintManager.getAvailableBlueprints();

        if (blueprints.length === 0) {
          vscode.window.showWarningMessage("No blueprints found.");
          return;
        }

        // Show blueprint picker
        const selectedName = await vscode.window.showQuickPick(
          blueprints.map((b) => b.name),
          {
            placeHolder: "Select a blueprint to scaffold",
          }
        );

        if (!selectedName) {
          return;
        }

        const selectedBlueprint = blueprints.find(
          (b) => b.name === selectedName
        );
        if (!selectedBlueprint) {
          return;
        }

        // Load full blueprint
        const blueprint = await blueprintManager.loadBlueprint(
          selectedBlueprint.id
        );

        if (!blueprint) {
          vscode.window.showErrorMessage("Failed to load blueprint.");
          return;
        }

        // Collect variables
        const variables: Record<string, string> = {};

        if (blueprint.variables) {
          for (const varDef of blueprint.variables) {
            const value = await vscode.window.showInputBox({
              prompt: varDef.description || `Enter value for ${varDef.name}`,
              value: varDef.default,
              placeHolder: varDef.default,
            });

            if (value === undefined) {
              return; // User cancelled
            }

            variables[varDef.name] = value || varDef.default || "";
          }
        }

        // Scaffold the blueprint
        vscode.window.showInformationMessage(
          `Scaffolding blueprint: ${blueprint.name}...`
        );

        const result = await blueprintManager.scaffoldBlueprint(
          blueprint,
          targetPath,
          variables
        );

        if (result.success) {
          vscode.window.showInformationMessage(
            `✅ Blueprint scaffolded successfully!\n` +
              `Created ${result.filesCreated} files in ${result.foldersCreated} folders.`
          );
        } else {
          vscode.window.showErrorMessage(
            `❌ Blueprint scaffolding failed: ${result.error}`
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error scaffolding blueprint: ${error}`);
      }
    }
  );

  // Audit Plugin Redundancy command
  const auditRedundancyCmd = vscode.commands.registerCommand(
    "pcw.allsystemsgo.auditRedundancy",
    async () => {
      const auditor = RedundancyAuditor.getInstance();
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          "No workspace folder open. Please open a WordPress project."
        );
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      try {
        vscode.window.showInformationMessage(
          "Scanning for plugin redundancy..."
        );

        // Scan plugins
        const plugins = await auditor.scanPlugins(workspacePath);

        if (plugins.length === 0) {
          vscode.window.showWarningMessage(
            "No plugins found. Make sure you're in a WordPress project."
          );
          return;
        }

        // Audit for redundancy
        const report = await auditor.auditPlugins(plugins);

        // Format report
        const formattedReport = auditor.formatReport(report);

        // Display in side panel if available
        const sidePanelProvider = getSidePanelProvider();
        if (sidePanelProvider) {
          sidePanelProvider.showResults("Plugin Redundancy Audit", {
            summary: `${report.warnings.length} redundancy warning(s) found`,
            issues: report.warnings.map((warning) => ({
              message: `${warning.category}: ${warning.plugins.length} plugins detected`,
              severity: warning.severity,
              line: 0,
              file: warning.plugins.map((p) => p.path).join(", "),
              context: warning.recommendation,
            })),
            timestamp: report.timestamp.toISOString(),
          });
        } else {
          // Fallback to output channel
          const outputChannel = vscode.window.createOutputChannel(
            "PCW Redundancy Audit"
          );
          outputChannel.clear();
          outputChannel.appendLine(formattedReport);
          outputChannel.show();
        }

        if (report.warnings.length === 0) {
          vscode.window.showInformationMessage(
            "✅ No plugin redundancy detected!"
          );
        } else {
          vscode.window.showWarningMessage(
            `⚠️ Found ${report.warnings.length} redundancy warning(s). Check the side panel for details.`
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error auditing redundancy: ${error}`);
      }
    }
  );

  context.subscriptions.push(
    generateContextMapCmd,
    auditFileCmd,
    auditWorkspaceCmd,
    reloadRulesCmd,
    applyAutoFixesCmd,
    setGuardrailsCmd,
    updateGuardrailsCmd,
    scanSecretsCmd,
    checkDependenciesCmd,
    scaffoldBlueprintCmd,
    auditRedundancyCmd,
    updateKnowledgeCmd
  );

  console.log("All Systems Go PowerPack: Activated ✓");
  console.log("  - 12 tools loaded");
}
