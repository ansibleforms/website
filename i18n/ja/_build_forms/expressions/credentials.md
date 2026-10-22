---
layout: default
title: 認証情報
parent: 式
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# 認証情報
{: .no_toc }

式の中で保存された認証情報を読み取る
{: .fs-6 .fw-300 }

---

保存された認証情報を、名前または正規表現で、フォールバック付きで読み取ります。

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

まず完全一致の名前が試されます。その名前の認証情報がない場合は、名前が正規表現として使われ、その後フォールバックが試されます。

#### ロールによる制限

ユーザーのロールのいずれかが `config.yaml` で `credentials` を列挙している場合、 `fn.fnCredentials` は、そのようなロールが許可する認証情報だけを
返します。ロールのパターンは、(名前、正規表現、フォールバックのいずれかで) 見つかった認証情報の名前と照合され、
それ以外は拒否されます。このリストを持たないロールは制限せず、管理者が制限されることはありません。

#### シークレットストアの認証情報

[シークレットストア](../secret-stores) を指定した認証情報は、実行時にそのストアから `user` と `password` を
取得します。 `fn.fnCredentials('myapp')` はそのまま動作します。

認証情報の名前を受け付ける場所であればどこでも ( `fnRestBasic`、 `fnRestJwtSecure`、 `fnRestAdvanced` のヘッダー置換を含む)、
認証情報の行がなくてもシークレットを読み取れます。

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

シークレットのキーは、 [キー名](../secret-stores#key-names) で説明しているとおりに対応付けられます。
形式の異なるシークレットは、3 番目の引数に `jq` 式を指定して整形します。

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
