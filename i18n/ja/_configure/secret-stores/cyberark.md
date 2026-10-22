---
layout: default
title: CyberArk
parent: シークレットストア
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

CyberArk Central Credential Provider（CCP）から認証情報を読み込みます
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **試験的。** 実際の CyberArk 環境ではまだテストされていません。結果をぜひお知らせください。

CCP は、CyberArk の Application Access Manager の REST インターフェースです。

---

## ストアのフィールド

[すべてのストアにあるフィールド](./#adding-a-store) に加えて、CyberArk ストアには次のフィールドがあります。

| フィールド | 意味 |
|---|---|
| 認証情報 | [接続 > 認証情報](../credentials.html) の **CyberArk** 認証情報。CCP のベース URL（例： `https://ccp.example.com` 。 `/AIMWebService/api/Accounts` が付加されます）、その TLS の設定、AppID（CyberArk で AnsibleForms 用に定義したアプリケーション）、そして AppID が必要とする場合に限り PEM のクライアント証明書とキーを保持します。 |

---

## シークレットの参照

シークレットの参照は、アカウントを `;` 区切りのキーと値の組で特定します。

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- 使えるキー： `Safe` 、 `Folder` 、 `Object` 、 `UserName` 、 `Address` 、 `Database` 、 `PolicyID` 、
  `Reason` 、 `Query` 、 `QueryFormat` 、 `ConnectionTimeout` 、 `FailRequestOnPasswordChange` 。
- `Query=` は参照の残りをネイティブの CCP クエリとして渡します。ほかの値を設定しない限り、 `QueryFormat=Exact`
  が使われます。
- 参照内の `AppID` は無視されます。常にストアの AppID が使われます。
- アカウントのパスワード（ `Content` ）がパスワードになり、 `UserName` 、 `Address` 、 `Port` 、
  `Database` がユーザー、ホスト、ポート、データベース名を埋めます。

---

## 追加オプション

ストアの追加オプションは JSON オブジェクトで設定します。

| キー | 意味 |
|---|---|
| `reason` | 参照に `Reason` がない場合に、CyberArk の監査用として `Reason` で送られます。 |
| `check_ref` | **接続テスト** が実際に読み込む参照。これがない場合、テストは CCP が応答して AppID を受け入れることだけを確認します。 |
| `timeout_ms` | リクエストのタイムアウト。既定は 10000。 |

たとえば、理由を送り、 **接続テスト** でプローブ用のアカウントを読み込ませるには次のようにします。

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
