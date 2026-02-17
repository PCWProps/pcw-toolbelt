import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);

/**
 * Detects code drift by checking the working tree status.
 * Quick heuristic: counts modified/untracked files and surfaces a summary.
 */
export async function detectCodeDrift() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    const { stdout } = await execAsync("git status --porcelain", { cwd });
    const lines = stdout
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    const modified = lines.filter((line) => line.startsWith(" M"));
    const added = lines.filter(
      (line) => line.startsWith("A ") || line.startsWith("??")
    );
    const deleted = lines.filter(
      (line) => line.startsWith(" D") || line.startsWith("D ")
    );

    const summary = `Changes detected: ${lines.length} file(s)
• Modified: ${modified.length}
• Added/Untracked: ${added.length}
• Deleted: ${deleted.length}`;

    const output = vscode.window.createOutputChannel("PCW Code Drift");
    output.clear();
    output.appendLine("PCW ToolBelt – Code Drift Detector");
    output.appendLine("=".repeat(50));
    output.appendLine(summary);
    if (lines.length > 0) {
      output.appendLine("\nDetails:");
      lines.forEach((line) => output.appendLine(line));
    }
    output.show(true);

    vscode.window.showInformationMessage(
      lines.length === 0
        ? "No code drift detected. Working tree is clean."
        : `Detected ${lines.length} drifted file(s). See 'PCW Code Drift' output.`
    );
  } catch (error) {
    // If git is unavailable, fall back to a gentle notice.
    vscode.window.showWarningMessage(
      `Code Drift Detector: Unable to run git status in ${path.basename(
        cwd
      )}. ${error}`
    );
  }
}
