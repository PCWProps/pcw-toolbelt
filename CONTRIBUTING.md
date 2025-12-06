# Contributing to PCW ToolBelt

Thank you for your interest in contributing to PCW ToolBelt! 🎉

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pcw-toolbelt.git
   cd pcw-toolbelt
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Test your changes in the new VS Code window

### Watch Mode

For continuous compilation during development:
```bash
npm run watch
```

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Run ESLint before committing:
  ```bash
  npm run lint
  ```

## Adding a New PowerPack

1. **Create a new folder** in `src/packs/your-pack-name/`
2. **Create `index.ts`** with the activation function:
   ```typescript
   import * as vscode from 'vscode';

   export function activate(context: vscode.ExtensionContext) {
       console.log('Your PowerPack: Loading...');
       
       // Register commands here
       
       console.log('Your PowerPack: Activated ✓');
   }
   ```
3. **Import and activate** in `src/extension.ts`
4. **Add commands** to `package.json` under `contributes.commands`
5. **Add activation events** to `package.json` under `activationEvents`

## Adding a New Command

1. **Define in `package.json`:**
   ```json
   {
     "command": "pcw.pack.commandName",
     "title": "PCW: Command Title",
     "category": "PackName"
   }
   ```

2. **Register in your PowerPack:**
   ```typescript
   const myCommand = vscode.commands.registerCommand(
       'pcw.pack.commandName',
       async () => {
           // Your logic here
       }
   );
   context.subscriptions.push(myCommand);
   ```

3. **Add activation event:**
   ```json
   "activationEvents": [
       "onCommand:pcw.pack.commandName"
   ]
   ```

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add Widget Boilerplate Generator`
- `fix: Correct namespace detection in auditor`
- `docs: Update README with new command`
- `refactor: Simplify context map generation`

## Pull Request Process

1. **Update documentation** if you've added features
2. **Test thoroughly** in a clean VS Code instance
3. **Push your branch** to your fork
4. **Open a Pull Request** against the `main` branch
5. **Describe your changes** clearly in the PR description

## Questions?

- Open an [issue](https://github.com/PCWProps/pcw-toolbelt/issues)
- Start a [discussion](https://github.com/PCWProps/pcw-toolbelt/discussions)

Thank you for contributing! 🚀
