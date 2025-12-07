# Core PowerPack - "All Systems Go" 🟢

Complete documentation for all 10 tools in the foundational Core PowerPack.

## Overview

The Core PowerPack provides essential tools for project health, security, and scaffolding. These tools work across all project types and frameworks, ensuring your codebase stays clean, secure, and well-documented.

---

## 1. Generate Context Map 🗺️

**Command:** `PPACK: Core: Generate Context Map`

Scans your project structure and creates an `Agent.md` file that AI coding assistants can use to understand your project layout.

### What it Does

- Recursively scans your workspace directory structure
- Generates a hierarchical tree view
- Creates an `Agent.md` file in the workspace root
- Excludes common directories (node_modules, .git, dist, build)

### Usage

1. Open Command Palette (`Cmd+Shift+P`)
2. Run `PPACK: Core: Generate Context Map`
3. Opens the generated `Agent.md` file

### Output Example

```markdown
# Project Context Map

## Directory Structure
```

project-root/
├── src/
│ ├── components/
│ ├── utils/
│ └── index.ts
├── tests/
└── package.json

```

```

---

## 2. Context-Aware File Audit ✅

**Command:** `PPACK: Core: Audit File`

Intelligently detects the framework(s) used in the current file and applies appropriate best practice rules.

### Features

- Automatic framework detection (WordPress, React, Elementor, WooCommerce)
- Dynamic rule loading from JSON files
- Severity-based issue reporting (error, warning, info)
- Line-by-line code analysis
- Side panel integration with clickable results

### Supported Frameworks

- **WordPress**: 15 rules (sanitization, escaping, nonces, SQL injection)
- **React**: 15 rules (hooks, keys, performance, class components)
- **Elementor**: 15 rules (Widget_Base, required methods, deprecated APIs)
- **WooCommerce**: 18 rules (CRUD methods, order handling, pricing)

### Usage

1. Open a PHP/JS/TS file
2. Run `PPACK: Core: Audit File`
3. View results in the PCW ToolBelt side panel
4. Click line numbers to jump to issues

---

## 3. Context-Aware Workspace Audit 📦

**Command:** `PPACK: Core: Audit Workspace`

Audits all files in your workspace with context-aware rules.

### Features

- Batch file processing
- Progress indicator
- Aggregated results by file
- Framework detection per file
- Comprehensive reporting

### Usage

1. Run `PPACK: Core: Audit Workspace`
2. Wait for scan to complete
3. Review aggregated results in side panel

---

## 4. Set Project Guardrails 🛡️

**Command:** `PPACK: Core: Set Project Guardrails`

Interactive setup of project-specific coding standards that AI assistants should follow.

### Features

- Automatic framework detection
- Interactive prompts for:
  - Framework selection
  - Indentation style (spaces/tabs)
  - Naming conventions (camelCase, snake_case, PascalCase, kebab-case)
- Framework-specific rules:
  - WordPress: sanitization, escaping, nonces, prepared queries
  - React: hooks dependencies, key props, functional components
  - TypeScript: explicit types, no-any rules
- Universal security rules
- Universal performance rules
- Generates `.pcw-guardrails.json` file

### Usage

1. Run `PPACK: Core: Set Project Guardrails`
2. Select frameworks used in your project
3. Choose indentation style
4. Choose naming convention
5. Config file created with 10-30+ rules

### Config Structure

```json
{
  "projectName": "my-project",
  "framework": ["WordPress", "React"],
  "version": "1.0.0",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "rules": [
    {
      "id": "wp-sanitize-input",
      "category": "security",
      "rule": "Always sanitize user input using WordPress sanitization functions",
      "severity": "error",
      "examples": {
        "good": ["$value = sanitize_text_field($_POST['field']);"],
        "bad": ["$value = $_POST['field'];"]
      }
    }
  ],
  "customPatterns": {
    "fileNaming": [],
    "functionNaming": [],
    "classNaming": []
  }
}
```

---

## 5. Update Guardrails 🔄

**Command:** `PPACK: Core: Update Guardrails`

View and manage existing project guardrails.

### Features

- Loads existing `.pcw-guardrails.json`
- Displays formatted rules by category:
  - 🔒 Security
  - 🏗️ Architecture
  - ✨ Style
  - ⚡ Performance
  - 📝 Naming
- Shows examples for each rule
- Edit JSON file directly for custom rules

### Usage

1. Run `PPACK: Core: Update Guardrails`
2. View current rules in output channel
3. Edit `.pcw-guardrails.json` to modify rules

---

## 6. Secret Scanner 🔐

**Command:** `PPACK: Core: Secret Scanner`

Scans your codebase for hardcoded secrets before they leak into version control.

### Detects 20+ Secret Types

#### Cloud Providers

- AWS Access Keys (AKIA...)
- AWS Secret Keys
- Google API Keys (AIza...)
- Google OAuth Client IDs

#### Payment Processors

- Stripe Live Keys (sk*live*...)
- Stripe Restricted Keys (rk*live*...)

#### Development Tools

- GitHub Personal Access Tokens (ghp\_...)
- GitHub OAuth Tokens (gho\_...)
- Slack Tokens (xox...)
- Slack Webhooks

#### Databases

- MongoDB connection strings with credentials
- MySQL/PostgreSQL connection strings
- Database passwords

#### Authentication

- JWT Tokens
- OAuth Client Secrets
- Private Keys (RSA, EC, OpenSSH)

#### Communication Services

- Twilio Account SIDs
- SendGrid API Keys

#### WordPress

- Database passwords in wp-config.php
- Default salt keys

#### Generic Patterns

- Generic API keys (api_key=...)
- Generic secret keys (secret_key=...)
- Hardcoded passwords

### Features

- Recursive workspace scanning
- Intelligent false positive filtering
- Excludes: node_modules, .git, dist, build, vendor
- Severity classification (high/medium/low)
- Secret obfuscation in output (shows first/last 4 chars)
- Context lines around matches

### Usage

1. Run `PPACK: Core: Secret Scanner`
2. Wait for scan to complete
3. Review findings in output channel
4. Remove secrets before committing!

### Output Example

```
═══════════════════════════════════════════════════════
       PCW TOOLBELT - SECRET SCANNER RESULTS
═══════════════════════════════════════════════════════

📊 Scan Summary:
   Total Files: 250
   Scanned: 180
   Secrets Found: 3
   Scanned At: 2025-01-01T12:00:00.000Z

🔴 HIGH SEVERITY (2):

1. Stripe API Key
   File: src/payment/stripe.ts:15:30
   Match: sk_l**********************abcd
   Description: Stripe live API key detected

2. AWS Access Key ID
   File: src/aws/config.ts:8:25
   Match: AKIA****************1234
   Description: AWS Access Key ID detected

💡 TIP: Use environment variables or a secrets manager instead.
```

---

## 7. Dependency Health Check 💊

**Command:** `PPACK: Core: Dependency Health Check`

Audits npm and composer dependencies for vulnerabilities, outdated packages, and deprecated libraries.

### Supports

- **npm** (package.json)
- **Composer** (composer.json)

### Checks For

1. **Vulnerabilities**: Security issues in dependencies
2. **Outdated Packages**: Available updates
3. **Deprecated Packages**: No longer maintained libraries
4. **Version Gaps**: Major, minor, patch differences

### Features

- Automatic project type detection
- Integrates with `npm audit` and `composer audit`
- Checks `npm outdated` and `composer outdated`
- Known deprecated package database
- Severity classification
- Update recommendations

### Usage

1. Run `PPACK: Core: Dependency Health Check`
2. Wait for analysis
3. Review report in output channel
4. Update dependencies as needed

### Output Example

```
═══════════════════════════════════════════════════════
       PCW TOOLBELT - DEPENDENCY HEALTH CHECK
═══════════════════════════════════════════════════════

📦 Project Type: npm
📊 Total Dependencies: 45
⚠️  Issues Found: 5
📅 Scanned: 2025-01-01T12:00:00.000Z

🔴 VULNERABILITIES (2):

1. lodash
   Current: 4.17.15
   Latest: 4.17.21
   High severity vulnerability: Prototype Pollution

2. axios
   Current: 0.21.0
   Latest: 1.6.0
   Medium severity vulnerability: SSRF

🟡 DEPRECATED PACKAGES (1):

1. request
   Current: 2.88.0
   Package is deprecated and no longer maintained

🟢 OUTDATED PACKAGES (2):

1. react
   Current: 17.0.2
   Latest: 18.2.0
   Outdated: 17.0.2 → 18.2.0

💡 TIP: Run `npm update` or `composer update` to update dependencies.
```

---

## 8. Scaffold Blueprint 🏗️

**Command:** `PPACK: Core: Scaffold Blueprint`

Rapidly scaffold complete project structures from JSON templates.

### Features

- JSON-based blueprint definitions
- Variable substitution (`{{VAR}}` syntax)
- Interactive prompts for variable values
- Built-in variables: `PROJECT_NAME`, `TIMESTAMP`, `AUTHOR`
- Folder and file creation
- Validation (won't overwrite existing files)
- Caching for performance

### Built-in Blueprints

#### Agency Website Blueprint

Creates a professional WordPress agency website structure:

- Custom theme with 13 folders
- 12 files (style.css, functions.php, templates, etc.)
- Custom post types (Projects, Services)
- Custom widget foundation
- Functionality plugin scaffold

### Usage

1. Run `PPACK: Core: Scaffold Blueprint`
2. Select a blueprint from the list
3. Enter variable values when prompted:
   - Theme name
   - Text domain
   - Author name
4. Files and folders created instantly!

### Creating Custom Blueprints

Create JSON files in `src/blueprints/definitions/`:

```json
{
  "id": "my-blueprint",
  "name": "My Custom Blueprint",
  "description": "Creates a custom project structure",
  "version": "1.0.0",
  "author": "Your Name",
  "variables": [
    {
      "name": "PROJECT_NAME",
      "description": "Project name",
      "default": "my-project"
    }
  ],
  "folders": [
    {
      "path": "src/{{PROJECT_NAME}}"
    }
  ],
  "files": [
    {
      "path": "src/{{PROJECT_NAME}}/index.ts",
      "content": "// {{PROJECT_NAME}} - Built on {{TIMESTAMP}}\n"
    }
  ]
}
```

See [ADVANCED-MODULES.md](./ADVANCED-MODULES.md) for full documentation.

---

## 9. Audit Plugin Redundancy 🔍

**Command:** `PPACK: Core: Audit Plugin Redundancy`

Detects WordPress plugin bloat and category conflicts.

### Features

- Automatic plugin scanning (wp-content/plugins)
- 20 predefined categories
- 100+ known plugin patterns
- Severity classification (high/medium/low)
- Smart pattern matching (exact, partial, wildcard)
- Detailed recommendations

### 20 Plugin Categories

1. **SEO**: Yoast, Rank Math, AIOSEO (max: 1)
2. **Caching**: WP Rocket, W3 Total Cache (max: 1)
3. **Security**: Wordfence, iThemes Security (max: 1)
4. **Backup**: UpdraftPlus, BackupBuddy (max: 1)
5. **Contact Forms**: CF7, WPForms, Gravity Forms (max: 1)
6. **Page Builders**: Elementor, Beaver Builder, Divi (max: 1)
7. **Image Optimization**: Smush, Imagify, ShortPixel (max: 1)
8. **Slider**: Smart Slider, Revolution Slider (max: 1)
9. **Analytics**: MonsterInsights, ExactMetrics (max: 1)
10. **Social Sharing**: Social Warfare, AddToAny (max: 1)
11. **Membership**: MemberPress, Restrict Content Pro (max: 1)
12. **Email Marketing**: Mailchimp, Newsletter (max: 1)
13. **Popup**: Popup Maker, OptinMonster (max: 1)
14. **Migration**: Duplicator, All-in-One WP Migration (max: 1)
15. **Database Optimization**: WP-Optimize, WP-Sweep (max: 1)
16. **Redirection**: Redirection, Simple 301 Redirects (max: 1)
17. **Lazy Loading**: Lazy Load, a3 Lazy Load (max: 1)
18. **Related Posts**: YARPP, Related Posts (max: 1)
19. **Maintenance Mode**: Coming Soon, WP Maintenance Mode (max: 1)
20. **Cookie Consent**: Cookie Notice, Complianz (max: 1)

### Usage

1. Open a WordPress project
2. Run `PPACK: Core: Audit Plugin Redundancy`
3. View results in side panel or output channel
4. Review recommendations
5. Deactivate/remove redundant plugins

See [ADVANCED-MODULES.md](./ADVANCED-MODULES.md) for full documentation.

---

## 10. Reload Rules 🔄

**Command:** `PPACK: Core: Reload Rules`

Hot-reload audit rules without restarting VS Code.

### Features

- Clears rule cache
- Reloads JSON rule files
- Instant updates without restart
- Useful when adding/modifying custom rules

### Usage

1. Edit rule files in `src/rules/`
2. Run `PPACK: Core: Reload Rules`
3. Rules updated instantly!

### Rule Files

- `elementor-rules.json` - 15 rules
- `wordpress-rules.json` - 15 rules
- `react-rules.json` - 15 rules
- `woocommerce-rules.json` - 18 rules

---

## Command Quick Reference

| #   | Command                                | Description                                 |
| --- | -------------------------------------- | ------------------------------------------- |
| 1   | `PPACK: Core: Generate Context Map`    | Creates Agent.md with project structure     |
| 2   | `PPACK: Core: Audit File`              | Context-aware file audit with dynamic rules |
| 3   | `PPACK: Core: Audit Workspace`         | Workspace-wide audit                        |
| 4   | `PPACK: Core: Set Project Guardrails`  | Interactive coding standards setup          |
| 5   | `PPACK: Core: Update Guardrails`       | View/edit project rules                     |
| 6   | `PPACK: Core: Secret Scanner`          | Find 20+ types of hardcoded secrets         |
| 7   | `PPACK: Core: Dependency Health Check` | Audit npm/composer packages                 |
| 8   | `PPACK: Core: Scaffold Blueprint`      | Rapid project scaffolding                   |
| 9   | `PPACK: Core: Audit Plugin Redundancy` | Detect WordPress plugin conflicts           |
| 10  | `PPACK: Core: Reload Rules`            | Hot-reload audit rules                      |

---

## File Structure

```
src/
├── packs/
│   └── core/
│       ├── index.ts              # Core pack activation
│       ├── contextMap.ts         # Context map generator
│       ├── guardrails.ts         # Guardrails manager
│       ├── secretScanner.ts      # Secret scanner
│       ├── redundancy.ts         # Plugin redundancy auditor
│       └── dependencyHealth.ts   # Dependency health checker
├── core/
│   ├── auditor.ts               # Context-aware auditor
│   ├── ContextManager.ts        # Framework detection
│   ├── SidePanelProvider.ts     # WebView side panel
│   └── blueprints/
│       ├── BlueprintManager.ts  # Blueprint scaffolding
│       └── types.ts             # Blueprint types
├── rules/
│   ├── elementor-rules.json
│   ├── wordpress-rules.json
│   ├── react-rules.json
│   └── woocommerce-rules.json
└── blueprints/
    ├── definitions/
    │   └── agency-site.json
    └── redundancy-matrix.json
```

---

## Best Practices

### Guardrails

1. Set guardrails early in the project
2. Share `.pcw-guardrails.json` with your team via Git
3. Update rules as project conventions evolve
4. Use severity appropriately (error for security, warning for style)

### Secret Scanner

1. Run before every commit
2. Add to pre-commit Git hooks
3. Review all findings (false positives are rare)
4. Use environment variables for all secrets
5. Add `.env` to `.gitignore`

### Dependency Health

1. Run weekly or before releases
2. Prioritize security vulnerabilities
3. Test thoroughly after major version updates
4. Keep dependencies reasonably up-to-date
5. Consider deprecation warnings seriously

### Blueprints

1. Create blueprints for repeated project structures
2. Use descriptive variable names
3. Provide good default values
4. Document blueprint purpose and usage
5. Version your blueprints

### Plugin Redundancy

1. Run after installing new WordPress plugins
2. Review recommendations carefully
3. Some plugins (like Jetpack) serve multiple purposes
4. Check for feature overlap before removing
5. Backup before deactivating plugins

---

## Troubleshooting

### "No workspace folder open"

**Solution**: Open a folder in VS Code (`File > Open Folder`)

### Secret Scanner finds no issues but I have secrets

**Solution**: Check if your file types are supported. Secret Scanner scans `.js`, `.ts`, `.php`, `.py`, `.env`, and more.

### Dependency Health Check shows no results

**Solution**: Ensure you have `package.json` or `composer.json` in your workspace root. Install npm/composer CLI tools.

### Blueprint scaffolding fails

**Solution**: Check file paths in blueprint JSON. Ensure you have write permissions in the workspace.

### Plugin redundancy not detecting plugins

**Solution**: Ensure you're in a WordPress project with `wp-content/plugins` directory.

---

## Support

For issues, feature requests, or questions:

- Open an issue on GitHub
- Check existing documentation
- Review example blueprints and rule files

---

Built with ❤️ by PCW ToolBelt
