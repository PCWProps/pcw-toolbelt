import * as vscode from 'vscode';
import { auditWidget } from './auditor';

/**
 * Elementor PowerPack - "The Builder"
 * Specialized tools to prevent "Files can't be used" errors
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Elementor PowerPack: Loading...');

    // Widget Pre-Flight Audit command (MAIN FEATURE)
    const auditWidgetCmd = vscode.commands.registerCommand(
        'pcw.elementor.auditWidget',
        auditWidget
    );

    // Generate Widget Boilerplate command
    const generateBoilerplateCmd = vscode.commands.registerCommand(
        'pcw.elementor.generateBoilerplate',
        () => {
            vscode.window.showInformationMessage('Widget Boilerplate Generator coming soon!');
        }
    );

    context.subscriptions.push(auditWidgetCmd, generateBoilerplateCmd);

    console.log('Elementor PowerPack: Activated ✓');
}
