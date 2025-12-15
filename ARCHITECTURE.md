# Context-Aware Architecture

## Overview

PCW ToolBelt now uses a **Context-Aware** auditing system that automatically detects the framework being used (WordPress, Elementor, React, WooCommerce) and applies the appropriate rules.

## How It Works

### 1. Signature Detection

The `ContextManager` scans file content for framework-specific signatures:

- **Elementor**: `\Elementor\Widget_Base`, `extends Widget_Base`
- **WordPress**: `add_action`, `add_filter`, `wp_enqueue_`
- **React**: `useEffect`, `useState`, `className=`, `import React`
- **WooCommerce**: `WC_Order`, `WC_Product`, `woocommerce_`

### 2. Dynamic Rule Loading

Rules are stored in JSON files in `src/rules/`:

```
src/rules/
├── elementor-rules.json
├── wordpress-rules.json
├── react-rules.json
└── woocommerce-rules.json
```

Each rule file contains:

```json
{
  "context": "elementor",
  "description": "Best practices for Elementor widgets",
  "rules": [
    {
      "pattern": "regex pattern",
      "message": "Error message shown to user",
      "severity": "error|warning|info",
      "category": "optional-category"
    }
  ]
}
```

### 3. Usage

#### Audit Active File

1. Open any PHP, JS, JSX, TS, or TSX file
2. Run command: `PCW: Audit File (Context-Aware)`
3. The system will:
   - Detect the framework context
   - Load matching rules
   - Scan for issues
   - Display results in output panel

#### Audit Entire Workspace

1. Run command: `PCW: Audit Workspace (Context-Aware)`
2. Scans all relevant files in the workspace
3. Generates comprehensive report

#### Reload Rules

After editing rule files:

1. Run command: `PCW: Reload Audit Rules`
2. Clears the cache so next audit loads fresh rules

## Adding New Rules

To add a new best practice check, simply edit the appropriate JSON file:

```json
{
  "pattern": "your-regex-pattern",
  "message": "Helpful message explaining the issue",
  "severity": "error",
  "category": "security"
}
```

**No TypeScript code changes required!**

## Benefits

✅ **Framework Agnostic**: Works with any file, auto-detects context  
✅ **Extensible**: Add rules via JSON, no coding needed  
✅ **Fast**: Rules are cached for performance  
✅ **Comprehensive**: Audit single files or entire workspace  
✅ **Clear Reporting**: Issues grouped by severity with line numbers

## Architecture Components

### `src/core/types.ts`

Type definitions for the context-aware system:

- `FrameworkContext`: Type union of supported frameworks
- `Rule`: Individual rule structure
- `RuleSet`: Collection of rules for a context
- `AuditResult`: Results from auditing a file
- `AuditIssue`: Individual issue found

### `src/core/ContextManager.ts`

Singleton manager that handles:

- Framework detection via signature scanning
- Dynamic rule loading from JSON files
- File auditing against loaded rules
- Results formatting and caching

### `src/core/auditor.ts`

VS Code command handlers:

- `auditFile()`: Audit the active file
- `auditWorkspace()`: Audit all files in workspace
- `reloadRules()`: Clear rules cache

### `src/rules/*.json`

Framework-specific rule definitions that can be updated without recompiling.

## Example Output

```
📋 Audit Report: my-widget.php
🎯 Context: elementor
⚠️  Issues Found: 3
📅 Timestamp: 2025-12-06T12:00:00.000Z

❌ ERRORS (1):
  Line 15:5 - Widget class must extend \Elementor\Widget_Base or Widget_Base
    Matched: "class MyWidget"

⚠️  WARNINGS (1):
  Line 45:12 - Inline CSS detected - use render() output or enqueue_styles() instead
    Matched: "<style>"

ℹ️  INFO (1):
  Line 23:8 - Consider using TEXT type with input_type for better UX
    Matched: "'type' => Controls_Manager::TEXT"
```

## Migration from Old System

The old Elementor-specific auditor (`src/packs/elementor/auditor.ts`) now delegates directly to the universal context-aware auditor. All legacy checks have been migrated into `src/rules/elementor-rules.json` with explicit rule IDs, `mustExist` semantics, and fix/suggestion metadata.

Migration steps (already applied for Elementor):

1. Extracted regex patterns from hardcoded checks
2. Added rule objects (with IDs) to the appropriate JSON file
3. Verified via `PPACK: Core: Audit File (Context-Aware)`
4. Replaced legacy auditor logic with a thin wrapper to the universal engine

## Future Enhancements

- [x] Custom rule files per project (`.pcw-rules/`)
- [x] Rule severity configuration via `.pcw-rules/config.json`
- [x] Auto-fix suggestions for common issues (`PPACK: Core: Apply Auto-Fixes`)
- [x] Integration with VS Code Problems panel (diagnostics on audits)
- [x] Rule sharing through remote repositories (declare URLs in `.pcw-rules/config.json`)

### Project-Level Rules & Severity Overrides

- Create `.pcw-rules/<context>-rules.json` in your workspace to extend or override bundled rules.
- Add `.pcw-rules/config.json` to tweak severities or pull community rule feeds:
  ```json
  {
    "severityOverrides": {
      "elementor": {
        "elementor-direct-echo": "warning"
      }
    },
    "repositories": ["https://example.com/community/elementor-rules.json"]
  }
  ```

### Auto-Fix Workflow

- Run `PPACK: Core: Audit File (Context-Aware)` to surface issues and suggestions.
- Run `PPACK: Core: Apply Auto-Fixes` to apply safe replacements defined in rule metadata (e.g., renaming deprecated Elementor APIs).
- Diagnostics are published to the VS Code Problems panel for quick navigation.
