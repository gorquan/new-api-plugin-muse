---
changelogVersion: 1
plugin: "gorquan_muse"
version: "1.2.3"
locale: "zh-CN"
---
# Changelog

## [1.2.3]

### Added

- 生图和编辑可以设置 `temperature` 和 `moderation`。
- 上游返回 token `usage` 时可在响应中查看，仍按交付的图片数计费。

### Changed

- 支持传入其他宽高组合，省略 `size` 时由 Meta 选择默认画幅。
- 生图和编辑默认返回图片链接。

### Fixed

- 编号参考图按下标传给上游，不受上传顺序影响。
- 不支持的 JSON 字段、非文本提示词和不支持的编辑参数会在提交前被拒绝。非字符串的 URL 或 Base64 不再计为交付的图片。

- 上游返回 `background` 时，图片响应保留该字段；`tool_enablement` 中的未知选项不再阻止生图或编辑。

### Migration

- 依赖 1.2.0 默认 Base64 行为的客户端，请显式传 `response_format: "b64_json"`。
