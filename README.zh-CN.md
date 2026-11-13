---
locale: zh-CN
---
# Muse Image

[English](README.md) | **简体中文**

为 Meta `muse-image-1.0` 提供 OpenAI Images API 任务插件，支持通过 Meta Model API 进行图片生成和图片编辑。

## 渠道配置

- 安装插件后，创建 **Task Plugin（任务插件）** 类型渠道，并绑定 `gorquan_muse`。
- 创建 Meta Model API Key，填写到渠道密钥；插件会以 `Authorization: Bearer <key>` 发送。
- API 地址填写 `https://api.meta.ai`，插件会自动请求 `/v1/images/generations` 或 `/v1/images/edits`。
- 在渠道模型中添加 `muse-image-1.0`，也可以通过模型映射使用其他名称。

## 支持的模型和接口

| 接口 | 说明 | 模型 |
| --- | --- | --- |
| `POST /v1/images/generations` | 文生图 | `muse-image-1.0` |
| `POST /v1/images/edits` | 图片编辑或多图合成 | `muse-image-1.0` |

网关也会在插件前缀下提供这些接口，例如 `/gorquan_muse/v1/images/generations`。

支持的请求字段：

- `prompt`：必填的文字指令。
- `n`：生成数量，范围为 1–10，默认 1。
- `size`：`1024x1024`、`1536x1024` 或 `1024x1536`，默认 `1024x1024`。
- `response_format`：`url` 或 `b64_json`，默认 `url`。
- 编辑请求可使用包含 `image_url` 或 `file_id` 的 `images`，也支持 OpenAI 兼容的 multipart `image` 或 `image[N]` 文件。最多 10 张输入图片，每个文件最大 20 MiB。

本插件不支持流式请求、`mask`、`quality`、`resolution` 和 `aspect_ratio`。

## 计费

插件以 `image_count` 作为预扣和结算维度。请将渠道的 **图片生成单价** 设置为每张图片的价格。Meta 当前按成功返回的图片数计费，每张 **$0.01**；`n: 2` 的请求会预扣 2 个图片单位，完成后按实际返回数量结算。

## 请求示例

通过网关生成一张图片：

```bash
curl https://your-gateway.example/v1/images/generations \
  -H "Authorization: Bearer $NEWAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "muse-image-1.0",
    "prompt": "平静蓝色湖面上的红色纸船，水彩画风格",
    "n": 1,
    "size": "1024x1024",
    "response_format": "url"
  }'
```

使用 JSON 图片引用进行编辑：

```bash
curl https://your-gateway.example/v1/images/edits \
  -H "Authorization: Bearer $NEWAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "muse-image-1.0",
    "prompt": "给人物加一顶红色针织帽，保持背景不变",
    "images": [{"image_url": "https://example.com/input.png"}],
    "n": 1,
    "response_format": "b64_json"
  }'
```

## 链接

- [Meta Muse Image 文档](https://dev.meta.ai/docs/image-generation)
- [New API 社区插件市场](https://www.newapi.ai/zh/plugins?market=community)
