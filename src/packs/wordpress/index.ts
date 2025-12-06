import * as vscode from 'vscode';

/**
 * WordPress PowerPack - "The Developer"
 * Focuses on Standards, PHP compliance, and Theme structure
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('WordPress PowerPack: Loading...');

    // Scaffold Child Theme command
    const scaffoldChildThemeCmd = vscode.commands.registerCommand(
        'pcw.wordpress.scaffoldChildTheme',
        () => {
            vscode.window.showInformationMessage('Child Theme Scaffolder coming soon!');
        }
    );

    // Run WPCS Compliance command
    const runWPCSCmd = vscode.commands.registerCommand(
        'pcw.wordpress.runWPCS',
        () => {
            vscode.window.showInformationMessage('WPCS Compliance Runner coming soon!');
        }
    );

    context.subscriptions.push(scaffoldChildThemeCmd, runWPCSCmd);

    console.log('WordPress PowerPack: Activated ✓');
}
