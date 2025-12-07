/**
 * DependencyHealthChecker - Audit package dependencies
 * Checks for outdated, vulnerable, or problematic packages
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface DependencyIssue {
  package: string;
  currentVersion: string;
  latestVersion?: string;
  type: "outdated" | "vulnerable" | "deprecated" | "missing" | "unused";
  severity: "high" | "medium" | "low";
  description: string;
}

export interface HealthReport {
  projectType: "npm" | "composer" | "unknown";
  totalDependencies: number;
  issues: DependencyIssue[];
  timestamp: Date;
}

export class DependencyHealthChecker {
  private static instance: DependencyHealthChecker;

  private constructor() {}

  public static getInstance(): DependencyHealthChecker {
    if (!DependencyHealthChecker.instance) {
      DependencyHealthChecker.instance = new DependencyHealthChecker();
    }
    return DependencyHealthChecker.instance;
  }

  /**
   * Run health check on workspace
   */
  public async checkHealth(workspacePath: string): Promise<HealthReport> {
    const projectType = this.detectProjectType(workspacePath);

    const report: HealthReport = {
      projectType,
      totalDependencies: 0,
      issues: [],
      timestamp: new Date(),
    };

    if (projectType === "npm") {
      await this.checkNpmDependencies(workspacePath, report);
    } else if (projectType === "composer") {
      await this.checkComposerDependencies(workspacePath, report);
    }

    return report;
  }

  /**
   * Detect project type
   */
  private detectProjectType(
    workspacePath: string
  ): "npm" | "composer" | "unknown" {
    if (fs.existsSync(path.join(workspacePath, "package.json"))) {
      return "npm";
    }
    if (fs.existsSync(path.join(workspacePath, "composer.json"))) {
      return "composer";
    }
    return "unknown";
  }

  /**
   * Check NPM dependencies
   */
  private async checkNpmDependencies(
    workspacePath: string,
    report: HealthReport
  ): Promise<void> {
    const packageJsonPath = path.join(workspacePath, "package.json");

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      report.totalDependencies = Object.keys(allDeps).length;

      // Check for outdated packages
      try {
        const { stdout } = await execAsync("npm outdated --json", {
          cwd: workspacePath,
        });
        const outdated = JSON.parse(stdout);

        for (const [pkg, info] of Object.entries(
          outdated as Record<string, any>
        )) {
          report.issues.push({
            package: pkg,
            currentVersion: info.current,
            latestVersion: info.latest,
            type: "outdated",
            severity: this.getOutdatedSeverity(info.current, info.latest),
            description: `Outdated: ${info.current} → ${info.latest}`,
          });
        }
      } catch (error) {
        // npm outdated returns non-zero exit code when packages are outdated
        // Parse the error output if available
      }

      // Check for vulnerabilities using npm audit
      try {
        const { stdout } = await execAsync("npm audit --json", {
          cwd: workspacePath,
        });
        const auditResult = JSON.parse(stdout);

        if (auditResult.vulnerabilities) {
          for (const [pkg, vuln] of Object.entries(
            auditResult.vulnerabilities as Record<string, any>
          )) {
            report.issues.push({
              package: pkg,
              currentVersion: vuln.version || "unknown",
              type: "vulnerable",
              severity: vuln.severity || "medium",
              description: `${vuln.severity} severity vulnerability: ${
                vuln.title || "Unknown issue"
              }`,
            });
          }
        }
      } catch (error) {
        // npm audit may fail or return non-zero
      }

      // Check for deprecated packages
      for (const [pkg, version] of Object.entries(allDeps)) {
        if (this.isDeprecatedPackage(pkg)) {
          report.issues.push({
            package: pkg,
            currentVersion: version as string,
            type: "deprecated",
            severity: "medium",
            description: "Package is deprecated and no longer maintained",
          });
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error checking npm dependencies: ${error}`
      );
    }
  }

  /**
   * Check Composer dependencies
   */
  private async checkComposerDependencies(
    workspacePath: string,
    report: HealthReport
  ): Promise<void> {
    const composerJsonPath = path.join(workspacePath, "composer.json");

    try {
      const composerJson = JSON.parse(
        fs.readFileSync(composerJsonPath, "utf-8")
      );
      const allDeps = {
        ...composerJson.require,
        ...composerJson["require-dev"],
      };

      report.totalDependencies = Object.keys(allDeps).length;

      // Check for outdated packages
      try {
        const { stdout } = await execAsync("composer outdated --format=json", {
          cwd: workspacePath,
        });
        const outdated = JSON.parse(stdout);

        if (outdated.installed) {
          for (const pkg of outdated.installed) {
            report.issues.push({
              package: pkg.name,
              currentVersion: pkg.version,
              latestVersion: pkg.latest,
              type: "outdated",
              severity: "medium",
              description: `Outdated: ${pkg.version} → ${pkg.latest}`,
            });
          }
        }
      } catch (error) {
        // composer outdated may fail
      }

      // Check for security vulnerabilities
      try {
        const { stdout } = await execAsync("composer audit --format=json", {
          cwd: workspacePath,
        });
        const auditResult = JSON.parse(stdout);

        if (auditResult.advisories) {
          for (const advisory of auditResult.advisories) {
            report.issues.push({
              package: advisory.packageName,
              currentVersion: advisory.affectedVersions,
              type: "vulnerable",
              severity: advisory.severity || "medium",
              description: advisory.title,
            });
          }
        }
      } catch (error) {
        // composer audit may not be available
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error checking composer dependencies: ${error}`
      );
    }
  }

  /**
   * Determine severity based on version difference
   */
  private getOutdatedSeverity(
    current: string,
    latest: string
  ): "high" | "medium" | "low" {
    const currentParts = current.replace(/[^0-9.]/g, "").split(".");
    const latestParts = latest.replace(/[^0-9.]/g, "").split(".");

    // Major version difference
    if (currentParts[0] !== latestParts[0]) {
      return "high";
    }

    // Minor version difference
    if (currentParts[1] !== latestParts[1]) {
      return "medium";
    }

    // Patch version difference
    return "low";
  }

  /**
   * Check if package is known to be deprecated
   */
  private isDeprecatedPackage(packageName: string): boolean {
    const deprecatedPackages = [
      "request",
      "left-pad",
      "colors",
      "faker", // replaced by @faker-js/faker
      "tslint", // replaced by eslint
      "node-sass", // replaced by sass
    ];

    return deprecatedPackages.includes(packageName);
  }

  /**
   * Format health report as readable text
   */
  public formatReport(report: HealthReport): string {
    let output = "═══════════════════════════════════════════════════════\n";
    output += "       PCW TOOLBELT - DEPENDENCY HEALTH CHECK          \n";
    output += "═══════════════════════════════════════════════════════\n\n";

    output += `📦 Project Type: ${report.projectType}\n`;
    output += `📊 Total Dependencies: ${report.totalDependencies}\n`;
    output += `⚠️  Issues Found: ${report.issues.length}\n`;
    output += `📅 Scanned: ${report.timestamp.toISOString()}\n\n`;

    if (report.issues.length === 0) {
      output += "✅ All dependencies are healthy!\n";
      return output;
    }

    // Group by type and severity
    const vulnerable = report.issues.filter((i) => i.type === "vulnerable");
    const outdated = report.issues.filter((i) => i.type === "outdated");
    const deprecated = report.issues.filter((i) => i.type === "deprecated");

    if (vulnerable.length > 0) {
      output += `🔴 VULNERABILITIES (${vulnerable.length}):\n\n`;
      vulnerable.forEach((issue, idx) => {
        output += this.formatIssue(issue, idx + 1);
      });
      output += "\n";
    }

    if (deprecated.length > 0) {
      output += `🟡 DEPRECATED PACKAGES (${deprecated.length}):\n\n`;
      deprecated.forEach((issue, idx) => {
        output += this.formatIssue(issue, idx + 1);
      });
      output += "\n";
    }

    if (outdated.length > 0) {
      output += `🟢 OUTDATED PACKAGES (${outdated.length}):\n\n`;
      outdated.forEach((issue, idx) => {
        output += this.formatIssue(issue, idx + 1);
      });
    }

    output +=
      "\n💡 TIP: Run `npm update` or `composer update` to update dependencies.\n";
    output +=
      "💡 TIP: Review vulnerabilities and consider upgrading affected packages.\n";

    return output;
  }

  /**
   * Format individual issue
   */
  private formatIssue(issue: DependencyIssue, index: number): string {
    let output = `${index}. ${issue.package}\n`;
    output += `   Current: ${issue.currentVersion}\n`;
    if (issue.latestVersion) {
      output += `   Latest: ${issue.latestVersion}\n`;
    }
    output += `   ${issue.description}\n\n`;
    return output;
  }
}
