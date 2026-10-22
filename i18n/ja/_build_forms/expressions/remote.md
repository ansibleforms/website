---
layout: default
title: リモート式
parent: 式
nav_order: 2
translated_from: 8d0f7560216da4a428e1935ac2b6de7b5428c243
---

# リモート式
{: .no_toc }

日付、ネットワーク、ファイル、SSH、連番の名前のためのサーバー側の関数
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

次の例は、フィールドのプロパティ `runLocal: false` (既定) で実行されます。  
サーバー側で評価されます。

サーバーでコードを評価することはセキュリティ上のリスクになるため、式はサニタイズされ、AnsibleForms に付属する関数と
[自分で追加した関数](#your-own-functions) に制限されます。  
サーバー側の式は、ファイル、REST API、SSH コマンドなどのデータソースから情報を取得するためのものです。

{: .important }
サーバー側の組み込み関数には `fn.` が付き (たとえば `fn.fnRestBasic` )、自分で追加した関数には `fnc.` が付きます。

---

## 日付と時刻を操作する

[Day.js](https://day.js.org) で日付と時刻を扱います。

```javascript
fn.fnTime().diff(fn.fnTime('2019-10-01'),'day') // number of days between now and 2019-10-01

// This is the core implementation of https://day.js.org
```

---

## IP から CIDR の情報を取得する

IP アドレスとネットマスクからサブネットを求め、どのアドレスがそこに属するかをチェックします。

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

## SSH の出力を取得する

SSH でリモートホスト上のコマンドを実行し、その出力を使います。

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

## ディレクトリ内のファイルを一覧表示する

AnsibleForms サーバー上のディレクトリのファイルを一覧表示します。必要に応じて再帰的に、絞り込んで表示できます。

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

## HTML ページを解析する

HTML ページを取得し、正規表現に一致する部分を抽出します。

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

ページは REST 関数と同じく、 [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) と
[`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) の制約のもとで取得されます。REST 関数とは異なり、
`REST_IGNORE_CERTS` と `REST_TIMEOUT_SECONDS` は無視され、常に証明書をチェックし、最大 30 秒待ちます。

---

## DNS の情報を取得する

ドメインの DNS レコードを解決します。

```javascript
fn.fnDnsResolve('ansibleguy.com','A')

// fn.fnDnsResolve(fqdn,type)
// - fqdn : a fully qualified domain name
// - type : the type of dns record (A,AAAA,MX,NS,CNAME,TXT,SRV,PTR)
```

---

## JSON ファイルを読み取る

サーバー上の JSON ファイルを読み取ります。必要に応じて jq で絞り込めます。

```javascript
fn.fnReadJsonFile('/tmp/file.json','.[].name')

// fn.fnReadJsonFile(path,jq-expression)
// - path : path to json file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## YAML ファイルを読み取る

サーバー上の YAML ファイルを読み取ります。必要に応じて jq で絞り込めます。

```javascript
fn.fnReadYamlFile('/tmp/file.yaml','.[].name')

// fn.fnReadYamlFile(path,jq-expression)
// - path : path to yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
```

---

## 連番付きの名前を取得する

連番付きの文字列 (server001、server002 など) の配列から、次に使える名前を求める必要がある場合があります。  
この関数は、ローカル式としても ( `fn.` を付けずに) 使用できます。

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

サーバーでは、最初の引数が配列でない場合、 `fn.fnGetNumberedName` はエラーで失敗します。ローカル式
( `fn.` なし) の場合は、代わりに既定値を返します。

---

## 独自の関数

独自の JavaScript 関数を `custom.js` に追加し、サーバーの式で `fnc.` を付けて呼び出します。

このファイルは関数のオブジェクトをエクスポートします。イメージに同梱されているファイルには、2 つの例が含まれています。

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

同じように、 `jq.custom.definitions` には独自の jq の定義を置きます。これらはサーバーが実行するすべての jq クエリの先頭に
追加されるため、どの関数の [jq クエリ](jq.html) からも使えます。

コンテナーでは、両方のファイルをイメージ内のファイルの上にマップして再起動します。これらはサーバーの起動時に読み込まれます。

```yaml
volumes:
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
```

{: .warning }
> カスタム関数は、式から呼び出されるたびに、サーバープロセスの中でその権限で実行されます。
> [サニタイザー](index.html#security-concerns) は、式が `fn.` と `fnc.` の関数だけを呼び出していることをチェックしますが、
> 関数が引数をどう扱うかはお客様次第です。
