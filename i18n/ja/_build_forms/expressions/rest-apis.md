---
layout: default
title: REST API
parent: 式
nav_order: 3
translated_from: e4ceac62125b53a88d479bf7f2a0e7230edce2b2
---

# REST API
{: .no_toc }

Basic、トークン、カスタム認証で REST API を呼び出す
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Basic 認証による REST API

保存された認証情報のユーザーとパスワードで REST API を呼び出します。

```javascript
fn.fnRestBasic(
  'get',
  'https://resturl/api/',
  '',
  'name_of_credential_in_database',
  '[.records[] | {name:.name, email:.email, spouse:.relations.spouse}]',
  'name',
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted and transformed by javascript.

// fn.fnRestBasic(method,url,body,credentialname,jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - credential-name : it will lookup the credentials as you have saved in the gui
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort object : a sort object to order the result
// - hasBigInt : a boolean indicating if it should convert Int64 to string
```

---

## トークン認証による REST API

式に記述した Bearer トークンで REST API を呼び出します。

```javascript
fn.fnRestJwt(
  'get',
  'https://resturl/api/',
  '',
  'your_jwt_token_in_text',
  '[.records[] | {name:.name, age:.age}]',
  ['age','name'],
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted, first by age, then by name

// fn.fnRestJwt(method,url,body,token,jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - token : it will be add as a Bearer Authorization header
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sort object to sort the result
// - hasBigInt : a boolean indicating if it should convert Int64 to string
// - tokenPrefix : a prefix, defaults to 'Bearer' (v5.0.0)
```

---

## 保護されたトークン認証による REST API

保存された認証情報から取得した Bearer トークンで REST API を呼び出します。トークンがフォームに現れることはありません。

```javascript
fn.fnRestJwtSecure(
  'get',
  'https://resturl/api/',
  '',
  'name_of_credential_in_database',
  '[.records[] | {name:.name, age:.age}]',
  ['age','name'],
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted, first by age, then by name

// fn.fnRestJwtSecure(method,url,body,token,jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - credential_name : Encrypted credential will be looked up.  The password will be the token.
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sort object to sort the result   
// - hasBigInt : a boolean indicating if it should convert Int64 to string 
// - tokenPrefix : a prefix, defaults to 'Bearer' (v5.0.0)
```

---

## カスタムヘッダーによる REST API

その他の種類の認証のために、独自のヘッダーで REST API を呼び出します。

```javascript
fn.fnRestAdvanced(
  'get',
  'https://resturl/api/',
  '',
  {'a_custom_http_header':'your_value','Authorization':'basic base64(my_rest_credential)'},
  '.records[].name',
  {name:{ignoreCase:true,direction:'desc'}},
  false,
  false
)

// output : a full json object coming from rest, json transformed with jq, result sorted descending by name

// fn.fnRestAdvanced(method,url,body,{myheader:'value'},jq-expression,sort-object)
// - method : get,post,put,delete
// - url : url to restapi (can for example contain a placeholder like 'https://$(serverfield.fqdn)/api/'
// - body : in case of post and put
// - headers: an object of headers
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sorting object to order the results
// - hasBigInt : a boolean indicating if it should convert Int64 to string
// - raw : return data and response_headers  
  
// 3 function-placeholders are allowed in the headers:
// - base64(credential_name) : will create a base64 encoded "username:password".  prefix with "basic" if required
// - username(credential_name) : will add the username of the credential
// - password(credential_name) : will add the password of the credential
```

---

## 証明書とタイムアウト

7.3.0 以降、すべての REST ヘルパー関数 ( `fnRestBasic`、 `fnRestAdvanced`、 `fnRestJwt`、 `fnRestJwtSecure` ) は、エンドポイントの TLS
証明書をチェックし、一定時間が過ぎると待機をやめます。

| 設定 | 変更される内容 |
|---|---|
| [`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS) | `1` で証明書のチェックをスキップします。7.2.0 までは一度もチェックされていませんでした。 `0` のままにして、代わりに `NODE_EXTRA_CA_CERTS` でプライベート CA を信頼させてください |
| [`REST_TIMEOUT_SECONDS`](../customization/security.html#env_REST_TIMEOUT_SECONDS) | 呼び出しが応答を待つ時間。既定は 60 秒です。応答しないエンドポイントは、フィールドを止めたままにせず、フィールドを失敗させます |

7.3.0 以降、エンドポイントが自己署名証明書を使うフィールドは、どちらかの設定を行うまで証明書エラーで失敗します。
[REST 呼び出しと jq](../customization/security.html#rest-calls-and-jq) では、両方の設定と、すべての REST 呼び出しでまとめてプライベート CA を信頼させる方法を説明しています。
[`fn.fnParseHtmlWithRegex`](remote.html#parse-html-page) は REST ヘルパーではありません。両方の設定を無視し、常に
証明書をチェックし、最大 30 秒待ちます。
