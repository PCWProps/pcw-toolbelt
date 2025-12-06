import * as vscode from 'vscode';
import { activate as activateCore } from './packs/core';
import { activate as activateWordPress } from './packs/wordpress';
import { activate as activateElementor } from './packs/elementor';
import { activate as activateWooCommerce } from './packs/woocommerce';

/**
 * Main entry point for PCW ToolBelt
 * This function is called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('PCW ToolBelt is now active!');

    // Load all PowerPacks
    activateCore(context);
    activateWordPress(context);
    activateElementor(context);
    activateWooCommerce(context);

    vscode.window.showInformationMessage('PCW ToolBelt loaded successfully! 🚀');
}

/**
 * This function is called when the extension is deactivated
 */
export function deactivate() {
    console.log('PCW ToolBelt has been deactivated.');
}
