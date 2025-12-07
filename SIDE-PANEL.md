# 📊 PCW ToolBelt Side Panel

## Overview

The PCW ToolBelt now features a comprehensive side panel that provides:

- ✅ PowerPack & tool selection dropdowns
- ✅ Real-time audit results with clickable line numbers
- ✅ Copy to Chat integration (GitHub Copilot, Gemini, ChatGPT)
- ✅ Severity-based color coding
- ✅ File path navigation

## Features

### 1. Tool Selection

- **PowerPack Dropdown**: Select from Core, WordPress, Elementor, or WooCommerce
- **Tool Dropdown**: Dynamically populated based on selected PowerPack
- **Run Button**: Execute the selected tool with one click

### 2. Results Display

- **Severity Indicators**: Color-coded by error/warning/info
- **Clickable Line Numbers**: Click to jump directly to the issue
- **Code Snippets**: Shows the problematic code
- **Summary Stats**: Total issues broken down by severity

### 3. Copy to Chat Integration

Each issue has a "📋 Copy to Chat" button that:

- Formats the issue with context
- Sends it to your configured AI chat provider
- Falls back to clipboard if extension not installed

**Supported Chat Providers:**

- GitHub Copilot Chat (`GitHub.copilot-chat`)
- Google Gemini (`GoogleCloudTools.cloudcode`)
- ChatGPT (`gencay.vscode-chatgpt`)

Configure in settings: `pcw-toolbelt.chatProvider`

## Usage

### Opening the Side Panel

1. Click the PCW ToolBelt icon in the Activity Bar (left sidebar)
2. The PowerPacks panel will open

### Running a Tool

1. Select a PowerPack from the dropdown
2. Select a tool from the second dropdown
3. Click "Run Tool"
4. Results appear in the bottom section

### Navigating to Issues

- Click on the `Line X:Y →` link to jump to that location in your file
- The file will open and cursor will be positioned at the exact issue

### Copying Issues to Chat

1. Click the "📋 Copy to Chat" button on any issue
2. If your configured chat extension is installed, it opens with the issue pre-loaded
3. Otherwise, the issue is copied to clipboard

## Configuration

Add to your `settings.json`:

```json
{
  "pcw-toolbelt.chatProvider": "github-copilot"
}
```

**Options:**

- `github-copilot` (default)
- `gemini`
- `chatgpt`

## Commands Updated

All commands now use the `PPACK:` prefix format:

```
PPACK: Core: Audit File (Context-Aware)
PPACK: Core: Audit Workspace (Context-Aware)
PPACK: Core: Reload Audit Rules
PPACK: Elementor: Audit Widget (Pre-Flight)
PPACK: WordPress: Scaffold Child Theme
PPACK: WooCommerce: Check Template Overrides
...etc
```

## Architecture

### Files Created/Modified

**New Files:**

- `src/core/SidePanelProvider.ts` - WebView provider for side panel (650+ lines)
  - Handles tool execution
  - Manages results display
  - Implements chat integration
  - Navigation to code locations

**Modified Files:**

- `src/core/auditor.ts` - Now sends results to side panel
- `src/extension.ts` - Registers side panel provider
- `package.json` - Adds view container, configuration

### Key Classes

**`PCWSidePanelProvider`**

- `resolveWebviewView()` - Initializes the webview
- `showResults()` - Displays audit results
- `showStatus()` - Shows status messages
- `_handleRunTool()` - Executes tool commands
- `_goToLine()` - Navigates to file location
- `_copyToChat()` - Sends issue to AI chat

### WebView Communication

**Extension → WebView:**

- `showResults` - Display audit results
- `status` - Show status message
- `clearResults` - Clear the display

**WebView → Extension:**

- `runTool` - Execute a tool
- `goToLine` - Navigate to code
- `copyToChat` - Send to AI chat
- `clearResults` - Clear display

## Styling

The panel uses VS Code's theme variables for perfect integration:

- `--vscode-foreground`
- `--vscode-button-background`
- `--vscode-errorForeground`
- `--vscode-editorWarning-foreground`
- `--vscode-editorInfo-foreground`

## Future Enhancements

- [ ] Filtering by severity
- [ ] Sorting options
- [ ] Export results to file
- [ ] Issue history/comparison
- [ ] Custom chat prompts
- [ ] Batch actions (fix all, ignore all)
