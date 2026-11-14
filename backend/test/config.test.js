import { test } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { getJwtSecretProblem, getAdminPasswordProblem, isLocalMongoUri } = await import("../src/config/validateEnv.js");

test("JWT secret: missing, default, placeholder, short and repetitive values are rejected", () => {
  assert.match(getJwtSecretProblem(""), /not set/);
  assert.match(getJwtSecretProblem("change-me"), /known default/);
  assert.match(getJwtSecretProblem("<generate: node -e \"...\">"), /placeholder/);
  assert.match(getJwtSecretProblem("short-but-random-1A!"), /at least 32/);
  assert.match(getJwtSecretProblem("a".repeat(64)), /repetitive/);
  assert.equal(getJwtSecretProblem("q8Zr2Lw9Kx1Vt5Nb7Mc3Hd6Fg0Js4Ap-YeTuIoP_"), "");
});

test("JWT secret problems never echo the secret value", () => {
  const secret = "my-secret-value-that-is-too-short";
  assert.ok(!getJwtSecretProblem(secret.slice(0, 20)).includes(secret.slice(0, 20)));
});

test("Admin seed password: the old default Admin@123 and weak passwords are rejected", () => {
  assert.match(getAdminPasswordProblem(""), /not set/);
  assert.match(getAdminPasswordProblem("Admin@123"), /known default/);
  assert.match(getAdminPasswordProblem("Sh0rt!"), /at least 12/);
  assert.match(getAdminPasswordProblem("alllowercaseletters"), /mix/);
  assert.equal(getAdminPasswordProblem("North-Luxe-2026!x"), "");
});

test("Seed guard: only local MongoDB URIs count as safe targets", () => {
  assert.equal(isLocalMongoUri("mongodb://127.0.0.1:27017/north-luxe"), true);
  assert.equal(isLocalMongoUri("mongodb://localhost/north-luxe"), true);
  assert.equal(isLocalMongoUri("mongodb+srv://user:pass@cluster0.abcde.mongodb.net/db"), false);
  assert.equal(isLocalMongoUri("mongodb://u:p@a.mongodb.net:27017,b.mongodb.net:27017/db"), false);
  assert.equal(isLocalMongoUri("mongodb://localhost,evil.example.com/db"), false);
});

test("The API refuses to start with a weak JWT secret", async () => {
  // Run in a child process so this module's env stays untouched.
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", 'await import("./src/app.js")'], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: { ...process.env, NODE_ENV: "test", JWT_SECRET: "change-me" },
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET is a known default/);
  assert.ok(!result.stderr.includes("change-me\n"));
});
