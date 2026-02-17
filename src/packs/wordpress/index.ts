import * as vscode from "vscode";
import {
  CommandSpec,
  powerPlaceholderSpec,
  registerPackCommands,
  standardCoreCommandSpecs,
  superpowerPlaceholderSpec,
} from "../shared/commands";
import { runWPCSCompliance, scaffoldChildTheme } from "./core/commands";

/**
 * WordPress PowerPack - "The Developer"
 * Focuses on Standards, PHP compliance, and Theme structure
 */
export function activate(context: vscode.ExtensionContext) {
  const packId = "wordpress";
  const packLabel = "WordPress";

  console.log("WordPress PowerPack: Loading...");

  const coreSpecs = standardCoreCommandSpecs(packId, packLabel);
  const wpSpecificCore: CommandSpec[] = [
    {
      id: "pcw.wordpress.scaffoldChildTheme",
      title: "PPACK: WordPress [Core]: Scaffold Child Theme",
      handler: scaffoldChildTheme,
    },
    {
      id: "pcw.wordpress.runWPCS",
      title: "PPACK: WordPress [Core]: Run WPCS Compliance Check",
      handler: runWPCSCompliance,
    },
  ];

  registerPackCommands(context, [...coreSpecs, ...wpSpecificCore]);
  registerPackCommands(context, [
    powerPlaceholderSpec(packId, packLabel),
    superpowerPlaceholderSpec(packId, packLabel),
  ]);

  console.log("WordPress PowerPack: Activated ✓");
}
