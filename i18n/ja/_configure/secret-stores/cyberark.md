---
layout: default
title: CyberArk
parent: シークレットストア
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

CyberArk の CCP で認証情報を読み取り、PVWA で書き込みます
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

## 認証情報の書き込み

7.6.0 以降、認証情報のユーザーとパスワードを **保存** 時に CyberArk へ書き込めます（[認証情報の書き込み](./#writing-credentials) を参照）。
CCP は読み取り専用のため、AnsibleForms は専用の認証情報でログオンし、PVWA の REST API 経由で書き込みます。

ストアの **オプション** で **書き込みを許可** をオンにし、次を入力します。

| フィールド | 意味 |
|---|---|
| 書き込みを許可 | **保存** 時に認証情報がユーザーとパスワードをこのストアへ書き込めるようにします。既定ではオフです。 |
| 書き込み先のセーフ | 認証情報を書き込めるセーフ（カンマ区切り）、例 `Linux, DB`。書き込みがオンのとき必須です。 |
| PVWA のアドレス | PVWA のベース URL、例 `https://pvwa.example.com`。必須です。 |
| PVWA の資格情報 | 専用の **ユーザーとパスワード** または **API** の認証情報。シークレットストアからは読み取らず、それらのセーフにアカウントを追加しパスワードを変更できる必要があります。必須です。 |
| ログオン方式 | PVWA の資格情報のログオン方法：CyberArk（既定）、LDAP、RADIUS、Windows。 |
| プラットフォーム ID | 追加するアカウントのプラットフォーム、例 `UnixSSH`。新しいアカウントの追加に必要です。 |

参照は読み取りと同じくアカウントを指定します（`Safe=Linux;Object=srv01-root`）。プラットフォームが必要とする場合は `Address=srv01.example.com` を付けます。

- 新しいアカウントは、プラットフォーム、ユーザー名、パスワードとともにセーフへ追加されます。
- 既存のアカウントは **既にあるシークレットを上書きする** にチェックしたときだけ変更されます。まずユーザー名、次にパスワードです。
- PVWA のセッションは書き込みのたびにログオフされます。Privilege Cloud の OAuth サインインには対応していません。

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
