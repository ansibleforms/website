---
layout: default
title: 开启助手
parent: 聊天助手
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# 开启助手
{: .no_toc }

启用助手，并在其中提供表单
{: .fs-6 .fw-300 }

---

助手需要同时满足以下四个条件：

1. **`ENABLE_CHAT=1`**：环境变量。在设置页面上修改后立即生效，无需重启；
   关闭时，聊天端点返回 `404`。参见 [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT)。
2. **模型提供方**：设置 -> 连接 -> **聊天助手**（在 Kubernetes 上也可使用 [配置种子](../seed)）。
3. **参与的表单**：在每个表单上设置 `enableForChat: true`；助手会忽略其他所有表单。
4. **可以使用它的用户**：角色选项 `allowChat`（默认：true）。在角色上设置
   `allowChat: false` 可排除其成员。

四个条件都满足后，用户就会看到聊天按钮。
