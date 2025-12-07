/**
 * RedundancyAuditor - Detect plugin bloat and category conflicts
 * Identifies when multiple plugins serve the same purpose
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface Plugin {
  name: string;
  slug: string;
  version?: string;
  active: boolean;
  path: string;
}

export interface PluginCategory {
  name: string;
  description: string;
  plugins: string[];
  maxRecommended: number;
}

export interface RedundancyMatrix {
  categories: PluginCategory[];
  lastUpdated: string;
}

export interface RedundancyWarning {
  category: string;
  plugins: Plugin[];
  severity: "high" | "medium" | "low";
  message: string;
  recommendation: string;
}

export interface RedundancyReport {
  totalPlugins: number;
  activePlugins: number;
  warnings: RedundancyWarning[];
  timestamp: Date;
}

export class RedundancyAuditor {
  private static instance: RedundancyAuditor;
  private matrix: RedundancyMatrix | null = null;

  private constructor() {}

  public static getInstance(): RedundancyAuditor {
    if (!RedundancyAuditor.instance) {
      RedundancyAuditor.instance = new RedundancyAuditor();
    }
    return RedundancyAuditor.instance;
  }

  /**
   * Load the redundancy matrix
   */
  public async loadMatrix(): Promise<RedundancyMatrix | null> {
    if (this.matrix) {
      return this.matrix;
    }

    try {
      const extensionPath = vscode.extensions.getExtension(
        "pcwprops.pcw-toolbelt"
      )?.extensionPath;
      if (!extensionPath) {
        throw new Error("Extension path not found");
      }

      const matrixPath = path.join(
        extensionPath,
        "src",
        "blueprints",
        "redundancy-matrix.json"
      );

      if (!fs.existsSync(matrixPath)) {
        vscode.window.showWarningMessage("Redundancy matrix not found");
        return null;
      }

      const content = fs.readFileSync(matrixPath, "utf-8");
      this.matrix = JSON.parse(content);

      return this.matrix;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error loading redundancy matrix: ${error}`
      );
      return null;
    }
  }

  /**
   * Scan for installed plugins in workspace
   */
  public async scanPlugins(workspacePath: string): Promise<Plugin[]> {
    const plugins: Plugin[] = [];
    const pluginsPath = path.join(workspacePath, "wp-content", "plugins");

    if (!fs.existsSync(pluginsPath)) {
      vscode.window.showWarningMessage(
        "wp-content/plugins directory not found. Make sure you are in a WordPress project."
      );
      return [];
    }

    try {
      const entries = fs.readdirSync(pluginsPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(pluginsPath, entry.name);
          const plugin = this.parsePlugin(entry.name, pluginPath);
          if (plugin) {
            plugins.push(plugin);
          }
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error scanning plugins: ${error}`);
    }

    return plugins;
  }

  /**
   * Parse plugin information from directory
   */
  private parsePlugin(slug: string, pluginPath: string): Plugin | null {
    try {
      // Look for main plugin file
      const files = fs.readdirSync(pluginPath);
      const phpFile = files.find((f) => f.endsWith(".php"));

      if (!phpFile) {
        return null;
      }

      const mainFilePath = path.join(pluginPath, phpFile);
      const content = fs.readFileSync(mainFilePath, "utf-8");

      // Extract plugin name from header
      const nameMatch = content.match(/Plugin Name:\s*(.+)/i);
      const versionMatch = content.match(/Version:\s*(.+)/i);

      const name = nameMatch ? nameMatch[1].trim() : slug;
      const version = versionMatch ? versionMatch[1].trim() : undefined;

      return {
        name,
        slug,
        version,
        active: true, // We'll assume active for now
        path: pluginPath,
      };
    } catch (error) {
      console.error(`Error parsing plugin ${slug}:`, error);
      return null;
    }
  }

  /**
   * Audit plugins for redundancy
   */
  public async auditPlugins(plugins: Plugin[]): Promise<RedundancyReport> {
    const matrix = await this.loadMatrix();
    const warnings: RedundancyWarning[] = [];

    if (!matrix) {
      return {
        totalPlugins: plugins.length,
        activePlugins: plugins.filter((p) => p.active).length,
        warnings: [],
        timestamp: new Date(),
      };
    }

    // Check each category
    for (const category of matrix.categories) {
      const matchedPlugins = plugins.filter((plugin) =>
        category.plugins.some(
          (pattern) =>
            this.matchesPattern(plugin.slug, pattern) ||
            this.matchesPattern(plugin.name, pattern)
        )
      );

      if (matchedPlugins.length > category.maxRecommended) {
        const severity = this.calculateSeverity(
          matchedPlugins.length,
          category.maxRecommended
        );

        warnings.push({
          category: category.name,
          plugins: matchedPlugins,
          severity,
          message: `Found ${matchedPlugins.length} ${category.name} plugins (recommended: ${category.maxRecommended})`,
          recommendation: this.getRecommendation(category, matchedPlugins),
        });
      }
    }

    return {
      totalPlugins: plugins.length,
      activePlugins: plugins.filter((p) => p.active).length,
      warnings,
      timestamp: new Date(),
    };
  }

  /**
   * Check if plugin matches pattern
   */
  private matchesPattern(text: string, pattern: string): boolean {
    const lowerText = text.toLowerCase();
    const lowerPattern = pattern.toLowerCase();

    // Support wildcards
    if (pattern.includes("*")) {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$", "i");
      return regex.test(text);
    }

    return lowerText.includes(lowerPattern);
  }

  /**
   * Calculate severity based on excess
   */
  private calculateSeverity(
    count: number,
    maxRecommended: number
  ): "high" | "medium" | "low" {
    const excess = count - maxRecommended;

    if (excess >= 3) {
      return "high";
    } else if (excess >= 2) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Generate recommendation for category
   */
  private getRecommendation(
    category: PluginCategory,
    plugins: Plugin[]
  ): string {
    const names = plugins.map((p) => p.name).join(", ");
    return (
      `Consider keeping only ${category.maxRecommended} ${category.name} plugin(s). ` +
      `You have: ${names}. ` +
      `Multiple plugins in the same category can cause conflicts and slow down your site.`
    );
  }

  /**
   * Format report as readable text
   */
  public formatReport(report: RedundancyReport): string {
    let output = "═══════════════════════════════════════════════════════\n";
    output += "       PCW TOOLBELT - PLUGIN REDUNDANCY AUDIT          \n";
    output += "═══════════════════════════════════════════════════════\n\n";

    output += `📊 Summary:\n`;
    output += `   Total Plugins: ${report.totalPlugins}\n`;
    output += `   Active Plugins: ${report.activePlugins}\n`;
    output += `   Redundancy Warnings: ${report.warnings.length}\n`;
    output += `   Scanned: ${report.timestamp.toISOString()}\n\n`;

    if (report.warnings.length === 0) {
      output += "✅ No redundancy issues detected!\n\n";
      output += "Your plugin setup looks good. No category conflicts found.\n";
    } else {
      output += `⚠️  REDUNDANCY WARNINGS:\n\n`;

      const highWarnings = report.warnings.filter((w) => w.severity === "high");
      const mediumWarnings = report.warnings.filter(
        (w) => w.severity === "medium"
      );
      const lowWarnings = report.warnings.filter((w) => w.severity === "low");

      if (highWarnings.length > 0) {
        output += `🔴 HIGH PRIORITY (${highWarnings.length}):\n`;
        highWarnings.forEach((warning, idx) => {
          output += this.formatWarning(warning, idx + 1);
        });
        output += "\n";
      }

      if (mediumWarnings.length > 0) {
        output += `🟡 MEDIUM PRIORITY (${mediumWarnings.length}):\n`;
        mediumWarnings.forEach((warning, idx) => {
          output += this.formatWarning(warning, idx + 1);
        });
        output += "\n";
      }

      if (lowWarnings.length > 0) {
        output += `🟢 LOW PRIORITY (${lowWarnings.length}):\n`;
        lowWarnings.forEach((warning, idx) => {
          output += this.formatWarning(warning, idx + 1);
        });
      }
    }

    return output;
  }

  /**
   * Format individual warning
   */
  private formatWarning(warning: RedundancyWarning, index: number): string {
    let output = `\n${index}. ${warning.category}\n`;
    output += `   ${warning.message}\n`;
    output += `   Plugins:\n`;
    warning.plugins.forEach((plugin) => {
      output += `   - ${plugin.name}${
        plugin.version ? ` (v${plugin.version})` : ""
      }\n`;
    });
    output += `   💡 ${warning.recommendation}\n`;
    return output;
  }

  /**
   * Clear cached matrix
   */
  public clearCache(): void {
    this.matrix = null;
  }
}
