# 🚀 PCW ToolBelt

**PowerPacks for your dev workflow**

A modular VS Code extension with specialized tools for WordPress, Elementor, and WooCommerce development. Stop wasting time on repetitive setup—install the tools you need and get back to building.

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://github.com/PCWProps/pcw-toolbelt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🟢 All Systems Go PowerPack (Core - Always Included)
*Foundational tools for project sanity, context, and health*

- **Generate Context Map** - Scans your file tree and creates an `Agent.md` for AI agents
- **Set Project Guardrails** - Defines coding rules for AI generation
- **Update Guardrails** - Auto-scans code for drift and updates rules
- **Secret Scanner** - Finds hardcoded API keys before you commit

### 🔵 WordPress PowerPack
*Standards, PHP compliance, and Theme structure*

- **Child Theme Scaffolder** - One-click generation of theme files
- **WPCS Compliance Runner** - Runs PHP Code Sniffer against WordPress standards
- *(More features coming soon)*

### 🌸 Elementor PowerPack
*The "Anti-Error" tools to stop "Files can't be used" errors*

- **Widget Pre-Flight Audit** ⭐ - Validates PHP against Elementor's `Widget_Base` requirements
  - Checks class extension
  - Validates required methods (`get_name()`, `render()`)
  - Detects inline CSS issues
  - Flags deprecated methods
- **Widget Boilerplate Generator** - Creates perfect widget class structure
- *(More features coming soon)*

### 🛒 WooCommerce PowerPack
*Security, template overrides, and data integrity*

- **Template Override Checker** - Finds outdated theme files
- **Custom Tab Generator** - Scaffolds My Account/Product tabs
- *(More features coming soon)*

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
    ├── core/             # "All Systems Go" Pack (always loaded)
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
       'pcw.yourpack.yourCommand',
       () => {
           vscode.window.showInformationMessage('Hello!');
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
