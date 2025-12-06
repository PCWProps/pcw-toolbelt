import * as vscode from 'vscode';

/**
 * WooCommerce PowerPack - "The Merchant"
 * Focuses on security, template overrides, and data integrity
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('WooCommerce PowerPack: Loading...');

    // Check Template Overrides command
    const checkTemplateOverridesCmd = vscode.commands.registerCommand(
        'pcw.woocommerce.checkTemplateOverrides',
        () => {
            vscode.window.showInformationMessage('Template Override Checker coming soon!');
        }
    );

    // Generate Custom Tab command
    const generateCustomTabCmd = vscode.commands.registerCommand(
        'pcw.woocommerce.generateCustomTab',
        () => {
            vscode.window.showInformationMessage('Custom Tab Generator coming soon!');
        }
    );

    context.subscriptions.push(checkTemplateOverridesCmd, generateCustomTabCmd);

    console.log('WooCommerce PowerPack: Activated ✓');
}
