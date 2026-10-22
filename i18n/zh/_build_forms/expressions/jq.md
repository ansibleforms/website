---
layout: default
title: jq 查询
parent: 表达式
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# jq 查询
{: .no_toc }

用 jq 重新整形数据，包括内置函数
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 对对象运行 JSON 查询（jq）

用 jq 表达式重新整形一个对象，例如另一个字段的值：

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

从 7.3.0 起，jq 过滤器最多运行 [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS)（默认 30）秒，
超时即被终止，其输出上限为 64 MB。这适用于 `fn.fnJq` ，也适用于 REST、文件、
凭据和数据库查询函数中的 jq 表达式。

---

## 内置 JQ 函数

所有获取数据的函数都接受 JSON 查询（jq），这是一种处理数据对象和数组的语言。  
处理数据时，您可能需要把字节转换为 KB、MB 或 GB，或者对数字取整。  
为此，AnsibleForms 提供了几个自定义 jq 函数：

- **fn2KB**：字节转 KB
- **fn2MB**：字节转 MB
- **fn2GB**：字节转 GB
- **fnRound0**：保留 0 位小数取整
- **fnRound1**：保留 1 位小数取整
- **fnRound2**：保留 2 位小数取整
- **fnRound**：保留 2 位小数取整

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
