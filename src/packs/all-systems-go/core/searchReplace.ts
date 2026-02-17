import * as vscode from "vscode";
import * as path from "path";

export async function globalSearchReplace() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("Open a workspace to run search/replace.");
    return;
  }

  const searchFor = await vscode.window.showInputBox({
    prompt: "Find text",
    validateInput: (value) => (value ? undefined : "Enter text to find"),
  });

  if (!searchFor) {
    return;
  }

  const replaceWith = await vscode.window.showInputBox({
    prompt: "Replace with",
    value: "",
  });

  if (replaceWith === undefined) {
    return;
  }

  const [workspace] = workspaceFolders;
  const files = await vscode.workspace.findFiles(
    "**/*",
    "{**/node_modules/**,**/.git/**,**/dist/**,**/out/**}",
    200
  );
  let replacements = 0;
  let touchedFiles = 0;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Global Search/Replace",
      cancellable: false,
    },
    async () => {
      for (const file of files) {
        try {
          const buffer = await vscode.workspace.fs.readFile(file);
          const content = Buffer.from(buffer).toString("utf8");

          if (!content.includes(searchFor)) {
            continue;
          }

          const updated = content.split(searchFor).join(replaceWith);
          if (updated !== content) {
            await vscode.workspace.fs.writeFile(
              file,
              Buffer.from(updated, "utf8")
            );
            replacements += (content.match(new RegExp(searchFor, "g")) || [])
              .length;
            touchedFiles += 1;
          }
        } catch (error) {
          console.warn(`Skipped ${file.fsPath}: ${error}`);
        }
      }
    }
  );

  const message =
    replacements === 0
      ? "No matches found."
      : `Replaced ${replacements} occurrence(s) across ${touchedFiles} file(s).`;

  const output = vscode.window.createOutputChannel("PCW Search/Replace");
  output.clear();
  output.appendLine("PCW ToolBelt – Global Search/Replace");
  output.appendLine("=".repeat(50));
  output.appendLine(`Find: ${searchFor}`);
  output.appendLine(`Replace: ${replaceWith}`);
  output.appendLine(message);
  output.show(true);

  vscode.window.showInformationMessage(message);
}
