import * as vscode from "vscode";

export interface CommandSpec {
  id: string;
  title: string;
  handler: (...args: any[]) => unknown;
}

export type CoreToolKey =
  | "generateContextMap"
  | "setGuardrails"
  | "updateGuardrails"
  | "scanSecrets"
  | "codeDrift"
  | "findPlaceholders"
  | "jsonValidator"
  | "snippetsToFile"
  | "searchReplace"
  | "dependencyHealth";

const coreToolTemplates: Array<{
  key: CoreToolKey;
  title: string;
}> = [
  { key: "generateContextMap", title: "Generate Context Map" },
  { key: "setGuardrails", title: "Set Guardrails" },
  { key: "updateGuardrails", title: "Update Guardrails" },
  { key: "scanSecrets", title: "Secret Scanner" },
  { key: "codeDrift", title: "Code Drift Detector" },
  { key: "findPlaceholders", title: "Find Placeholders" },
  { key: "jsonValidator", title: "JSON Validator" },
  { key: "snippetsToFile", title: "Snippets-to-File" },
  { key: "searchReplace", title: "Global Search/Replace" },
  { key: "dependencyHealth", title: "Dependency Health Check" },
];

export function placeholderHandler(message: string) {
  return () => vscode.window.showInformationMessage(message);
}

export function registerPackCommands(
  context: vscode.ExtensionContext,
  specs: CommandSpec[]
) {
  specs.forEach((spec) => {
    const disposable = vscode.commands.registerCommand(spec.id, spec.handler);
    context.subscriptions.push(disposable);
  });
}

export function standardCoreCommandSpecs(
  packId: string,
  packLabel: string,
  overrides?: Partial<Record<CoreToolKey, (...args: any[]) => unknown>>
): CommandSpec[] {
  return coreToolTemplates.map((template) => {
    const fallback = placeholderHandler(
      `${packLabel} [Core]: ${template.title} – Coming soon.`
    );
    const handler: (...args: any[]) => unknown =
      overrides?.[template.key] ?? fallback;

    return {
      id: `pcw.${packId}.${template.key}`,
      title: `PPACK: ${packLabel} [Core]: ${template.title}`,
      handler,
    };
  });
}

export function powerPlaceholderSpec(
  packId: string,
  packLabel: string
): CommandSpec {
  return {
    id: `pcw.${packId}.power.features`,
    title: `PPACK: ${packLabel} [Power]: Power Pack Features (Coming Soon)`,
    handler: placeholderHandler(`${packLabel} [Power]: Coming soon.`),
  };
}

export function superpowerPlaceholderSpec(
  packId: string,
  packLabel: string
): CommandSpec {
  return {
    id: `pcw.${packId}.superpower.features`,
    title: `PPACK: ${packLabel} [SuperPower]: SuperPower Features (Coming Soon)`,
    handler: placeholderHandler(`${packLabel} [SuperPower]: Coming soon.`),
  };
}
