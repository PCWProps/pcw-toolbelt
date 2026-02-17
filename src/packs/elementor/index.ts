import * as vscode from "vscode";
import {
  CommandSpec,
  powerPlaceholderSpec,
  registerPackCommands,
  standardCoreCommandSpecs,
  superpowerPlaceholderSpec,
} from "../shared/commands";
import { auditWidget } from "./core/auditor";

/**
 * Elementor PowerPack - "The Builder"
 * Specialized tools to prevent "Files can't be used" errors
 */
export function activate(context: vscode.ExtensionContext) {
  const packId = "elementor";
  const packLabel = "Elementor";

  console.log("Elementor PowerPack: Loading...");

  const coreSpecs = standardCoreCommandSpecs(packId, packLabel);
  const elementorCore: CommandSpec[] = [
    {
      id: "pcw.elementor.auditWidget",
      title: "PPACK: Elementor [Core]: Widget Pre-Flight Audit",
      handler: auditWidget,
    },
    {
      id: "pcw.elementor.generateBoilerplate",
      title: "PPACK: Elementor [Core]: Generate Widget Boilerplate",
      handler: () =>
        vscode.window.showInformationMessage(
          "Widget Boilerplate Generator coming soon!"
        ),
    },
  ];

  registerPackCommands(context, [...coreSpecs, ...elementorCore]);
  registerPackCommands(context, [
    powerPlaceholderSpec(packId, packLabel),
    superpowerPlaceholderSpec(packId, packLabel),
  ]);

  console.log("Elementor PowerPack: Activated ✓");
}
