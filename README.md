# 🚀 PCW ToolBelt

**PowerPacks for your dev workflow**

A modular VS Code extension with specialized tools for WordPress, Elementor, and WooCommerce development. Stop wasting time on repetitive setup—install the tools you need and get back to building.

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://github.com/PCWProps/pcw-toolbelt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🟢 All Systems Go PowerPack (Core - Always Included)

_Foundational tools for project sanity, context, and health_

1. **Generate Context Map** - Scans your file tree and creates an `Agent.md` for AI agents
2. **Context-Aware File Audit** - Detects framework and applies appropriate best practice rules
3. **Context-Aware Workspace Audit** - Audits entire workspace with dynamic rule loading
4. **Set Project Guardrails** - Interactive setup of coding standards (.pcw-guardrails.json)
5. **Update Guardrails** - View and manage project coding rules
6. **Secret Scanner** - Finds 20+ types of hardcoded secrets (API keys, passwords, tokens)
7. **Dependency Health Check** - Audits npm/composer packages for vulnerabilities and updates
8. **Scaffold Blueprint** - Rapid project scaffolding from JSON templates
9. **Audit Plugin Redundancy** - Detects conflicting WordPress plugins (20 categories)
10. **Reload Rules** - Hot-reload audit rules without restarting VS Code

### 🔵 WordPress PowerPack

_Standards, PHP compliance, and Theme structure_

- **Child Theme Scaffolder** - One-click generation of theme files
- **WPCS Compliance Runner** - Runs PHP Code Sniffer against WordPress standards
- _(More features coming soon)_

### 🌸 Elementor PowerPack

_The "Anti-Error" tools to stop "Files can't be used" errors_

- **Widget Pre-Flight Audit** ⭐ - Validates PHP against Elementor's `Widget_Base` requirements
  - Checks class extension
  - Validates required methods (`get_name()`, `render()`)
  - Detects inline CSS issues
  - Flags deprecated methods
- **Widget Boilerplate Generator** - Creates perfect widget class structure
- _(More features coming soon)_

### 🛒 WooCommerce PowerPack

_Security, template overrides, and data integrity_

- **Template Override Checker** - Finds outdated theme files
- **Custom Tab Generator** - Scaffolds My Account/Product tabs
- _(More features coming soon)_

### 📊 PowerPack Roadmap & Tiers

| Pack                      | Level      | Icon | Tool Name               | Description                                            |
| ------------------------- | ---------- | ---- | ----------------------- | ------------------------------------------------------ |
| Agency                    | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Agency                    | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Agency                    | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| AI                        | Core       | 🛣️   | Coming Soon             | New Features                                           |
| AI                        | Power      | 🛣️   | Coming Soon             | New Features                                           |
| AI                        | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| All Systems Go            | Core       | 🧠   | Generate Context Map    | Maps file structure for AI Context.                    |
| All Systems Go            | Core       | 🛡️   | Set Guardrails          | Defines rules for AI generation.                       |
| All Systems Go            | Core       | 🔄   | Update Guardrails       | Auto-updates rules based on code drift.                |
| All Systems Go            | Core       | 🔐   | Secret Scanner          | Finds API keys before you commit.                      |
| All Systems Go            | Core       | 🕵️   | Code Drift Detector     | Warns of naming convention violations.                 |
| All Systems Go            | Core       | 🧹   | Find Placeholders       | Locates TODO and dummy text.                           |
| All Systems Go            | Core       | 📝   | JSON Validator          | Strict syntax check for config files.                  |
| All Systems Go            | Core       | ✂️   | Snippets-to-File        | Saves code blocks to snippets instantly.               |
| All Systems Go            | Core       | 🔎   | Global Search/Replace   | Regex-powered multi-file edit.                         |
| All Systems Go            | Core       | 📦   | Dep. Health Check       | Scans package.json for deprecated libs.                |
| All Systems Go            | Power      | ⚙️   | Config Generator        | Creates config files from templates.                   |
| All Systems Go            | Power      | 📊   | Code Metrics            | Analyzes complexity, duplication, and maintainability. |
| All Systems Go            | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Astra                     | Core       | 🧩   | Header Injector         | Safely inject code into Astra Header.                  |
| Astra                     | Core       | 🎨   | Color Palette Sync      | PHP snippet to sync customizer colors.                 |
| Astra                     | Core       | ⚡   | Performance Audit       | Disables unused Astra modules.                         |
| Astra                     | Core       | 🎣   | Hook Visualizer         | Maps all Astra-specific hooks.                         |
| Astra                     | Core       | 🦶   | Footer Builder          | Scaffolds footer widget areas.                         |
| Astra                     | Core       | 📄   | Child Theme Gen         | Astra-specific child theme setup.                      |
| Astra                     | Core       | 🚫   | White Labeler           | Hides Astra branding in admin.                         |
| Astra                     | Core       | 📱   | Breakpoint Manager      | Adjusts mobile/tablet breakpoints.                     |
| Astra                     | Core       | 🖋️   | Font Self-Host          | Downloads Google Fonts locally.                        |
| Astra                     | Core       | 🔧   | Custom Layouts          | Registers 'Custom Layout' post types.                  |
| Astra                     | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Astra                     | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Cloudflare                | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Cloudflare                | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Cloudflare                | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Elementor                 | Core       | ✈️   | Widget Pre-Flight       | Audits code against Elementor API.                     |
| Elementor                 | Core       | 📄   | Widget Boilerplate      | Generates valid Widget classes.                        |
| Elementor                 | Core       | 🔁   | Control Repeater Gen    | Scaffolds complex repeater arrays.                     |
| Elementor                 | Core       | ✅   | Site Kit Validator      | Checks JSON schema before import.                      |
| Elementor                 | Core       | 💀   | Dynamic Tag Skeleton    | Boilerplate for Custom Tags.                           |
| Elementor                 | Core       | 🎨   | Inline CSS Extractor    | Moves styles to controls.                              |
| Elementor                 | Core       | 🖼️   | Widget Icon Register    | Enqueues custom editor icons.                          |
| Elementor                 | Core       | ⚠️   | Deprecation Scanner     | Finds old methods like \_content_template.             |
| Elementor                 | Core       | 📜   | Editor Script Enqueue   | Loads JS only in Editor.                               |
| Elementor                 | Core       | 🗂️   | Custom Cat Register     | Adds custom category to panel.                         |
| Elementor                 | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Elementor                 | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| GitHub                    | Core       | 🛣️   | Coming Soon             | New Features                                           |
| GitHub                    | Power      | 🛣️   | Coming Soon             | New Features                                           |
| GitHub                    | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Google Workspace          | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Google Workspace          | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Google Workspace          | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Jetpack                   | Core       | 🚀   | Boost Config            | Optimizes Critical CSS generation.                     |
| Jetpack                   | Core       | 🔎   | Search Config           | Customize Jetpack Search filters.                      |
| Jetpack                   | Core       | 🛡️   | Security Audit          | Checks Brute Force protection status.                  |
| Jetpack                   | Core       | 🖼️   | CDN Enabler             | Ensures Image CDN is active.                           |
| Jetpack                   | Core       | 📊   | Stats Widget            | View site stats in VS Code.                            |
| Jetpack                   | Core       | 📱   | Social Auto-Share       | Configures Publicize settings.                         |
| Jetpack                   | Core       | 💾   | Backup Status           | Verifies VaultPress backups.                           |
| Jetpack                   | Core       | 📝   | CRM Contact Sync        | Syncs forms to CRM.                                    |
| Jetpack                   | Core       | ⚡   | Module Manager          | Disables unused Jetpack modules.                       |
| Jetpack                   | Core       | 🔧   | Dev Mode Toggle         | Safely enable Dev Mode for local.                      |
| Jetpack                   | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Jetpack                   | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Mac Automations           | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Mac Automations           | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Mac Automations           | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Shopify                   | Core       | 🎨   | Theme Check             | Runs Shopify Theme Linter.                             |
| Shopify                   | Core       | 🛍️   | Liquid Scaffold         | Generates common Liquid sections.                      |
| Shopify                   | Core       | 🔄   | Sync Theme              | Watches for changes & pushes to store.                 |
| Shopify                   | Core       | 📦   | Metafield Manager       | Defines metafield definitions.                         |
| Shopify                   | Core       | 🛒   | Cart Script Gen         | Scaffolds Shopify Scripts (Plus).                      |
| Shopify                   | Core       | 📱   | Responsive Test         | Previews section on mobile view.                       |
| Shopify                   | Core       | ⚡   | App Embed Block         | Creates app block structure.                           |
| Shopify                   | Core       | 🔍   | SEO Audit               | Checks product/collection SEO tags.                    |
| Shopify                   | Core       | 📝   | Schema Validator        | Validates settings_schema.json.                        |
| Shopify                   | Core       | 🚀   | Deploy to Live          | Safe deployment                                        |
| Shopify                   | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Shopify                   | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Tailwind                  | Core       | 🎨   | Config Generator        | Creates optimized tailwind.config.js.                  |
| Tailwind                  | Core       | 📦   | Class Sorter            | Sorts classes automatically.                           |
| Tailwind                  | Core       | 📱   | Responsive Preview      | Test breakpoints in sidebar.                           |
| Tailwind                  | Core       | 🔧   | Conflict Killer         | Prefixes classes to avoid WP clashes.                  |
| Tailwind                  | Core       | 📝   | Custom Base Styles      | Scaffolds @layer base css.                             |
| Tailwind                  | Core       | 🧩   | Component Extractor     | Converts HTML to @apply components.                    |
| Tailwind                  | Core       | 🌈   | Palette Sync            | Syncs Tailwind colors to WP Theme.json.                |
| Tailwind                  | Core       | ⚡   | JIT Mode Check          | Ensures Just-In-Time compiler is on.                   |
| Tailwind                  | Core       | 🔍   | Unused CSS Purge        | Audit content paths for purging.                       |
| Tailwind                  | Core       | 🔡   | Prose Config            | Sets up @tailwindcss/typography.                       |
| Tailwind                  | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Tailwind                  | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| TD SYNNEX                 | Core       | 🛣️   | Coming Soon             | New Features                                           |
| TD SYNNEX                 | Power      | 🛣️   | Coming Soon             | New Features                                           |
| TD SYNNEX                 | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| WooCommerce               | Core       | ⚡   | Template Override Check | Finds outdated theme files.                            |
| WooCommerce               | Core       | 📑   | Custom Tab Gen          | Adds tabs to My Account/Product.                       |
| WooCommerce               | Core       | 📝   | Checkout Field Editor   | Generates field removal logic.                         |
| WooCommerce               | Core       | 💳   | Gateway Skeleton        | Class structure for payments.                          |
| WooCommerce               | Core       | 🕷️   | Order Meta Debugger     | Reveals hidden order meta.                             |
| WooCommerce               | Core       | 👁️   | Hook Visualizer         | Shows visual hook locations.                           |
| WooCommerce               | Core       | 💲   | Price Format Helper     | Strict currency formatting.                            |
| WooCommerce               | Core       | 🔗   | Endpoint Generator      | Creates custom URL endpoints.                          |
| WooCommerce               | Core       | 📥   | Product Data Import     | Validates CSV headers.                                 |
| WooCommerce               | Core       | 📧   | Email Previewer         | Renders transactional emails.                          |
| WooCommerce               | Power      | 🛣️   | Coming Soon             | New Features                                           |
| WooCommerce               | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Ingram Micro              | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Ingram Micro              | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Ingram Micro              | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Pressable                 | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Pressable                 | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Pressable                 | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| QuickBooks Online         | Core       | 🛣️   | Coming Soon             | New Features                                           |
| QuickBooks Online         | Power      | 🛣️   | Coming Soon             | New Features                                           |
| QuickBooks Online         | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Salesforce CRM            | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Salesforce CRM            | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Salesforce CRM            | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Jetpack CRM               | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Jetpack CRM               | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Jetpack CRM               | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| MailPoet                  | Core       | 🛣️   | Coming Soon             | New Features                                           |
| MailPoet                  | Power      | 🛣️   | Coming Soon             | New Features                                           |
| MailPoet                  | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| WordPress                 | Core       | 🏗️   | Child Theme Scaffold    | Generates functions.php & style.css.                   |
| WordPress                 | Core       | ⚖️   | WPCS Compliance         | Runs PHPCS against WP Standards.                       |
| WordPress                 | Core       | 🏷️   | Plugin Header Gen       | Creates standard plugin comments.                      |
| WordPress                 | Core       | 🎣   | Hook Mapper             | Maps all custom hooks in theme.                        |
| WordPress                 | Core       | 🐛   | Debug Log Viewer        | Live tail of debug.log in VS Code.                     |
| WordPress                 | Core       | 🔑   | Salt Generator          | Generates secure wp-config keys.                       |
| WordPress                 | Core       | 🗄️   | DB Prefix Changer       | SQL queries to rename tables.                          |
| WordPress                 | Core       | 👮   | Capability Checker      | Audits current_user_can() usage.                       |
| WordPress                 | Core       | 🌐   | Local Env Switcher      | Toggles URLs for local/staging.                        |
| WordPress                 | Core       | 🧼   | Sanitize Audit          | Flags unsanitized inputs.                              |
| WordPress                 | Power      | 🛣️   | Coming Soon             | New Features                                           |
| WordPress                 | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Network             | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Network             | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Network             | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Site Manager        | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Site Manager        | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Site Manager        | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Identity Enterprise | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Identity Enterprise | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Identity Enterprise | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Protect             | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Protect             | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Unifi Protect             | SuperPower | 🛣️   | Coming Soon             | New Features                                           |
| Google Cloud              | Core       | 🛣️   | Coming Soon             | New Features                                           |
| Google Cloud              | Power      | 🛣️   | Coming Soon             | New Features                                           |
| Google Cloud              | SuperPower | 🛣️   | Coming Soon             | New Features                                           |

---

## 📦 Installation

### Prerequisites

- VS Code version 1.80.0 or higher
- Node.js 18.x or higher (for development)
- TypeScript 5.2+ (for development)

### From Source

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PCWProps/pcw-toolbelt.git
   cd pcw-toolbelt
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Compile the extension:**

   ```bash
   npm run compile
   ```

4. **Run in VS Code:**
   - Press `F5` to open a new VS Code window with the extension loaded
   - Or run `npm run watch` to auto-compile on changes

---

## 🎯 Usage

### Quick Start

1. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
2. Type `PCW:` to see all available commands
3. Select the tool you need

### Example: Audit an Elementor Widget

1. Open a PHP file containing an Elementor widget
2. Run: `PCW: Audit Elementor Widget (Pre-Flight)`
3. Review the output for any structural issues

**Sample Output:**

```
✓ Class Structure Validated
✓ Namespaces Checked
⚠️ Missing method: public function get_icon()
✓ No Inline CSS Detected
```

### Example: Generate Context Map

1. Open your project workspace
2. Run: `PCW: Generate Context Map`
3. An `Agent.md` file will be created with your project structure

---

## 🏗️ Architecture

The extension uses a **modular PowerPack system**:

```
src/
├── extension.ts          # Main entry point
└── packs/
   ├── all-systems-go/   # "All Systems Go" Pack (always loaded)
    │   ├── index.ts      # Command registration
    │   └── contextMap.ts # Context Map logic
    ├── wordpress/        # WordPress Pack
    │   └── index.ts
    ├── elementor/        # Elementor Pack
    │   ├── index.ts
    │   └── auditor.ts    # Pre-Flight Audit logic
    └── woocommerce/      # WooCommerce Pack
        └── index.ts
```

Each PowerPack is self-contained and registers its own commands during activation.

---

## 🛠️ Development

### Project Structure

- `/src` - TypeScript source files
- `/out` - Compiled JavaScript (generated)
- `package.json` - Extension manifest and dependencies
- `tsconfig.json` - TypeScript configuration

### Available Scripts

```bash
npm run compile       # Compile TypeScript to JavaScript
npm run watch         # Watch mode for development
npm run lint          # Run ESLint
npm run test          # Run tests (coming soon)
```

### Adding a New Command

1. **Define the command in `package.json`:**

   ```json
   {
     "command": "pcw.yourpack.yourCommand",
     "title": "PCW: Your Command Title",
     "category": "YourPack"
   }
   ```

2. **Register in the PowerPack's `index.ts`:**
   ```typescript
   const yourCmd = vscode.commands.registerCommand(
     "pcw.yourpack.yourCommand",
     () => {
       vscode.window.showInformationMessage("Hello!");
     }
   );
   context.subscriptions.push(yourCmd);
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Inspired by the WordPress, Elementor, and WooCommerce communities

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/PCWProps/pcw-toolbelt/issues)
- **Discussions:** [GitHub Discussions](https://github.com/PCWProps/pcw-toolbelt/discussions)
- **Website:** [PCW Props](https://pcwprops.com)

---

**Load up your ToolBelt. Ship faster.** ⚡
