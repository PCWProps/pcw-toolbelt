import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

export interface StandardSource {
  id: string; // e.g., react-hooks
  name: string; // Human-friendly
  url: string; // Remote JSON or text endpoint
  fileTypes: string[]; // e.g., [".tsx", ".jsx"]
}

export interface CachedStandard {
  id: string;
  name: string;
  lastUpdated: string; // ISO date
  contentType: "json" | "text";
  content: any; // JSON object or string
}

export class StandardsManager {
  private static instance: StandardsManager;
  private sources: StandardSource[] = [];

  private constructor() {}

  public static getInstance(): StandardsManager {
    if (!StandardsManager.instance) {
      StandardsManager.instance = new StandardsManager();
    }
    return StandardsManager.instance;
  }

  public configureSources(sources: StandardSource[]) {
    this.sources = sources;
  }

  private getCacheDir(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return null;
    const root = workspaceFolders[0].uri.fsPath;
    const dir = path.join(root, ".toolbelt-standards");
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    return dir;
  }

  private getCachePath(id: string): string | null {
    const dir = this.getCacheDir();
    if (!dir) return null;
    return path.join(dir, `${id}.json`);
  }

  public readCache(id: string): CachedStandard | null {
    const file = this.getCachePath(id);
    if (!file || !fs.existsSync(file)) return null;
    try {
      const content = fs.readFileSync(file, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  public async fetchAndCache(
    id: string,
    url: string,
    name: string
  ): Promise<CachedStandard | null> {
    const data = await this.fetch(url);
    if (!data) return null;

    let parsed: any = data;
    let contentType: "json" | "text" = "text";
    try {
      parsed = JSON.parse(data);
      contentType = "json";
    } catch {
      parsed = data;
    }

    const cached: CachedStandard = {
      id,
      name,
      lastUpdated: new Date().toISOString(),
      contentType,
      content: parsed,
    };

    const file = this.getCachePath(id);
    if (!file) return cached;
    try {
      fs.writeFileSync(file, JSON.stringify(cached, null, 2), "utf-8");
    } catch {}
    return cached;
  }

  private async fetch(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      https
        .get(url, (res) => {
          if ((res.statusCode || 500) >= 400) {
            resolve(null);
            return;
          }
          const bufs: Buffer[] = [];
          res.on("data", (c) => bufs.push(c));
          res.on("end", () => resolve(Buffer.concat(bufs).toString("utf-8")));
        })
        .on("error", () => resolve(null));
    });
  }

  /**
   * Check for outdated cached standards by comparing age threshold.
   * If any are older than maxAgeDays, returns list to update.
   */
  public findOutdated(maxAgeDays: number = 14): StandardSource[] {
    const outdated: StandardSource[] = [];
    const now = Date.now();
    this.sources.forEach((src) => {
      const cached = this.readCache(src.id);
      if (!cached) {
        outdated.push(src);
        return;
      }
      const ageDays =
        (now - new Date(cached.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays >= maxAgeDays) {
        outdated.push(src);
      }
    });
    return outdated;
  }

  public async updateSources(sources?: StandardSource[]): Promise<number> {
    const list = sources ?? this.sources;
    let count = 0;
    for (const src of list) {
      const updated = await this.fetchAndCache(src.id, src.url, src.name);
      if (updated) count++;
    }
    return count;
  }
}
