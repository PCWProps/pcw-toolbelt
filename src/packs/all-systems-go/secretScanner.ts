/**
 * SecretScanner - Find hardcoded secrets before they leak
 * Detects API keys, passwords, tokens, and other sensitive data
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface SecretPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface SecretMatch {
  file: string;
  line: number;
  column: number;
  match: string;
  pattern: SecretPattern;
  context: string;
}

export interface ScanResult {
  totalFiles: number;
  scannedFiles: number;
  matches: SecretMatch[];
  timestamp: Date;
}

export class SecretScanner {
  private static instance: SecretScanner;

  private patterns: SecretPattern[] = [
    // AWS
    {
      id: "aws-access-key",
      name: "AWS Access Key ID",
      pattern: /AKIA[0-9A-Z]{16}/g,
      severity: "high",
      description: "AWS Access Key ID detected",
    },
    {
      id: "aws-secret-key",
      name: "AWS Secret Access Key",
      pattern: /aws_secret_access_key\s*=\s*['"]([^'"]+)['"]/gi,
      severity: "high",
      description: "AWS Secret Access Key detected",
    },

    // API Keys (generic)
    {
      id: "generic-api-key",
      name: "Generic API Key",
      pattern: /['"]?api[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
      severity: "high",
      description: "Generic API key pattern detected",
    },
    {
      id: "generic-secret-key",
      name: "Generic Secret Key",
      pattern:
        /['"]?secret[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
      severity: "high",
      description: "Generic secret key pattern detected",
    },

    // Stripe
    {
      id: "stripe-key",
      name: "Stripe API Key",
      pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
      severity: "high",
      description: "Stripe live API key detected",
    },
    {
      id: "stripe-restricted",
      name: "Stripe Restricted Key",
      pattern: /rk_live_[0-9a-zA-Z]{24,}/g,
      severity: "high",
      description: "Stripe restricted API key detected",
    },

    // Google
    {
      id: "google-api-key",
      name: "Google API Key",
      pattern: /AIza[0-9A-Za-z_\-]{35}/g,
      severity: "high",
      description: "Google API key detected",
    },
    {
      id: "google-oauth",
      name: "Google OAuth",
      pattern: /[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/g,
      severity: "high",
      description: "Google OAuth client ID detected",
    },

    // GitHub
    {
      id: "github-token",
      name: "GitHub Token",
      pattern: /ghp_[0-9a-zA-Z]{36}/g,
      severity: "high",
      description: "GitHub personal access token detected",
    },
    {
      id: "github-oauth",
      name: "GitHub OAuth",
      pattern: /gho_[0-9a-zA-Z]{36}/g,
      severity: "high",
      description: "GitHub OAuth token detected",
    },

    // Slack
    {
      id: "slack-token",
      name: "Slack Token",
      pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}/g,
      severity: "high",
      description: "Slack token detected",
    },
    {
      id: "slack-webhook",
      name: "Slack Webhook",
      pattern:
        /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/g,
      severity: "medium",
      description: "Slack webhook URL detected",
    },

    // Database URLs
    {
      id: "db-connection-string",
      name: "Database Connection String",
      pattern:
        /(mongodb|mysql|postgresql|postgres):\/\/[a-zA-Z0-9_]+:[a-zA-Z0-9_!@#$%^&*()]+@/gi,
      severity: "high",
      description: "Database connection string with credentials detected",
    },

    // JWT
    {
      id: "jwt-token",
      name: "JWT Token",
      pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
      severity: "medium",
      description: "JWT token detected",
    },

    // Private Keys
    {
      id: "private-key",
      name: "Private Key",
      pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g,
      severity: "high",
      description: "Private key detected",
    },

    // Password patterns
    {
      id: "password-assignment",
      name: "Password Assignment",
      pattern: /['"]?password['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
      severity: "medium",
      description: "Hardcoded password detected",
    },

    // WordPress specific
    {
      id: "wp-db-password",
      name: "WordPress DB Password",
      pattern: /define\s*\(\s*['"]DB_PASSWORD['"],\s*['"]([^'"]+)['"]/gi,
      severity: "high",
      description: "WordPress database password in wp-config.php",
    },
    {
      id: "wp-salt-key",
      name: "WordPress Salt/Key",
      pattern:
        /define\s*\(\s*['"](AUTH_KEY|SECURE_AUTH_KEY|LOGGED_IN_KEY|NONCE_KEY|AUTH_SALT|SECURE_AUTH_SALT|LOGGED_IN_SALT|NONCE_SALT)['"],\s*['"]put your unique phrase here['"]/gi,
      severity: "medium",
      description: "WordPress using default salt keys",
    },

    // Twilio
    {
      id: "twilio-sid",
      name: "Twilio Account SID",
      pattern: /AC[a-z0-9]{32}/g,
      severity: "high",
      description: "Twilio Account SID detected",
    },

    // SendGrid
    {
      id: "sendgrid-key",
      name: "SendGrid API Key",
      pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
      severity: "high",
      description: "SendGrid API key detected",
    },

    // OAuth Client Secrets
    {
      id: "oauth-secret",
      name: "OAuth Client Secret",
      pattern:
        /['"]?client[_-]?secret['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
      severity: "high",
      description: "OAuth client secret detected",
    },
  ];

  private excludedDirs = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "vendor",
    ".vscode",
    "coverage",
    ".next",
    ".nuxt",
  ];

  private excludedFiles = [
    ".env.example",
    ".env.sample",
    "package-lock.json",
    "yarn.lock",
    "composer.lock",
  ];

  private constructor() {}

  public static getInstance(): SecretScanner {
    if (!SecretScanner.instance) {
      SecretScanner.instance = new SecretScanner();
    }
    return SecretScanner.instance;
  }

  /**
   * Scan workspace for secrets
   */
  public async scanWorkspace(workspacePath: string): Promise<ScanResult> {
    const result: ScanResult = {
      totalFiles: 0,
      scannedFiles: 0,
      matches: [],
      timestamp: new Date(),
    };

    try {
      await this.scanDirectory(workspacePath, workspacePath, result);
    } catch (error) {
      vscode.window.showErrorMessage(`Error scanning workspace: ${error}`);
    }

    return result;
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectory(
    basePath: string,
    currentPath: string,
    result: ScanResult
  ): Promise<void> {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (this.excludedDirs.includes(entry.name)) {
          continue;
        }

        await this.scanDirectory(basePath, fullPath, result);
      } else if (entry.isFile()) {
        // Skip excluded files
        if (this.excludedFiles.includes(entry.name)) {
          continue;
        }

        // Only scan text files
        if (this.isTextFile(entry.name)) {
          result.totalFiles++;
          await this.scanFile(basePath, fullPath, result);
        }
      }
    }
  }

  /**
   * Check if file should be scanned
   */
  private isTextFile(filename: string): boolean {
    const textExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".php",
      ".py",
      ".java",
      ".cs",
      ".rb",
      ".go",
      ".rs",
      ".c",
      ".cpp",
      ".h",
      ".hpp",
      ".sh",
      ".bash",
      ".zsh",
      ".fish",
      ".yaml",
      ".yml",
      ".json",
      ".xml",
      ".env",
      ".config",
      ".conf",
      ".ini",
      ".txt",
      ".md",
      ".vue",
      ".svelte",
    ];

    return textExtensions.some((ext) => filename.endsWith(ext));
  }

  /**
   * Scan individual file for secrets
   */
  private async scanFile(
    basePath: string,
    filePath: string,
    result: ScanResult
  ): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      result.scannedFiles++;

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];

        for (const pattern of this.patterns) {
          const regex = new RegExp(pattern.pattern);
          let match;

          while ((match = regex.exec(line)) !== null) {
            // Check if it's a false positive
            if (this.isFalsePositive(line, match[0])) {
              continue;
            }

            result.matches.push({
              file: path.relative(basePath, filePath),
              line: lineNum + 1,
              column: match.index + 1,
              match: match[0],
              pattern: pattern,
              context: this.getContext(lines, lineNum),
            });
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
      console.error(`Error scanning file ${filePath}:`, error);
    }
  }

  /**
   * Check if match is likely a false positive
   */
  private isFalsePositive(line: string, match: string): boolean {
    const falsePositivePatterns = [
      /example/i,
      /sample/i,
      /dummy/i,
      /test/i,
      /fake/i,
      /placeholder/i,
      /your[-_]key[-_]here/i,
      /xxx/i,
      /000000/,
      /123456/,
    ];

    // Check if the line contains false positive indicators
    for (const pattern of falsePositivePatterns) {
      if (pattern.test(line) || pattern.test(match)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get context around the match
   */
  private getContext(lines: string[], lineNum: number): string {
    const contextLines = 2;
    const start = Math.max(0, lineNum - contextLines);
    const end = Math.min(lines.length, lineNum + contextLines + 1);

    return lines.slice(start, end).join("\n");
  }

  /**
   * Format scan result as readable text
   */
  public formatResult(result: ScanResult): string {
    let output = "═══════════════════════════════════════════════════════\n";
    output += "       PCW TOOLBELT - SECRET SCANNER RESULTS           \n";
    output += "═══════════════════════════════════════════════════════\n\n";

    output += `📊 Scan Summary:\n`;
    output += `   Total Files: ${result.totalFiles}\n`;
    output += `   Scanned: ${result.scannedFiles}\n`;
    output += `   Secrets Found: ${result.matches.length}\n`;
    output += `   Scanned At: ${result.timestamp.toISOString()}\n\n`;

    if (result.matches.length === 0) {
      output += "✅ No secrets detected! Your code is safe to commit.\n";
      return output;
    }

    // Group by severity
    const highSeverity = result.matches.filter(
      (m) => m.pattern.severity === "high"
    );
    const mediumSeverity = result.matches.filter(
      (m) => m.pattern.severity === "medium"
    );
    const lowSeverity = result.matches.filter(
      (m) => m.pattern.severity === "low"
    );

    if (highSeverity.length > 0) {
      output += `🔴 HIGH SEVERITY (${highSeverity.length}):\n\n`;
      highSeverity.forEach((match, idx) => {
        output += this.formatMatch(match, idx + 1);
      });
      output += "\n";
    }

    if (mediumSeverity.length > 0) {
      output += `🟡 MEDIUM SEVERITY (${mediumSeverity.length}):\n\n`;
      mediumSeverity.forEach((match, idx) => {
        output += this.formatMatch(match, idx + 1);
      });
      output += "\n";
    }

    if (lowSeverity.length > 0) {
      output += `🟢 LOW SEVERITY (${lowSeverity.length}):\n\n`;
      lowSeverity.forEach((match, idx) => {
        output += this.formatMatch(match, idx + 1);
      });
    }

    output += "\n⚠️  CRITICAL: Remove these secrets before committing!\n";
    output +=
      "💡 TIP: Use environment variables or a secrets manager instead.\n";

    return output;
  }

  /**
   * Format individual match
   */
  private formatMatch(match: SecretMatch, index: number): string {
    let output = `${index}. ${match.pattern.name}\n`;
    output += `   File: ${match.file}:${match.line}:${match.column}\n`;
    output += `   Match: ${this.obfuscateSecret(match.match)}\n`;
    output += `   Description: ${match.pattern.description}\n\n`;
    return output;
  }

  /**
   * Obfuscate secret for display
   */
  private obfuscateSecret(secret: string): string {
    if (secret.length <= 8) {
      return "*".repeat(secret.length);
    }

    const visibleChars = 4;
    const start = secret.substring(0, visibleChars);
    const end = secret.substring(secret.length - visibleChars);
    const middle = "*".repeat(Math.min(20, secret.length - visibleChars * 2));

    return `${start}${middle}${end}`;
  }

  /**
   * Add custom pattern
   */
  public addPattern(pattern: SecretPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Get all patterns
   */
  public getPatterns(): SecretPattern[] {
    return [...this.patterns];
  }
}
