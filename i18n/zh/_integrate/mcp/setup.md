---
layout: default
title: 设置
parent: MCP 服务器
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# 设置
{: .no_toc }

开启服务器并对客户端进行身份验证
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 启用

把 [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) 设为 `1`，或在 **设置 > 连接 > MCP** 下开启它
（参见 [MCP 页面](#the-mcp-page)）。在设置页面上修改后，开关立即生效，无需重启。关闭时，
该端点返回 `404`。端点为：

```
POST <your url>/api/v2/mcp
```

它使用无状态的 Streamable HTTP，响应为普通 JSON，因此 `GET` 和 `DELETE` 返回 405。

---

## 限制代理能做的事

另外两个开关可以为所有客户端收窄 MCP 服务器的能力。与 `ENABLE_MCP` 一样，它们无需重启即可生效：

| 变量 | 设为 `1` 时 |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | 服务器不提供任何启动、计划或修改类的工具（`launch_job`、`relaunch_job`、`plan_job`、`create_schedule`、`delete_schedule`、`store_job`、`delete_stored_job`），并拒绝它们。代理可以列出、读取和填写表单，读取调度和保存的作业，并跟踪作业，但不能启动或修改任何东西：这是试用代理的一种安全方式。 |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | 代理只能看到设置了 `enableForChat: true` 的表单，与 [聊天助手](../chat/) 的列表相同。其他任何表单及其作业都会返回未找到。 |

两者默认都是关闭的：代理可以看到用户角色允许的所有表单，并可以启动它们。

---

## MCP 页面

**设置 > 连接 > MCP** 在两个选项卡中保存 MCP 服务器的设置。

- **常规** 包含三个开关 `ENABLE_MCP`、`MCP_READ_ONLY` 和 `MCP_CHAT_FORMS_ONLY`，用 **保存** 保存。后两个
  只能在 MCP 服务器开启时修改。
- **客户端配置** 显示 **端点** 及一个复制按钮，并为 **Claude Code**
  （`.mcp.json`，或 `claude mcp add` 命令）、**Cursor**（`~/.cursor/mcp.json`）、**VS Code**（`.vscode/mcp.json`，在服务器首次启动时
  询问令牌）和 **Codex**（`~/.codex/config.toml`，令牌放在
  `ANSIBLEFORMS_TOKEN` 环境变量中）提供现成的配置。每个配置都有复制按钮；请把 `<your-token>` 替换为您自己的令牌，
  可通过 **创建令牌** 链接生成。

如果设置了应用的 URL（**设置 > URL**），端点就根据它构建，否则根据浏览器的地址构建。

---

## 身份验证

每个请求都需要一个 AnsibleForms 访问令牌：

```
Authorization: Bearer <token>
```

按通常的方式获取令牌（`POST /api/v2/auth/login`，或 OIDC / Entra ID 流程），并
用 `POST /api/v2/token` 刷新它。这里特意 **没有登录工具**：作为工具参数传入的密码
会进入语言模型的上下文及其聊天记录中。

用户的角色还必须通过 `allowMcp` [角色选项](../config/roles.html) 允许使用 MCP 服务器。当用户的任何角色
都没有设置它时，它跟随 `allowChat`，后者默认开启。被拒绝的用户在每个请求上都会收到 `403`。

- **聊天后端** 自行为用户登录，保存刷新令牌，并在每次 MCP 调用时传递访问
  令牌。
- **IDE 客户端** 需要一个有效期足够长的令牌，以便只配置一次。如果角色
  带有 `allowApiTokens` 选项，可在
  [个人资料 > API 令牌](../profile/api-token.html) 下创建一个，或在登录 URL 上加上 `?expiryDays=<n>` 登录，
  获得有效期为指定天数的令牌。

用这样的令牌连接编码代理：

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

添加服务器，并把令牌作为请求头：

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

把服务器添加到 `~/.codex/config.toml`，令牌从环境变量中读取：

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

然后在启动 Codex 之前设置该变量：

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
