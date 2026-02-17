import * as vscode from "vscode";
import * as path from "path";

export async function validateJson() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Open a JSON file to validate.");
    return;
  }

  const document = editor.document;
  const ext = path.extname(document.fileName).toLowerCase();

  if (document.languageId !== "json" && ext !== ".json") {
    const proceed = await vscode.window.showQuickPick(
      ["Yes, validate as JSON", "Cancel"],
      {
        placeHolder: "The active file is not JSON. Validate anyway?",
      }
    );

    if (proceed !== "Yes, validate as JSON") {
      return;
    }
  }

  try {
    JSON.parse(document.getText());
    vscode.window.showInformationMessage("JSON looks valid ✔️");
  } catch (error: any) {
    vscode.window.showErrorMessage(`Invalid JSON: ${error?.message || error}`);
  }
}
