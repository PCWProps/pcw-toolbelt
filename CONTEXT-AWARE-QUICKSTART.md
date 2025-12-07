# 🎯 Context-Aware Architecture - Quick Start

## What Changed?

PCW ToolBelt now automatically detects what framework you're using (WordPress, Elementor, React, WooCommerce) and applies the right rules - **no more file extension checking!**

## New Commands

### 1. `PCW: Audit File (Context-Aware)`

- Opens current file
- Auto-detects framework
- Shows issues with line numbers
- Categorized by severity (error/warning/info)

### 2. `PCW: Audit Workspace (Context-Aware)`

- Scans all PHP/JS/TS files
- Generates comprehensive report
- Shows totals and summaries

### 3. `PCW: Reload Audit Rules`

- Refreshes rules from JSON files
- Use after editing rule files

## Testing the System

1. **Open the example file**: `example-widget.php`
2. **Run**: `PCW: Audit File (Context-Aware)`
3. **Check output panel** to see detected issues

Expected issues:

- Missing `get_title()`, `get_icon()`, `get_categories()` methods
- Deprecated `_register_controls()` method
- Inline `<style>` tags
- Direct `echo` without escaping

## Adding Your Own Rules

Edit any file in `src/rules/`:

```json
{
  "pattern": "bad_function\\s*\\(",
  "message": "Don't use bad_function() - use good_function() instead",
  "severity": "warning",
  "category": "best-practice"
}
```

Save → Run `PCW: Reload Audit Rules` → Done!

## File Structure

```
src/
├── core/
│   ├── types.ts              # Type definitions
│   ├── ContextManager.ts     # Main detection engine
│   └── auditor.ts            # VS Code commands
└── rules/
    ├── elementor-rules.json   # 15 Elementor rules
    ├── wordpress-rules.json   # 15 WordPress rules
    ├── react-rules.json       # 15 React rules
    └── woocommerce-rules.json # 18 WooCommerce rules
```

## Benefits

✅ **Extensible**: Add rules without TypeScript knowledge  
✅ **Smart**: Auto-detects framework from code signatures  
✅ **Fast**: Rules are cached for performance  
✅ **Comprehensive**: 63 best practice checks included  
✅ **Clear**: Issues show exact line/column numbers

## Next Steps

1. Test with the example file
2. Run on your real project files
3. Add custom rules for your team's standards
4. Share rules across projects

## Key Classes

- **`ContextManager`**: Singleton that handles detection & auditing
- **`detectContext(content)`**: Returns detected framework
- **`loadRules(context)`**: Loads JSON rules for framework
- **`auditFile(path, content)`**: Runs audit and returns results
- **`formatAuditResult(result)`**: Pretty-prints output

See `ARCHITECTURE.md` for complete documentation.
