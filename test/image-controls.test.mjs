import assert from "node:assert/strict";
import test from "node:test";
import { buildSubmitRequest, extractUsage, extractUsageOnComplete, parseSubmitResponse, protocols } from "../plugin.js";

const model = "muse-image-1.0";
function submit(operation, body) {
  const intent = protocols.openai_image.decodeRequest({ model, operation, body });
  return buildSubmitRequest({ ...intent, baseUrl: "https://api.meta.ai" }).body;
}

const flags = { enable_image_search: true, enable_web_search: false, enable_shell: false };
for (const operation of ["generate", "edit"]) {
  test(`${operation}: JSON controls survive both normalization steps`, () => {
    const controls = { output_format: "png", reasoning_strength: "low", user: "qa", tool_enablement: flags,
      size: "1792x1024", temperature: 0, moderation: "auto" };
    const value = { model, prompt: "Icon", ...controls };
    if (operation === "edit") value.images = [{ image_url: "https://example.invalid/ref.png" }];
    assert.deepEqual(submit(operation, { kind: "json", value }), { ...value, n: 1, response_format: "url" });
    value.tool_enablement = { future_tool: "unused", ...flags };
    assert.deepEqual(submit(operation, { kind: "json", value }).tool_enablement, flags);
    value.response_format = "b64_json";
    assert.equal(submit(operation, { kind: "json", value }).response_format, "b64_json");
    delete value.tool_enablement;
    assert.equal(Object.hasOwn(submit(operation, { kind: "json", value }), "tool_enablement"), false);
  });
}

test("multipart editing preserves SDK bracket flags and JSON text fields", () => {
  const body = { kind: "multipart", fields: { prompt: ["icon"], output_format: ["jpeg"], user: ["qa"],
    reasoning_strength: ["high"], temperature: ["2"], moderation: ["low"], response_format: ["url"] },
    files: [{ field: "image", ref: "input", mimeType: "image/png" }] };
  const extended = { ...flags, future_tool: "unused" };
  for (const fields of [{ tool_enablement: [JSON.stringify(extended)] },
    Object.fromEntries(Object.entries(extended).map(([k,v]) => [`tool_enablement[${k}]`, [String(v)]]))]) {
    const result = submit("edit", { ...body, fields: { ...body.fields, ...fields } });
    assert.deepEqual(result.tool_enablement, flags);
    assert.equal(result.output_format, "jpeg");
    assert.equal(result.reasoning_strength, "high");
    assert.equal(result.user, "qa");
    assert.equal(result.temperature, 2);
    assert.equal(result.moderation, "low");
    assert.equal(result.response_format, "url");
    assert.equal(Object.hasOwn(result, "size"), false);
  }
  assert.throws(() => submit("edit", { ...body, fields: { ...body.fields, tool_enablement: ["not JSON"] } }), /JSON object/);
});

test("invalid controls cannot silently fall through to vendor defaults", () => {
  for (const controls of [{ output_format: "gif" }, { reasoning_strength: "medium" }, { user: {} },
    { temperature: "0" }, { temperature: null }, { temperature: -1 }, { temperature: 2.1 }, { moderation: "off" },
    { size: "4k" }, { size: "0x1024" }, { tool_enablement: { other: true, enable_shell: "false" } }]) {
    assert.throws(() => submit("generate", { kind: "json", value: { prompt: "icon", ...controls } }));
  }
});

test("unsupported inputs never turn into a billable generation or edit", () => {
  for (const value of [{ seed: 1 }, { previous_response_id: "resp_old" }, { prompt: 42 }]) {
    assert.throws(() => submit("generate", { kind: "json", value: { prompt: "icon", ...value } }));
  }
  for (const name of ["input_fidelity", "partial_images", "previous_response_id"]) {
    assert.throws(() => submit("edit", { kind: "multipart", fields: { prompt: ["icon"], [name]: ["1"] },
      files: [{ field: "image", ref: "a" }] }), /not supported/);
  }
});

test("numbered references follow indices; repeated unnumbered files follow upload order", () => {
  for (const [names, expected] of [[["image[1]", "image[0]"], ["B","A"]], [["image","image"], ["A","B"]]]) {
    const result = submit("edit", { kind: "multipart", fields: { prompt: ["combine"] },
      files: names.map((field, i) => ({ field, ref: ["A","B"][i] })) });
    assert.deepEqual(result.images.map(i => i.image_url.__fileRef), expected);
  }
});

test("object and numeric payloads neither complete a task nor increase the settled count", () => {
  const task = { action: "image_generation" };
  const body = { data: [{ url: {} }, { b64_json: 123 }] };
  assert.equal(parseSubmitResponse(task, { body }).immediate.status, "FAILURE");
  assert.deepEqual(extractUsageOnComplete(task, {}, body), { image_count: 0 });
  body.data.push({ url: "https://example.invalid/image.png", b64_json: {} });
  assert.deepEqual(extractUsageOnComplete(task, {}, body), { image_count: 1 });
  assert.deepEqual(protocols.openai_image.render({}, { data: body }).data, [{ url: body.data[2].url }]);
});

test("render preserves upstream background without inventing a default", () => {
  const data = { data: [{ b64_json: "aWNvbg==" }] };
  assert.equal(Object.hasOwn(protocols.openai_image.render({}, { data }), "background"), false);
  data.background = "opaque";
  assert.equal(protocols.openai_image.render({}, { data }).background, "opaque");
});

test("upstream token usage is returned for reference; settlement counts delivered images", () => {
  const ctx = { model, action: "image_generation", requestBody: { prompt: "icon", n: 3 } };
  assert.deepEqual(extractUsage(ctx), { image_count: 3 });
  const body = { data: [{ url: "https://example.invalid/1" }, { revised_prompt: "no image" }],
    usage: { input_tokens: 0, input_tokens_details: { image_tokens: 0 }, output_tokens: 725, total_tokens: 725 } };
  const { taskData } = parseSubmitResponse(ctx, { body });
  assert.deepEqual(protocols.openai_image.render({}, { data: taskData }).usage, body.usage);
  assert.deepEqual(extractUsageOnComplete(ctx, {}, taskData), { image_count: 1 });
  delete body.usage;
  assert.equal(Object.hasOwn(protocols.openai_image.render({}, { data: body }), "usage"), false);
  body.data = [];
  assert.equal(parseSubmitResponse(ctx, { body }).immediate.status, "FAILURE");
});
