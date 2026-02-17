import * as vscode from "vscode";
import * as path from "path";

const DEFAULT_IGNORE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/out/**",
  "**/build/**",
];
const DEFAULT_GLOB =
  "**/*.{ts,tsx,js,jsx,php,html,css,scss,sass,md,txt,json,yaml,yml}";
const PLACEHOLDER_PATTERN = /(TODO|FIXME|PLACEHOLDER|LOREM|TBD|XXX|__TODO__)/i;

export async function findPlaceholders() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const [workspace] = workspaceFolders;
  const files = await vscode.workspace.findFiles(
    DEFAULT_GLOB,
    `{${DEFAULT_IGNORE.join(",")}}`,
    200
  );
  const matches: Array<{ file: string; line: number; text: string }> = [];

  for (const file of files) {
    try {
      const buffer = await vscode.workspace.fs.readFile(file);
      const content = Buffer.from(buffer).toString("utf8");
      const lines = content.split(/\r?\n/);

      lines.forEach((line, idx) => {
        if (PLACEHOLDER_PATTERN.test(line)) {
          matches.push({
            file: path.relative(workspace.uri.fsPath, file.fsPath),
            line: idx + 1,
            text: line.trim().slice(0, 200),
          });
        }
      });
    } catch (error) {
      console.warn(`Skipping file ${file.fsPath}: ${error}`);
    }
  }

  const output = vscode.window.createOutputChannel("PCW Placeholders");
  output.clear();
  output.appendLine("PCW ToolBelt – Placeholder Finder");
  output.appendLine("=".repeat(50));

  if (matches.length === 0) {
    output.appendLine("No placeholders detected.");
    output.show(true);
    vscode.window.showInformationMessage("No placeholders found in workspace.");
    return;
  }

  matches.forEach((match, idx) => {
    output.appendLine(`${idx + 1}. ${match.file}:${match.line}`);
    output.appendLine(`   ${match.text}`);
  });
  output.show(true);

  vscode.window.showWarningMessage(
    `Found ${matches.length} potential placeholders. See 'PCW Placeholders' output.`
  );
}
