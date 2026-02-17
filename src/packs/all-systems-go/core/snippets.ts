import * as vscode from "vscode";
import * as path from "path";

export async function writeSnippetToFile() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("Open a workspace to save snippets.");
    return;
  }

  const [workspace] = workspaceFolders;
  const selection = vscode.window.activeTextEditor?.document.getText(
    vscode.window.activeTextEditor.selection
  );

  const snippetContent =
    selection && selection.trim().length > 0
      ? selection
      : await vscode.window.showInputBox({
          prompt: "Enter the snippet content",
          placeHolder: "Paste code or notes here",
        });

  if (!snippetContent) {
    return;
  }

  const defaultFile = path.join("snippets", `snippet-${Date.now()}.txt`);
  const targetPathInput = await vscode.window.showInputBox({
    prompt: "Where should we save the snippet (relative to workspace)?",
    value: defaultFile,
  });

  if (!targetPathInput) {
    return;
  }

  const targetPath = path.isAbsolute(targetPathInput)
    ? targetPathInput
    : path.join(workspace.uri.fsPath, targetPathInput);

  try {
    const uri = vscode.Uri.file(targetPath);
    const dirUri = vscode.Uri.file(path.dirname(targetPath));

    await vscode.workspace.fs.createDirectory(dirUri);
    await vscode.workspace.fs.writeFile(
      uri,
      Buffer.from(snippetContent, "utf8")
    );

    vscode.window.showInformationMessage(
      `Snippet saved to ${path.relative(workspace.uri.fsPath, targetPath)}`
    );
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to save snippet: ${error}`);
  }
}
