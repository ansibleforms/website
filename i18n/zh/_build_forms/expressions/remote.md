---
layout: default
title: 远程表达式
parent: 表达式
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# 远程表达式
{: .no_toc }

用于日期、网络、文件、SSH 和编号名称的服务器端函数
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

以下示例使用字段属性 `runLocal: false` （默认）运行。  
它们在服务器端求值。

由于在服务器上执行代码存在安全风险，表达式会经过清理，并且只能使用
AnsibleForms 自带的函数以及[您自己添加的函数](#your-own-functions)。  
服务器端表达式用于从文件、REST API 和 SSH 命令等数据源获取信息。

{: .important }
内置的服务器端函数以 `fn.` 为前缀（例如 `fn.fnRestBasic` ），您自己的函数以 `fnc.` 为前缀。

---

## 处理日期和时间

通过 [Day.js](https://day.js.org) 处理日期和时间：

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## 从 IP 获取 CIDR 信息

获取某个 IP 地址和子网掩码所在的子网，并检查哪些地址属于该子网：

```javascript
fn.fnCidr('172.16.0.1','255.255.0.0')

// fn.fnCidr(ip,netmask)
// - ip : an ip address
// - netmask : a netmask
//  
// it will return the Cidr subnet information as well as expose a `contains` method to check whether an ip is part of this subnet.
// {
//   "networkAddress":"172.16.0.0",
//   "firstAddress":"172.16.0.1",
//   "lastAddress":"172.16.255.254",
//   "broadcastAddress":"172.16.255.255",
//   "subnetMask":"255.255.0.0",
//   "subnetMaskLength":16,
//   "numHosts":65534,
//   "length":65536,
//   "contains":(ip)=>{return ...}
// }
```

---

## 获取 SSH 输出

通过 SSH 在远程主机上运行命令并使用其输出：

```javascript
fn.fnSsh('root','172.16.0.1','ls -la')

// fn.fnSsh(user,host,command,jq-expression,timeoutSeconds)
// - user : the ssh user
// - host : the host
// - command : the command to trigger by ssh, as the remote host's shell reads it
// - jq-expression : an optional jq-expression (https://jqplay.org), applied to the output lines
// - timeoutSeconds : an optional time limit, 60 seconds by default; running out of time is an error
//
// it returns the output lines (stdout and stderr) and a last line exit(<code>) with the exit code.
// ssh itself is started without a local shell, so the user and host can never become a second local command.
//
// You must use 'known_hosts' and 'public-key' to setup non-interactive password-less authentication.
// In the settings you can find the public-key and add your target-host to known_hosts
```

---

## 列出目录中的文件

列出 AnsibleForms 服务器上某个目录中的文件，可选择递归并进行筛选：

```javascript
fn.fnLs('/tmp',{ recursive: true, regex: '.*\\.log$', metadata: true })

// fn.fnLs(path,options)
// - path : path to directory
// - options : recursive:boolean, regex:string ,metadata:boolean
//   - recursive : whether to list files recursively
//   - regex : a regular expression, matched against the path relative to the listed directory
//   - metadata : whether to return objects with file metadata (path, name, type, size, created, modified, ...)
//
// directories are always listed too, with a trailing / (such as 'logs/'), and the regex sees that slash as well
```

---

## 解析 HTML 页面

获取一个 HTML 页面，并提取与正则表达式匹配的部分：

```javascript
fn.fnParseHtmlWithRegex('https://ansibleguy.com','<h2.*?>(.*?)</h2>','g')

// fn.fnParseHtmlWithRegex(url,regex,flags,credential)
// - url : url to html page
// - regex : a regular expression, groups ( ) are optional
// - flags : regex flags (such as g,i,m), defaults to 'g'; without g only the first match is returned
// - credential : an optional credential name, used for basic authentication
//                (a credential without both a user and a password is ignored, the page is fetched without authentication)
//
// it will grab the html source and return an array with one object per match, at most 10000 :
// { fullMatch, groups (the numbered group matches), namedGroups }
```

页面的获取受 [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) 和
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) 约束，与 REST 函数相同。但与它们不同的是，它忽略
`REST_IGNORE_CERTS` 和 `REST_TIMEOUT_SECONDS` ：它始终校验证书，最多等待 30 秒。

---

## 获取 DNS 信息

解析某个域名的 DNS 记录：

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## 读取 JSON 文件

读取服务器上的 JSON 文件，可选择用 jq 筛选：

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## 读取 YAML 文件

读取服务器上的 YAML 文件，可选择用 jq 筛选：

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## 获取带递增编号的名称

在一组带递增编号的字符串中（server001、server002……），您可能需要找出下一个可用的名称。  
此函数也可作为本地表达式使用（不带 `fn.` 前缀）。

```javascript
fn.fnGetNumberedName(['server001','server002','server005'],'server###','server001',false)
// result : "server006"

fn.fnGetNumberedName(['server001','server002','server005'],'server###','server001',true)
// result : "server003"

fn.fnGetNumberedName($(fieldlist),'server###','server001',true)
// use another expression field as input for the array

// fn.fnGetNumberedName(array,pattern,default,fillgaps)
// This function searches for a numbered pattern in a list of string, 
// increases the highest number and returns a name like the pattern
// - array : an array object, you can use a placeholder to an expression where you know it's an array
// - pattern : a string that hold the # as a digit
// - default : if no value is found, return this default
// - fillgaps : a boolean to indicate it can fill gaps in the numbers, 1,2,3,6 => 4
```

在服务器上，当第一个参数不是数组时， `fn.fnGetNumberedName` 会报错失败。而本地表达式
（不带 `fn.` ）则返回默认值。

---

## 您自己的函数

把您自己的 JavaScript 函数添加到 `custom.js` 中，然后在服务器表达式中用前缀 `fnc.` 调用它们。

该文件导出一个由函数组成的对象。镜像自带的文件包含两个示例：

```javascript
import logger from "../lib/logger.js";

const fnSum = function(a,b) {
  logger.debug("[fnSum] sum is happening")
  return a+b
};
const fnMultiply = function(a,b) {
  logger.debug("[fnMultiply] multiply is happening")
  return a*b
};

export default {
  fnSum,
  fnMultiply
};
```

```yaml
- name: total
  type: expression
  expression: fnc.fnSum($(disk_count), 10)
```

同样， `jq.custom.definitions` 存放您自己的 jq 定义。服务器运行的每个 jq 查询前面都会加上这些定义，
因此每个函数的 [jq 查询](jq.html)都可以使用它们。

在容器中，把这两个文件映射覆盖镜像中的同名文件，然后重启；服务器启动时会读取它们：

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> 每当表达式调用自定义函数时，它都会在服务器进程内以该进程的权限运行。
> [清理器](index.html#security-concerns)只检查表达式是否只调用了 `fn.` 和 `fnc.` 函数；至于
> 函数如何处理其参数，则由您负责。
