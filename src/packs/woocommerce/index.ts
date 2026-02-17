import * as vscode from "vscode";
import {
  CommandSpec,
  powerPlaceholderSpec,
  registerPackCommands,
  standardCoreCommandSpecs,
  superpowerPlaceholderSpec,
} from "../shared/commands";
import { checkTemplateOverrides, generateCustomTab } from "./core/commands";

/**
 * WooCommerce PowerPack - "The Merchant"
 * Focuses on security, template overrides, and data integrity
 */
export function activate(context: vscode.ExtensionContext) {
  const packId = "woocommerce";
  const packLabel = "WooCommerce";

  console.log("WooCommerce PowerPack: Loading...");

  const coreSpecs = standardCoreCommandSpecs(packId, packLabel);
  const wooCore: CommandSpec[] = [
    {
      id: "pcw.woocommerce.checkTemplateOverrides",
      title: "PPACK: WooCommerce [Core]: Check Template Overrides",
      handler: checkTemplateOverrides,
    },
    {
      id: "pcw.woocommerce.generateCustomTab",
      title: "PPACK: WooCommerce [Core]: Generate Custom Tab",
      handler: generateCustomTab,
    },
  ];

  registerPackCommands(context, [...coreSpecs, ...wooCore]);
  registerPackCommands(context, [
    powerPlaceholderSpec(packId, packLabel),
    superpowerPlaceholderSpec(packId, packLabel),
  ]);

  console.log("WooCommerce PowerPack: Activated ✓");
}
