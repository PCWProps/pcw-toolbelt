import * as vscode from "vscode";
import {
  registerPackCommands,
  standardCoreCommandSpecs,
  powerPlaceholderSpec,
  superpowerPlaceholderSpec,
} from "../shared/commands";

/**
 * Ingram Micro PowerPack - Channel Operations Toolkit
 * Core: standard PCW core tools.
 * Power/SuperPower: placeholders for upcoming automation.
 */
export function activate(context: vscode.ExtensionContext) {
  const packId = "ingram-micro";
  const packLabel = "Ingram Micro";

  console.log("Ingram Micro PowerPack: Loading...");

  const coreSpecs = standardCoreCommandSpecs(packId, packLabel);

  registerPackCommands(context, coreSpecs);
  registerPackCommands(context, [
    powerPlaceholderSpec(packId, packLabel),
    superpowerPlaceholderSpec(packId, packLabel),
  ]);

  console.log("Ingram Micro PowerPack: Activated ✓");
}
