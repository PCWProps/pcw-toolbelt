import * as vscode from "vscode";
import { activate as activateAllSystemsGo } from "./packs/all-systems-go";
import { activate as activateWordPress } from "./packs/wordpress";
import { activate as activateElementor } from "./packs/elementor";
import { activate as activateWooCommerce } from "./packs/woocommerce";
import { PCWSidePanelProvider } from "./core/SidePanelProvider";
import { setSidePanelProvider } from "./core/auditor";
import { StandardsManager, StandardSource } from "./core/StandardsManager";

// Global side panel instance for access across modules
export let sidePanelProvider: PCWSidePanelProvider;

/**
 * Main entry point for PCW ToolBelt
 * This function is called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("PCW ToolBelt is now active!");

  // Register the side panel
  sidePanelProvider = new PCWSidePanelProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PCWSidePanelProvider.viewType,
      sidePanelProvider
    )
  );

  // Make side panel available to other modules
  setSidePanelProvider(sidePanelProvider);

  // Load all PowerPacks
  activateAllSystemsGo(context);
  activateWordPress(context);
  activateElementor(context);
  activateWooCommerce(context);

  // Configure standards sources (seed top file types)
  const standards = StandardsManager.getInstance();
  const sources: StandardSource[] = [
    {
      id: "react-hooks",
      name: "React Hooks Best Practices",
      url: "https://raw.githubusercontent.com/reactjs/react.dev/main/src/content/reference/rules/rules-of-hooks.md",
      fileTypes: [".tsx", ".jsx", ".ts", ".js"],
    },
    {
      id: "typescript-handbook",
      name: "TypeScript Handbook",
      url: "https://raw.githubusercontent.com/microsoft/TypeScript-Website/main/packages/documentation/copy/en/handbook-v2/README.md",
      fileTypes: [".ts", ".tsx"],
    },
    {
      id: "wordpress-coding-standards",
      name: "WordPress Coding Standards",
      url: "https://developer.wordpress.org/coding-standards/wordpress-coding-standards/",
      fileTypes: [".php"],
    },
    {
      id: "php-manual",
      name: "PHP Manual",
      url: "https://www.php.net/manual/en/index.php",
      fileTypes: [".php"],
    },
    // Add more sources up to top 20 file types as needed
  ];
  standards.configureSources(sources);

  // On load, check for outdated cache and prompt to update
  const outdated = standards.findOutdated(7);
  if (outdated.length > 0) {
    vscode.window
      .showInformationMessage(
        `Standards cache is outdated for ${outdated.length} source(s). Update knowledge now?`,
        "Update Knowledge",
        "Later"
      )
      .then(async (choice) => {
        if (choice === "Update Knowledge") {
          const count = await standards.updateSources(outdated);
          vscode.window.showInformationMessage(
            `Updated ${count} standards source(s).`
          );
        }
      });
  }

  vscode.window.showInformationMessage("PCW ToolBelt loaded successfully! 🚀");
}

/**
 * This function is called when the extension is deactivated
 */
export function deactivate() {
  console.log("PCW ToolBelt has been deactivated.");
}
