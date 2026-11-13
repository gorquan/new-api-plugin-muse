---
changelogVersion: 1
plugin: "gorquan_muse"
version: "1.1.2"
locale: "zh-CN"
translations:
  en: CHANGELOG.md
---
# 更新日志

## [1.1.2]

### 新增

- 新增 `muse-image-1.0` 模型的 OpenAI 兼容图片生成。
- 新增支持 JSON 和 multipart 请求的 OpenAI 兼容图片编辑。
- 支持 `n`、`size`、`response_format`，最多生成 10 张图片。
- 编辑请求支持 URL、data URL、文件引用和 multipart 图片输入。
- 通过 `image_count` 计费字段上报请求数量和实际返回数量。
