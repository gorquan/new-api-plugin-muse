import assert from "node:assert/strict";
import test from "node:test";
import { buildSubmitRequest, protocols } from "../plugin.js";

const model = "muse-image-1.0";
function submit(operation, body) {
  const intent = protocols.openai_image.decodeRequest({ model, operation, body });
  return buildSubmitRequest({ ...intent, baseUrl: "https://api.meta.ai" }).body;
}

const flags = { enable_image_search: true, enable_web_search: false, enable_shell: false };
for (const operation of ["generate", "edit"]) {
  test(`${operation}: JSON controls survive both normalization steps`, () => {
    const controls = { output_format: "png", reasoning_strength: "low", user: "qa", tool_enablement: flags, size: "auto" };
    const value = { model, prompt: "Icon", ...controls };
    if (operation === "edit") value.images = [{ image_url: "https://example.invalid/ref.png" }];
    assert.deepEqual(submit(operation, { kind: "json", value }), { ...value, n: 1, response_format: "url" });
    delete value.tool_enablement;
    assert.equal(Object.hasOwn(submit(operation, { kind: "json", value }), "tool_enablement"), false);
  });
}

test("multipart editing preserves SDK bracket flags and JSON text fields", () => {
  const body = { kind: "multipart", fields: { prompt: ["icon"], output_format: ["jpeg"], user: ["qa"], reasoning_strength: ["high"] },
    files: [{ field: "image", ref: "input", mimeType: "image/png" }] };
  for (const fields of [{ tool_enablement: [JSON.stringify(flags)] },
    Object.fromEntries(Object.entries(flags).map(([k,v]) => [`tool_enablement[${k}]`, [String(v)]]))]) {
    const result = submit("edit", { ...body, fields: { ...body.fields, ...fields } });
    assert.deepEqual(result.tool_enablement, flags);
    assert.equal(result.output_format, "jpeg");
    assert.equal(result.reasoning_strength, "high");
    assert.equal(result.user, "qa");
  }
  assert.throws(() => submit("edit", { ...body, fields: { ...body.fields, tool_enablement: ["not JSON"] } }), /JSON object/);
});

test("invalid controls cannot silently fall through to vendor defaults", () => {
  for (const controls of [{ output_format: "gif" }, { reasoning_strength: "medium" }, { user: {} },
    { tool_enablement: { enable_shell: "false" } }, { tool_enablement: { other: true } }]) {
    assert.throws(() => submit("generate", { kind: "json", value: { prompt: "icon", ...controls } }));
  }
});
