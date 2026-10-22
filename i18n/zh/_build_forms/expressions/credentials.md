---
layout: default
title: 凭据
parent: 表达式
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# 凭据
{: .no_toc }

在表达式中读取已保存的凭据
{: .fs-6 .fw-300 }

---

按名称或正则表达式读取已保存的凭据，并可指定备用凭据：

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

首先尝试精确名称。如果没有凭据使用该名称，就把该名称当作正则表达式匹配，最后再尝试备用凭据。

#### 受角色限制

当用户的某个角色在 `config.yaml` 中列出了 `credentials` 时，`fn.fnCredentials` 只返回该角色
允许的凭据：用角色的模式去匹配找到的凭据名称（无论是按名称、正则表达式还是备用凭据找到的），
其他凭据一律拒绝。没有该列表的角色不做限制，管理员也从不受限。

#### 来自密钥库的凭据

指定了[密钥库](../secret-stores)的凭据，会在运行时从该密钥库获取其 `user` 和 `password` 。
`fn.fnCredentials('myapp')` 照常可用，无需任何改动。

在任何接受凭据名称的地方，也可以不经凭据行直接读取密钥
（包括 `fnRestBasic` 、 `fnRestJwtSecure` 以及 `fnRestAdvanced` 的请求头替换）：

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

密钥中的键按[键名](../secret-stores#key-names)中的说明进行映射。
结构不同的密钥，可以用作为第三个参数的 `jq` 表达式重新整形：

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
