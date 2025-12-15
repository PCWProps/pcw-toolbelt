/**
 * PCW ToolBelt Side Panel Provider
 * Provides a webview-based side panel for tool selection and results display
 */

import * as vscode from "vscode";
import * as path from "path";

export interface IssueItem {
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  matched?: string;
  category?: string;
  filePath?: string;
}

export class PCWSidePanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "pcw-toolbelt.sidePanel";

  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private _currentResults: IssueItem[] = [];
  private _currentContext: string = "";

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "runTool":
          await this._handleRunTool(data.powerPack, data.tool);
          break;
        case "goToLine":
          await this._goToLine(data.filePath, data.line, data.column);
          break;
        case "copyToChat":
          await this._copyToChat(data.issue);
          break;
        case "clearResults":
          this._clearResults();
          break;
      }
    });
  }

  /**
   * Display results in the side panel
   */
  public showResults(results: IssueItem[], context: string, summary?: string) {
    this._currentResults = results;
    this._currentContext = context;

    if (this._view) {
      this._view.webview.postMessage({
        type: "showResults",
        results,
        context,
        summary,
      });
    }
  }

  /**
   * Show a status message in the panel
   */
  public showStatus(message: string, isError: boolean = false) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "status",
        message,
        isError,
      });
    }
  }

  /**
   * Clear the results display
   */
  private _clearResults() {
    this._currentResults = [];
    this._currentContext = "";
    if (this._view) {
      this._view.webview.postMessage({
        type: "clearResults",
      });
    }
  }

  /**
   * Handle tool execution
   */
  private async _handleRunTool(powerPack: string, tool: string) {
    const commandMap: { [key: string]: string } = {
      "core-generateContextMap": "pcw.allsystemsgo.generateContextMap",
      "core-auditFile": "pcw.allsystemsgo.auditFile",
      "core-auditWorkspace": "pcw.allsystemsgo.auditWorkspace",
      "core-reloadRules": "pcw.allsystemsgo.reloadRules",
      "core-setGuardrails": "pcw.allsystemsgo.setGuardrails",
      "core-updateGuardrails": "pcw.allsystemsgo.updateGuardrails",
      "core-scanSecrets": "pcw.allsystemsgo.scanSecrets",
      "elementor-auditWidget": "pcw.elementor.auditWidget",
      "elementor-generateBoilerplate": "pcw.elementor.generateBoilerplate",
      "wordpress-scaffoldChildTheme": "pcw.wordpress.scaffoldChildTheme",
      "wordpress-runWPCS": "pcw.wordpress.runWPCS",
      "woocommerce-checkTemplateOverrides":
        "pcw.woocommerce.checkTemplateOverrides",
      "woocommerce-generateCustomTab": "pcw.woocommerce.generateCustomTab",
    };

    const commandId = commandMap[`${powerPack}-${tool}`];
    if (commandId) {
      this.showStatus(`Running ${tool}...`, false);
      try {
        await vscode.commands.executeCommand(commandId);
      } catch (error) {
        this.showStatus(`Error running ${tool}: ${error}`, true);
      }
    }
  }

  /**
   * Navigate to a specific line in a file
   */
  private async _goToLine(
    filePath: string | undefined,
    line: number,
    column: number
  ) {
    try {
      let document: vscode.TextDocument;

      if (filePath) {
        // Open specific file
        const uri = vscode.Uri.file(filePath);
        document = await vscode.workspace.openTextDocument(uri);
      } else {
        // Use active editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("No file open");
          return;
        }
        document = editor.document;
      }

      const editor = await vscode.window.showTextDocument(document);
      const position = new vscode.Position(line - 1, column - 1);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Could not navigate to line: ${error}`);
    }
  }

  /**
   * Copy issue to chat extension
   */
  private async _copyToChat(issue: IssueItem) {
    const config = vscode.workspace.getConfiguration("pcw-toolbelt");
    const chatProvider = config.get<string>("chatProvider", "github-copilot");

    const issueText = this._formatIssueForChat(issue);

    // Try to send to the configured chat provider
    const success = await this._sendToChatProvider(chatProvider, issueText);

    if (!success) {
      // Fallback: copy to clipboard
      await vscode.env.clipboard.writeText(issueText);
      vscode.window
        .showInformationMessage(
          `Issue copied to clipboard. Paste into ${chatProvider}.`,
          "Open Chat"
        )
        .then((selection) => {
          if (selection === "Open Chat") {
            this._openChatProvider(chatProvider);
          }
        });
    }
  }

  /**
   * Format issue for chat context
   */
  private _formatIssueForChat(issue: IssueItem): string {
    let text = `🔍 Code Issue Found\n\n`;
    text += `**Severity:** ${issue.severity.toUpperCase()}\n`;
    text += `**Location:** Line ${issue.line}, Column ${issue.column}\n`;
    if (issue.filePath) {
      text += `**File:** ${path.basename(issue.filePath)}\n`;
    }
    if (issue.category) {
      text += `**Category:** ${issue.category}\n`;
    }
    text += `\n**Issue:**\n${issue.message}\n`;
    if (issue.matched) {
      text += `\n**Code:**\n\`\`\`\n${issue.matched}\n\`\`\`\n`;
    }
    text += `\nPlease suggest a fix for this issue.`;

    return text;
  }

  /**
   * Send issue to chat provider
   */
  private async _sendToChatProvider(
    provider: string,
    text: string
  ): Promise<boolean> {
    try {
      switch (provider) {
        case "github-copilot":
          // Try GitHub Copilot Chat API
          const copilotExtension = vscode.extensions.getExtension(
            "GitHub.copilot-chat"
          );
          if (copilotExtension) {
            await vscode.commands.executeCommand("workbench.action.chat.open", {
              query: text,
            });
            return true;
          }
          break;

        case "gemini":
          // Try Google Gemini extension
          const geminiExtension = vscode.extensions.getExtension(
            "GoogleCloudTools.cloudcode"
          );
          if (geminiExtension) {
            // Gemini integration would go here
            // For now, fallback to clipboard
          }
          break;

        case "chatgpt":
          // Try ChatGPT/Codex extension
          const chatgptExtension = vscode.extensions.getExtension(
            "gencay.vscode-chatgpt"
          );
          if (chatgptExtension) {
            await vscode.commands.executeCommand("chatgpt.ask", text);
            return true;
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to send to ${provider}:`, error);
    }

    return false;
  }

  /**
   * Open chat provider
   */
  private _openChatProvider(provider: string) {
    switch (provider) {
      case "github-copilot":
        vscode.commands.executeCommand("workbench.action.chat.open");
        break;
      case "gemini":
        vscode.commands.executeCommand("cloudcode.chat");
        break;
      case "chatgpt":
        vscode.commands.executeCommand("chatgpt.view.focus");
        break;
    }
  }

  /**
   * Generate HTML for the webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PCW ToolBelt</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: 10px;
        }
        
        .header {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .logo {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--vscode-textLink-foreground);
        }
        
        .tool-selector {
            margin-bottom: 10px;
        }
        
        select {
            width: 100%;
            padding: 6px;
            margin-bottom: 8px;
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border: 1px solid var(--vscode-dropdown-border);
            border-radius: 2px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        
        button {
            width: 100%;
            padding: 8px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .status-bar {
            padding: 8px;
            margin-bottom: 10px;
            border-radius: 2px;
            background-color: var(--vscode-inputValidation-infoBackground);
            border-left: 3px solid var(--vscode-inputValidation-infoBorder);
            display: none;
        }
        
        .status-bar.error {
            background-color: var(--vscode-inputValidation-errorBackground);
            border-left-color: var(--vscode-inputValidation-errorBorder);
        }
        
        .status-bar.visible {
            display: block;
        }
        
        .results-section {
            margin-top: 15px;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px;
            background-color: var(--vscode-editor-background);
            border-radius: 2px;
        }
        
        .results-title {
            font-weight: bold;
        }
        
        .results-summary {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
        
        .clear-btn {
            width: auto;
            padding: 4px 12px;
            font-size: 0.9em;
        }
        
        .issue-list {
            max-height: calc(100vh - 300px);
            overflow-y: auto;
        }
        
        .issue-item {
            padding: 10px;
            margin-bottom: 8px;
            background-color: var(--vscode-editor-background);
            border-left: 3px solid;
            border-radius: 2px;
            cursor: pointer;
        }
        
        .issue-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
        
        .issue-item.error {
            border-left-color: var(--vscode-errorForeground);
        }
        
        .issue-item.warning {
            border-left-color: var(--vscode-editorWarning-foreground);
        }
        
        .issue-item.info {
            border-left-color: var(--vscode-editorInfo-foreground);
        }
        
        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        
        .issue-severity {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.85em;
        }
        
        .issue-location {
            font-size: 0.85em;
            color: var(--vscode-descriptionForeground);
            text-decoration: underline;
        }
        
        .issue-message {
            margin-bottom: 6px;
            line-height: 1.4;
        }
        
        .issue-matched {
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
            padding: 6px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 2px;
            margin-bottom: 6px;
            overflow-x: auto;
        }
        
        .issue-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        
        .issue-btn {
            width: auto;
            padding: 4px 10px;
            font-size: 0.85em;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .issue-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🚀 PCW ToolBelt</div>
        
        <div class="tool-selector">
            <select id="powerPackSelect">
                <option value="">Select PowerPack...</option>
                <option value="core">🟢 Core - All Systems Go</option>
                <option value="wordpress">🔵 WordPress</option>
                <option value="elementor">🌸 Elementor</option>
                <option value="woocommerce">🛒 WooCommerce</option>
            </select>
            
            <select id="toolSelect" disabled>
                <option value="">Select Tool...</option>
            </select>
            
            <button id="runBtn" disabled>Run Tool</button>
        </div>
        
        <div id="statusBar" class="status-bar"></div>
    </div>
    
    <div class="results-section">
        <div id="resultsHeader" class="results-header" style="display: none;">
            <div>
                <div class="results-title" id="resultsTitle">Results</div>
                <div class="results-summary" id="resultsSummary"></div>
            </div>
            <button class="clear-btn" onclick="clearResults()">Clear</button>
        </div>
        
        <div id="issueList" class="issue-list"></div>
        
        <div id="emptyState" class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <div>Select a tool and click Run to see results</div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        const tools = {
            core: [
                { id: 'generateContextMap', name: 'Generate Context Map' },
                { id: 'auditFile', name: 'Audit File (Context-Aware)' },
                { id: 'auditWorkspace', name: 'Audit Workspace' },
                { id: 'reloadRules', name: 'Reload Audit Rules' },
                { id: 'setGuardrails', name: 'Set Project Guardrails' },
                { id: 'updateGuardrails', name: 'Update Guardrails' },
                { id: 'scanSecrets', name: 'Secret Scanner' }
            ],
            wordpress: [
                { id: 'scaffoldChildTheme', name: 'Scaffold Child Theme' },
                { id: 'runWPCS', name: 'Run WPCS Compliance Check' }
            ],
            elementor: [
                { id: 'auditWidget', name: 'Audit Widget (Pre-Flight)' },
                { id: 'generateBoilerplate', name: 'Generate Widget Boilerplate' }
            ],
            woocommerce: [
                { id: 'checkTemplateOverrides', name: 'Check Template Overrides' },
                { id: 'generateCustomTab', name: 'Generate Custom Tab' }
            ]
        };
        
        const powerPackSelect = document.getElementById('powerPackSelect');
        const toolSelect = document.getElementById('toolSelect');
        const runBtn = document.getElementById('runBtn');
        const statusBar = document.getElementById('statusBar');
        const resultsHeader = document.getElementById('resultsHeader');
        const issueList = document.getElementById('issueList');
        const emptyState = document.getElementById('emptyState');
        
        powerPackSelect.addEventListener('change', (e) => {
            const powerPack = e.target.value;
            toolSelect.innerHTML = '<option value="">Select Tool...</option>';
            
            if (powerPack && tools[powerPack]) {
                tools[powerPack].forEach(tool => {
                    const option = document.createElement('option');
                    option.value = tool.id;
                    option.textContent = tool.name;
                    toolSelect.appendChild(option);
                });
                toolSelect.disabled = false;
            } else {
                toolSelect.disabled = true;
            }
            
            runBtn.disabled = true;
        });
        
        toolSelect.addEventListener('change', (e) => {
            runBtn.disabled = !e.target.value;
        });
        
        runBtn.addEventListener('click', () => {
            const powerPack = powerPackSelect.value;
            const tool = toolSelect.value;
            
            if (powerPack && tool) {
                vscode.postMessage({
                    type: 'runTool',
                    powerPack,
                    tool
                });
            }
        });
        
        function showStatus(message, isError = false) {
            statusBar.textContent = message;
            statusBar.className = 'status-bar visible' + (isError ? ' error' : '');
            setTimeout(() => {
                statusBar.className = 'status-bar';
            }, 5000);
        }
        
        function clearResults() {
            vscode.postMessage({ type: 'clearResults' });
        }
        
        function goToLine(filePath, line, column) {
            vscode.postMessage({
                type: 'goToLine',
                filePath,
                line,
                column
            });
        }
        
        function copyToChat(issue) {
            vscode.postMessage({
                type: 'copyToChat',
                issue
            });
        }
        
        function displayResults(results, context, summary) {
            issueList.innerHTML = '';
            emptyState.style.display = 'none';
            resultsHeader.style.display = 'flex';
            
            document.getElementById('resultsTitle').textContent = 
                \`\${context ? context.charAt(0).toUpperCase() + context.slice(1) : 'Audit'} Results\`;
            
            const errors = results.filter(r => r.severity === 'error').length;
            const warnings = results.filter(r => r.severity === 'warning').length;
            const infos = results.filter(r => r.severity === 'info').length;
            
            let summaryText = \`\${results.length} issue(s): \`;
            const parts = [];
            if (errors > 0) parts.push(\`\${errors} error(s)\`);
            if (warnings > 0) parts.push(\`\${warnings} warning(s)\`);
            if (infos > 0) parts.push(\`\${infos} info\`);
            summaryText += parts.join(', ');
            
            document.getElementById('resultsSummary').textContent = summaryText;
            
            if (results.length === 0) {
                issueList.innerHTML = '<div class="empty-state">✅ No issues found!</div>';
                return;
            }
            
            results.forEach((issue, index) => {
                const issueDiv = document.createElement('div');
                issueDiv.className = \`issue-item \${issue.severity}\`;
                
                issueDiv.innerHTML = \`
                    <div class="issue-header">
                        <span class="issue-severity">\${issue.severity}</span>
                        <span class="issue-location" onclick="goToLine('\${issue.filePath || ''}', \${issue.line}, \${issue.column})">
                            Line \${issue.line}:\${issue.column} →
                        </span>
                    </div>
                    <div class="issue-message">\${issue.message}</div>
                    \${issue.matched ? \`<div class="issue-matched">\${escapeHtml(issue.matched)}</div>\` : ''}
                    <div class="issue-actions">
                        <button class="issue-btn" onclick='copyToChat(\${JSON.stringify(issue)})'>
                            📋 Copy to Chat
                        </button>
                    </div>
                \`;
                
                issueList.appendChild(issueDiv);
            });
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'showResults':
                    displayResults(message.results, message.context, message.summary);
                    break;
                case 'status':
                    showStatus(message.message, message.isError);
                    break;
                case 'clearResults':
                    issueList.innerHTML = '';
                    resultsHeader.style.display = 'none';
                    emptyState.style.display = 'block';
                    break;
            }
        });
    </script>
</body>
</html>`;
  }
}
