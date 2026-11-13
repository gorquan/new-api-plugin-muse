---
translations:
  zh-CN: README.zh-CN.md
---
# Muse Image

**English** | [简体中文](README.zh-CN.md)

An OpenAI Images API task plugin for Meta's `muse-image-1.0`, supporting image generation and image editing through the Meta Model API.

## Channel setup

- Install the plugin, then create a channel of type **Task Plugin** and bind it to `gorquan_muse`.
- Create a Meta Model API key and put it in the channel key field. The plugin sends it as `Authorization: Bearer <key>`.
- Set the API address to `https://api.meta.ai`. The plugin appends `/v1/images/generations` or `/v1/images/edits`.
- Add `muse-image-1.0` to the channel. Model mapping can expose it under another name.

## Models and endpoints

| Endpoint | Description | Model |
| --- | --- | --- |
| `POST /v1/images/generations` | Text-to-image generation | `muse-image-1.0` |
| `POST /v1/images/edits` | Edit or compose one or more input images | `muse-image-1.0` |

The gateway also serves these routes under the plugin prefix, for example `/gorquan_muse/v1/images/generations`.

Supported request fields:

- `prompt`: required text instruction.
- `n`: number of output images, from 1 to 10; defaults to 1.
- `size`: `1024x1024`, `1536x1024`, or `1024x1536`; defaults to `1024x1024`.
- `response_format`: `url` or `b64_json`; defaults to `url`.
- Edit requests accept `images` entries containing one `image_url` or `file_id`, and also accept OpenAI-compatible multipart `image` or `image[N]` files. At most 10 input images are accepted and each file is limited to 20 MiB.

Streaming, `mask`, `quality`, `resolution`, and `aspect_ratio` are not supported by this plugin.

## Billing

The plugin reports `image_count` for reservation and settlement. Set the channel's **Image generation unit price** to the price of one image. Meta currently charges **$0.01 per successfully returned image**; a request with `n: 2` reserves two image units, and completion settles against the number of images returned.

## Example

Generate one image through the gateway:

```bash
curl https://your-gateway.example/v1/images/generations \
  -H "Authorization: Bearer $NEWAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "muse-image-1.0",
    "prompt": "A red paper boat on a calm blue lake, watercolor style",
    "n": 1,
    "size": "1024x1024",
    "response_format": "url"
  }'
```

Edit an image with a JSON image reference:

```bash
curl https://your-gateway.example/v1/images/edits \
  -H "Authorization: Bearer $NEWAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "muse-image-1.0",
    "prompt": "Add a small red wool hat and keep the background unchanged",
    "images": [{"image_url": "https://example.com/input.png"}],
    "n": 1,
    "response_format": "b64_json"
  }'
```

## Links

- [Meta Muse Image documentation](https://dev.meta.ai/docs/image-generation)
- [New API plugin marketplace](https://www.newapi.ai/zh/plugins?market=community)
