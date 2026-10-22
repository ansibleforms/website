---
layout: default
title: LDAP
parent: 身份验证
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

让目录用户使用自己的密码登录，并通过其目录组为他们分配角色
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 工作原理

AnsibleForms 使用绑定账户连接到目录，搜索该用户，然后以该用户身份绑定以验证
密码：

1. 用户使用用户名和密码登录。当没有同名的 **本地** 用户时，会尝试 LDAP。
2. AnsibleForms 使用目录凭据中的绑定账户进行绑定，并在 **搜索基准** 中搜索
   **用户名属性** 等于该用户名的条目。
3. 它使用输入的密码，以找到的条目身份进行绑定。
4. 从该条目（或通过组搜索）读取组，进行筛选，并加上 `ldap/` 前缀。

UPN 形式的用户名（`jdoe@example.com`）如果找不到用户，会使用 `@` 之前的部分重试一次，因此即使用户名属性
保存的是短名称，用户也可以使用任一形式登录。密码错误时永远不会重试。

同一套设置适用于 Active Directory、OpenLDAP 等目录；从 7.3.0 起可以有 [多个目录](#several-directories)。

---

## 设置

从 7.3.0 起，设置按目录分别保存。**访问 > LDAP** 按查找不带前缀用户名时的顺序列出各个目录：

![访问 > LDAP](../assets/screenshots/ldap.jpg)

| 行菜单 | 作用 |
|---|---|
| 编辑 | 打开该目录的页面 |
| 测试连接 | 使用测试用户名和密码尝试登录，参见 [测试连接](#testing-the-connection) |
| 启用、禁用 | 打开或关闭该目录；`main` 只能关闭，不能删除 |
| 上移、下移 | 更改其在查找顺序中的位置 |
| 删除 | 删除该目录；在 `main` 上显示但不可用 |

添加目录时分四步询问其字段，即其页面上的各个选项卡。**详情** 中包含 **已启用**、**名称** 和 **描述**：

| 选项卡 | 设置 | 含义 |
|---|---|---|
| 凭据 | 凭据 | 必填。[连接 > 凭据](../credentials.html) 中的一个 `ldap` 凭据，保存连接信息，见下文 |
| 用户 | 搜索基准 | 用户搜索开始的 DN，例如 `OU=Users,DC=example,DC=com`。也会搜索其子树 |
| 用户 | 用户名属性 | 与登录名进行匹配的属性：AD 中为 `sAMAccountName`（默认值），OpenLDAP 中为 `uid` |
| 用户 | 邮件属性 | 保存电子邮件地址的属性，通常为 `mail` |
| 用户 | 登录域 | 以 `user@domain` 登录时直接使用此目录的域，参见 [多个目录](#several-directories) |
| 组 | 组属性 | 用户条目中保存组的属性（`memberOf`，默认值），使用组搜索时为 `groups` |
| 组 | 组搜索基准 | 组搜索开始的 DN |
| 组 | 组类 | 组的 objectClass，例如 `group`、`groupOfNames` 或 `posixGroup` |
| 组 | 组成员属性 | 组中列出其成员的属性，例如 `member`、`uniqueMember` 或 `memberUid`；默认为 `member` |
| 组 | 组成员用户属性 | 这些成员值所对应的用户属性，例如 `dn` 或 `uid`；默认为 `dn` |
| 组 | 组筛选 | 正则表达式；只保留名称与之匹配的组。留空则保留所有组 |

最后三个组字段的默认值仅在使用组搜索时生效，见下一节。

`ldap` 凭据保存如何访问目录以及以谁的身份进行搜索：

| 字段 | 含义 |
|---|---|
| 服务器 | 每个字段一个，形式为 `host`、`host:port` 或 `ldaps://host:port`，按此顺序尝试：一个无法访问时，尝试下一个 |
| 端口 | 普通 LDAP 为 `389`，LDAPS 为 `636` |
| 启用 TLS | 使用 LDAPS（`ldaps://`）连接。不支持在 389 端口上使用 StartTLS |
| 忽略证书 | 跳过对服务器证书的验证。仅在 **启用 TLS** 时显示 |
| 证书 | 校验证书时，AnsibleForms 向服务器出示的客户端证书，PEM 格式 |
| CA 证书包 | 校验证书时，签发服务器证书的 CA 证书，PEM 格式 |
| 绑定用户 DN | 用于搜索目录的服务账户的 DN |
| 绑定用户密码 | 其密码，加密保存或从 [密钥库](../secret-stores/) 读取 |

只有管理员可以添加或修改 `ldap` 凭据，参见 [谁可以修改凭据](../credentials.html#who-may-change-a-credential)。
在 7.2.0 及更早版本中，服务器、TLS 和绑定账户是 LDAP 设置中的字段。升级到 7.3.0 时会把它们移入凭据，
参见 [凭据中的地址](../credentials/types.html#addresses-in-credentials)：

| 升级前的目录 | 其服务器的去向 |
|---|---|
| 自带绑定 DN 和密码，没有凭据 | 一个名为 `<directory>-ldap` 的新 `ldap` 凭据，例如 `main-ldap` |
| 有凭据但凭据中没有服务器 | 放入该凭据 |
| 有凭据且凭据中已有其他服务器 | 该凭据的一个副本，名为 `<credential>-<directory>`，目录随后引用该副本 |

名称已被占用时会加上 `-2`、`-3` 等后缀。来自配置种子的目录保持不变：它归种子所有。

---

## 组

组来自以下两个位置之一，由 **组属性** 决定使用哪一个：

- **用户条目的某个属性**，通常为 `memberOf`。这是 Active Directory 以及
  启用了 `memberof` overlay 的 OpenLDAP 的常见设置。
- **组搜索**，用于没有 `memberOf` 的目录。只有同时设置了 **组搜索基准** 和 **组类**
  时才会执行：AnsibleForms 会搜索该类的组中 **组成员属性** 包含用户的
  **组成员用户属性** 的组，并将结果保存在属性 `groups` 中。将 **组属性** 设为 `groups`
  即可使用它。

{: .note }
> 当 **组属性** 为 `memberOf` 时，已配置的组搜索仍会执行，但其结果不会用于角色。

每个组都是一个 DN，AnsibleForms 保留其第一个 CN：`CN=AF-Admins,OU=Groups,DC=example,DC=com` 变为 `AF-Admins`。
然后对该名称应用 **组筛选**，剩下的组加上 `ldap/` 前缀：`ldap/AF-Admins`。

在大型目录中，筛选可以让令牌和作业保持精简；无效的正则表达式会保留所有组，并记录到日志中。

---

## 映射到角色

在 config.yaml 中，LDAP 组写作 `ldap/<group CN>`，LDAP 用户写作 `ldap/<username>`，两者都区分大小写：

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

用户名是目录返回的 **用户名属性** 的值，而不是用户输入的值。
角色选项参见 [角色](../config/roles.html)。

---

## 多个目录

从 7.3.0 起可以有多个目录，每个目录都有自己的服务器、用户和组。目录名称用于区分其成员：

| 目录 | 用户名 | 组 | 在角色中 |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`、`ldap/AF-Admins` |
| 其他任意目录，例如 `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`、`ldap/corp/AF-Admins` |

用户在登录时以 `corp\jdoe` 或 `corp/jdoe` 的形式指定目录，或者使用该目录所拥有域的地址登录。
不带前缀的用户名会按顺序在每个已启用的目录中尝试；当没有名为 `other` 的目录时，像 `other\jdoe` 这样的名称也是如此：
此时会按输入的原样查找。

第一个认识该用户的目录说了算：在那里密码错误就是最终结果，不会再尝试下一个目录，
因为下一个目录中可能有另一个同名的人。无法访问的目录会被跳过。

7.2.0 及更早版本中名为 `default` 的目录从 7.3.0 起改名为 `main`：升级会将其重命名，新安装的实例一开始
就有 `main`。其成员保留短名称，因此引用他们的角色无需修改。`main` 目录不能
重命名，目录名称只能包含字母、数字、`-` 和 `_`。

---

## 测试连接

**测试连接** 会要求输入测试用户名和密码，并使用屏幕上的设置（无论是否已保存）尝试登录。
成功时会显示该用户的目录条目，从中可以看到应使用的确切属性名称和组 DN。

即使测试用户不存在，也会报告成功：连接和绑定账户都正常，只是找不到该用户。
常见错误：

| 消息 | 原因 |
|---|---|
| `Bad server or port (connection failed)` | 主机名无法解析，或端口无法访问。 |
| `Wrong binding credentials` | 目录凭据中的绑定 DN 或密码错误。 |
| `Unable to verify the certificate` | 服务器证书不是由凭据的 CA 证书包签发的。 |
| `Certificate is not valid` | 凭据的证书或 CA 证书包中没有有效的 PEM 证书。 |

---

## Active Directory 示例

此示例通过 LDAPS 连接到两台域控制器，并只保留名称以 `AF-` 开头的组：

| 设置 | 值 |
|---|---|
| 凭据 > 服务器 | `dc01.example.com`，然后是 `dc02.example.com` |
| 凭据 > 端口 | `636` |
| 凭据 > 启用 TLS | 开 |
| 凭据 > 忽略证书 | 关，并配置客户端证书和企业 CA 的 CA 链 |
| 凭据 > 绑定用户 DN | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| 搜索基准 | `OU=Users,DC=example,DC=com` |
| 邮件属性 | `mail` |
| 用户名属性 | `sAMAccountName` |
| 组属性 | `memberOf` |
| 组筛选 | `^AF-` |

`CN=AF-Operators,…` 的成员会匹配包含 `ldap/AF-Operators` 的角色，并以 `jdoe` 或 `jdoe@example.com` 登录。

---

## OpenLDAP 示例

此示例对 `groupOfNames` 条目使用组搜索，因此无需 `memberof` overlay 即可工作：

| 设置 | 值 |
|---|---|
| 凭据 > 服务器 | `ldap.example.com` |
| 凭据 > 端口 | `636` |
| 凭据 > 启用 TLS | 开 |
| 凭据 > 绑定用户 DN | `cn=readonly,dc=example,dc=com` |
| 搜索基准 | `ou=people,dc=example,dc=com` |
| 邮件属性 | `mail` |
| 用户名属性 | `uid` |
| 组属性 | `groups` |
| 组搜索基准 | `ou=groups,dc=example,dc=com` |
| 组类 | `groupOfNames` |
| 组成员属性 | `member` |
| 组成员用户属性 | `dn` |

列在 `cn=af-admins,ou=groups,dc=example,dc=com` 中的用户会获得组 `ldap/af-admins`。对于 `posixGroup` 组，
请使用 **组成员属性** `memberUid` 和 **组成员用户属性** `uid`。

使用 `memberof` overlay 时，请将组搜索字段留空，并将 **组属性** 设为 `memberOf`。

---

## 常见问题

大多数 LDAP 问题都可以归结为以下几种：

- **存在同名的本地用户。** 本地用户会先被检查，因此对于该名称永远不会询问目录。
- **没有组，或组不对。** 组属性必须存在（使用组搜索时为 `groups`）；`memberOf` 不处理嵌套。
- **组名不匹配。** 请使用大小写一致的 `ldap/<CN>`，并检查组筛选是否保留了该组。
- **组 DN 不以 CN 开头。** 只有第一个 `CN=` 值会用作组名，因此每个组 DN
  都必须以 `CN=`（或 `cn=`）开头。
- **证书。** TLS 需要凭据的两个证书字段都已填写，且服务器名称匹配；忽略证书仅用于测试。
- **设置无法保存。** 当目录来自 [配置种子](../seed/managed-objects.html) 时，其页面
  为只读：请改为修改种子文件。

登录失败时显示通用消息。原因由服务器记录在日志中并保存在审计日志里；对于 Active
Directory，原因会从目录的代码转换而来，例如 `Wrong password`、`Account locked` 或 `Password expired`。
