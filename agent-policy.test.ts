import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { isDatabaseCommand, managedVariables, parseDotenv } from "./.claude/hooks/database-target-guard.mjs";

// The repository's Claude Code policy (docs/ → Conventions, «Coding agents»).
// An invalid settings file is skipped WHOLE — an interactive session offers to
// go on without it, a `-p` run drops it without a word — and with it every
// deny rule. So this reads it as Claude Code would, holds the rules nobody
// should lose by accident, and runs the database guard the policy registers.

const ROOT = fileURLToPath(new URL("./", import.meta.url));
const SETTINGS = join(ROOT, ".claude/settings.json");
const GUARD = join(ROOT, ".claude/hooks/database-target-guard.mjs");

interface HookCommand {
  type: string;
  command: string;
}

interface Settings {
  permissions: { allow?: string[]; deny: string[]; ask: string[]; disableBypassPermissionsMode?: string };
  attribution: { commit: string; pr: string; sessionUrl: boolean };
  hooks?: { PreToolUse?: { matcher?: string; hooks: HookCommand[] }[] };
}

const settings = JSON.parse(readFileSync(SETTINGS, "utf8")) as Settings;

describe("the agent policy", () => {
  it("only restricts: no allow rule, bypass mode disabled", () => {
    expect(settings.permissions.allow ?? []).toEqual([]);
    expect(settings.permissions.disableBypassPermissionsMode).toBe("disable");
  });

  it("denies reading and editing the env files, and every forced push", () => {
    expect(settings.permissions.deny).toEqual(
      expect.arrayContaining([
        "Read(/.env)",
        "Read(/.env.local)",
        "Edit(/.env)",
        "Edit(/.env.local)",
        "Bash(git push --force*)",
        "Bash(git push -f*)",
        "Bash(npx prisma migrate reset*)",
        "Bash(npx prisma db push*)",
      ]),
    );
  });

  it("asks before a push, a database write and an edit of itself", () => {
    expect(settings.permissions.ask).toEqual(
      expect.arrayContaining([
        "Bash(git push *)",
        "Bash(npm run db:deploy*)",
        "Bash(npm run db:seed*)",
        "Bash(npm run db:backup*)",
        "Edit(/.claude/settings.json)",
      ]),
    );
  });

  it("leaves no attribution, in the object form older clients accept", () => {
    expect(settings.attribution).toEqual({ commit: "", pr: "", sessionUrl: false });
  });

  it("registers the database guard on Bash, failing closed when it cannot start", () => {
    const commands = (settings.hooks?.PreToolUse ?? [])
      .filter((entry) => entry.matcher === "Bash")
      .flatMap((entry) => entry.hooks.map((hook) => hook.command));
    const guard = commands.find((command) => command.includes(".claude/hooks/database-target-guard.mjs"));
    expect(guard).toMatch(/\|\| exit 2$/);
    expect(existsSync(GUARD)).toBe(true);
  });
});

describe("the database guard", () => {
  it("knows the commands that write to the databases .env.local names", () => {
    for (const command of [
      "npm run dev",
      "npm run db:migrate",
      "npm run db:seed",
      "cd docs && cd .. && npm run user:create -- a@b.c",
      "npm run stats:rebuild",
      "npx prisma migrate dev --name x",
      "npx tsx scripts/index-game-positions.ts",
      "npm run build",
    ]) {
      expect(isDatabaseCommand(command), command).toBe(true);
    }
  });

  it("leaves alone the commands that touch no database", () => {
    for (const command of [
      "git status",
      "npm test",
      "npm run lint",
      "npm run db:target",
      "npx prisma generate",
      "npx prisma validate",
      "npm run storybook:build",
      "docker exec 365-postgres psql -U ajedrez -d plataforma -c 'select 1'",
    ]) {
      expect(isDatabaseCommand(command), command).toBe(false);
    }
  });

  it("reads a dotenv file as dotenv does", () => {
    expect(
      parseDotenv(
        [
          "# a comment",
          'PLATFORM_DATABASE_URL="postgresql://u:p@localhost:5432/plataforma"',
          "# PLATFORM_DATABASE_URL=postgresql://u:p@db.example.com/x",
          "DATABASE_URI=postgresql://u:p@localhost:5432/payload # the container",
          "export OTHER='a # not a comment'",
          "PLATFORM_DATABASE_URL=postgresql://u:p@second.example.com/x",
        ].join("\n"),
      ),
    ).toEqual({
      PLATFORM_DATABASE_URL: "postgresql://u:p@localhost:5432/plataforma",
      DATABASE_URI: "postgresql://u:p@localhost:5432/payload",
      OTHER: "a # not a comment",
    });
  });

  describe("against a project folder", () => {
    let folder = "";
    afterEach(() => folder && rmSync(folder, { recursive: true, force: true }));

    const project = (envLocal: string, env = "") => {
      folder = mkdtempSync(join(tmpdir(), "guard-"));
      writeFileSync(join(folder, ".env.local"), envLocal);
      if (env) writeFileSync(join(folder, ".env"), env);
      return folder;
    };

    const run = (dir: string, input: string) =>
      execFileSync("node", [GUARD], {
        input,
        encoding: "utf8",
        // Without the shell's own database variables, which dotenv would let win.
        env: { NODE_ENV: "test", PATH: process.env.PATH ?? "", CLAUDE_PROJECT_DIR: dir },
      });

    it("names the managed variables, the environment first, then .env.local, then .env", () => {
      const dir = project(
        "PLATFORM_DATABASE_URL=postgresql://u:p@db.example.com/plataforma\n",
        "DATABASE_URI=postgresql://u:p@localhost/payload\n",
      );
      expect(managedVariables(dir, {})).toEqual(["PLATFORM_DATABASE_URL"]);
      expect(managedVariables(dir, { PLATFORM_DATABASE_URL: "postgresql://u:p@127.0.0.1/x" })).toEqual([]);
      // What cannot be told counts as managed: a missing variable is not this machine.
      expect(managedVariables(project(""), {})).toEqual(["PLATFORM_DATABASE_URL", "DATABASE_URI"]);
    });

    it("says nothing when both databases are this machine", () => {
      const dir = project(
        "PLATFORM_DATABASE_URL=postgresql://u:p@localhost/plataforma\nDATABASE_URI=postgresql://u:p@localhost/payload\n",
      );
      expect(run(dir, JSON.stringify({ tool_input: { command: "npm run db:migrate" } }))).toBe("");
    });

    it("asks before a database command when one of them is managed, naming no host", () => {
      const dir = project(
        "PLATFORM_DATABASE_URL=postgresql://u:p@db.example.com/plataforma\nDATABASE_URI=postgresql://u:p@localhost/payload\n",
      );
      const output = run(dir, JSON.stringify({ tool_input: { command: "npm run dev" } }));
      const decision = JSON.parse(output).hookSpecificOutput;
      expect(decision).toMatchObject({ hookEventName: "PreToolUse", permissionDecision: "ask" });
      expect(decision.permissionDecisionReason).toContain("PLATFORM_DATABASE_URL");
      expect(output).not.toContain("example.com");
      expect(run(dir, JSON.stringify({ tool_input: { command: "git status" } }))).toBe("");
    });

    it("asks when it cannot read what it was given", () => {
      expect(JSON.parse(run(project(""), "not json")).hookSpecificOutput.permissionDecision).toBe("ask");
    });
  });
});
