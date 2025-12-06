import * as vscode from 'vscode';

/**
 * Elementor Widget Pre-Flight Audit
 * Validates PHP widget files against Elementor's Widget_Base requirements
 */
export async function auditWidget() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a PHP file.');
        return;
    }

    const document = editor.document;
    const filePath = document.fileName;

    // Check if it's a PHP file
    if (!filePath.endsWith('.php')) {
        vscode.window.showErrorMessage('Please open a PHP file to audit.');
        return;
    }

    const fileContent = document.getText();

    // Run the audit
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Running Elementor Widget Pre-Flight Audit...',
            cancellable: false,
        },
        async () => {
            const results = performAudit(fileContent, filePath);
            displayResults(results);
        }
    );
}

/**
 * Performs the actual audit checks
 */
function performAudit(
    content: string,
    filePath: string
): { passed: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Does the class extend \Elementor\Widget_Base?
    const extendsWidgetBase = /class\s+\w+\s+extends\s+\\?Elementor\\Widget_Base/i.test(
        content
    );
    if (!extendsWidgetBase) {
        errors.push(
            'Class does not extend \\Elementor\\Widget_Base. This is required for all Elementor widgets.'
        );
    }

    // Check 2: Does the get_name() method exist?
    const hasGetName = /public\s+function\s+get_name\s*\(\s*\)/i.test(content);
    if (!hasGetName) {
        errors.push(
            'Missing required method: public function get_name(). This method must return a unique widget identifier.'
        );
    }

    // Check 3: Does the get_title() method exist? (Common requirement)
    const hasGetTitle = /public\s+function\s+get_title\s*\(\s*\)/i.test(content);
    if (!hasGetTitle) {
        warnings.push(
            'Missing method: public function get_title(). This method is typically required to display the widget name in the editor.'
        );
    }

    // Check 4: Does the get_icon() method exist?
    const hasGetIcon = /public\s+function\s+get_icon\s*\(\s*\)/i.test(content);
    if (!hasGetIcon) {
        warnings.push(
            'Missing method: public function get_icon(). Consider adding this to display a custom icon in the Elementor panel.'
        );
    }

    // Check 5: Does the get_categories() method exist?
    const hasGetCategories = /public\s+function\s+get_categories\s*\(\s*\)/i.test(content);
    if (!hasGetCategories) {
        warnings.push(
            'Missing method: public function get_categories(). This method defines which panel category the widget appears in.'
        );
    }

    // Check 6: Does the render() method exist?
    const hasRender = /protected\s+function\s+render\s*\(\s*\)/i.test(content);
    if (!hasRender) {
        errors.push(
            'Missing required method: protected function render(). This method generates the widget output on the frontend.'
        );
    }

    // Check 7: Check for proper namespace usage
    const hasNamespace = /namespace\s+[\w\\]+;/i.test(content);
    if (!hasNamespace) {
        warnings.push(
            'No namespace detected. Consider using namespaces for better code organization and avoiding conflicts.'
        );
    }

    // Check 8: Inline CSS detection (bad practice)
    const hasInlineStyles = /<style[^>]*>[\s\S]*?<\/style>/i.test(content);
    if (hasInlineStyles) {
        warnings.push(
            'Inline <style> tags detected in render(). Consider moving styles to Elementor controls for better editor integration.'
        );
    }

    const passed = errors.length === 0;

    return { passed, errors, warnings };
}

/**
 * Displays audit results to the user
 */
function displayResults(results: {
    passed: boolean;
    errors: string[];
    warnings: string[];
}) {
    if (results.passed && results.warnings.length === 0) {
        vscode.window.showInformationMessage(
            '✓ Widget Structure Valid! All checks passed.'
        );
        return;
    }

    // Show errors
    if (results.errors.length > 0) {
        const errorMessage = `❌ Widget Audit Failed:\n\n${results.errors.join('\n\n')}`;
        vscode.window.showWarningMessage(
            `Widget has ${results.errors.length} critical error(s). Check the output panel for details.`
        );

        // Log to output channel for detailed view
        const outputChannel = vscode.window.createOutputChannel('PCW ToolBelt - Elementor Audit');
        outputChannel.clear();
        outputChannel.appendLine('=== ELEMENTOR WIDGET PRE-FLIGHT AUDIT ===\n');
        outputChannel.appendLine('ERRORS:');
        results.errors.forEach((err, idx) => {
            outputChannel.appendLine(`${idx + 1}. ${err}`);
        });

        if (results.warnings.length > 0) {
            outputChannel.appendLine('\nWARNINGS:');
            results.warnings.forEach((warn, idx) => {
                outputChannel.appendLine(`${idx + 1}. ${warn}`);
            });
        }

        outputChannel.show();
        return;
    }

    // Show warnings only
    if (results.warnings.length > 0) {
        vscode.window.showInformationMessage(
            `✓ Widget structure is valid, but ${results.warnings.length} suggestion(s) available. Check the output panel.`
        );

        const outputChannel = vscode.window.createOutputChannel('PCW ToolBelt - Elementor Audit');
        outputChannel.clear();
        outputChannel.appendLine('=== ELEMENTOR WIDGET PRE-FLIGHT AUDIT ===\n');
        outputChannel.appendLine('✓ No critical errors found.\n');
        outputChannel.appendLine('SUGGESTIONS:');
        results.warnings.forEach((warn, idx) => {
            outputChannel.appendLine(`${idx + 1}. ${warn}`);
        });
        outputChannel.show();
    }
}
