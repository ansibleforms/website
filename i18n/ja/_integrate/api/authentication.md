---
layout: default
title: 認証
parent: REST API
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# 認証
{: .no_toc }

ログイン、トークンの更新、長期間有効なトークンの利用
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

すべての呼び出しには、 `Authorization` ヘッダーにアクセストークンが必要です。トークンはログインして取得し、
リフレッシュトークンで更新し続けます。

---

## ログインする

ユーザー名とパスワードを使い、Basic 認証でログインします。

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

レスポンスには、アクセストークンとリフレッシュトークンの 2 つのトークンが含まれます。

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## API を呼び出す

すべての呼び出しで、アクセストークンを Bearer トークンとして送ります。

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## トークンを更新する

アクセストークンには有効期限があります（ `ACCESS_TOKEN_EXPIRATION` 、既定は 30 分）。パスワードを使わずに、
リフレッシュトークンで新しいトークンを取得します。

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

レスポンスには、ログインと同じ形式で新しいペアが含まれます。リフレッシュトークンは 1 回しか使えないので、次の更新のために新しいものを保存してください。

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## 長期間有効なトークン

無人で実行するスクリプトでは、より長く有効なトークンを使えます。7.3.0 以降は、ロールのオプション `allowApiTokens` が必要です。

* [プロフィール > API トークン](../profile/api-token.html) で作成します。
* または、クエリパラメーター `expiryDays` を付けてログインし、その日数だけ有効なトークンを取得します。

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` は URL からのみ読み取られ、本文からは読み取られません。ロールに `allowApiTokens` がないユーザーの場合は無視され、
ログインでは通常の有効期間のトークンが返されます。 `expiryDays=never` には `extendedTokenExpiration` も必要です。クエリパラメーター `name`
（ `?expiryDays=90&name=nightly-backup` ）を追加すると、ユーザーのトークン一覧でトークンに名前が付きます。

長期間有効なトークンの有効期間は、最大で [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) 日（既定は 90 日）です。
これより長い `expiryDays` は、 `never` でない限りこの値に切り詰められます。更新すると通常のトークンが返されるため、期限が切れたらもう一度ログインしてください。

### サインイン中のユーザーのトークン

プロフィールの **API トークン** 画面は次のエンドポイントを使います。パスワードが不要なため、SSO を含むどのアカウントでも動作します。

| 呼び出し | 内容 |
|---|---|
| `GET /api/v2/profile/tokens` | 自分の API トークンを、 `sid` 、 `name` 、作成日時、有効期限、最終使用とともに一覧表示します |
| `POST /api/v2/profile/tokens` | 現在のセッションからトークンを作成します。本文には `expiryDays` （数値または `never` ）と、省略可能な `name` を指定します |
| `DELETE /api/v2/profile/tokens/{sid}` | 自分のトークンの 1 つを取り消します |

`POST` は、API トークンで呼び出した場合（トークンで別のトークンは作れません）、 `allowApiTokens` がない場合、またはセッションのサインインから
10 分以上経っている場合（コード `sign_in_again` ）に `403` を返します。その場合は先にもう一度サインインしてください。最大値を超える有効期間には `400` を返します。

---

## トークンが早く失効する場合

長期間有効かどうかにかかわらず、次のいずれかが起きると、トークンは有効期限より前に使えなくなります。

* **そのセッションのログアウト** : そのトークンで `POST /api/v2/auth/logout` を呼び出すと、そのログインのトークンだけが失効します。
  ブラウザーでログアウトしても、スクリプトのトークンは失効しません。
* **パスワードの変更** : ユーザーが自分のパスワードを変更するか、管理者がパスワードを設定した場合です。それ以前に発行されたトークンはすべて拒否されます。
* **ユーザーの削除またはブロック** : ローカルユーザーを削除するか、ユーザーをブロックすると、そのユーザーのすべてのトークンが失効します。管理者は
  LDAP や SSO のユーザーのセッションを終了することもできます。

拒否されたトークンには `401` が返されます。パスワードが変わった場合は新しいパスワードで、もう一度ログインしてください。

---

## 実行のたびにログインするスクリプト

ログインとトークンのエンドポイントは、大量のリクエストやパスワードの推測から保護されています。実行のたびにログインするスクリプトでは、
次の制限を把握しておいてください。

| 制限 | 既定値 | 起きること |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 1 つのアドレスから 1 分あたり 120 リクエスト | ログイン、ログアウト、更新、SSO のエンドポイント、 `PUT /api/v2/profile` （パスワードの変更）、 `POST` または `DELETE /api/v2/profile/tokens` が `429` を返します |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 連続 5 回のログイン失敗 | アカウントが [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) （15）分ロックされ、すべてのログインが `429` を返します |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 1 つのアドレスから 30 回のログイン失敗 | 期間が終わるまで、そのアドレスからのすべてのログインが `429` を返します |

`429` には、待つべき秒数を示す `Retry-After` ヘッダーが付きます。すぐに再試行せず、止めて待ってください。ロックされたアカウントは
ロックが解除されるまで正しいパスワードも拒否するため、間違ったパスワードを使うスクリプトは、そのユーザーを全員に対してロックアウトしてしまいます。
パスワード変更（ `PUT /api/v2/profile` ）で現在のパスワードを間違えた場合もログイン失敗として数えられ、ロックされたアカウントは
パスワードを変更できません。ログインに成功するとアカウントの失敗回数はリセットされ、管理者がパスワードを設定した場合もリセットされます。

これらの制限に引っかからないよう、呼び出しのたびにログインするのではなく、一度ログインしてトークンを再利用するか、長期間有効なトークンを
使ってください。リバースプロキシの背後では、サーバーがクライアントのアドレスを認識できるよう [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) を設定してください。
設定しないと、すべてのクライアントが 1 つとして数えられます。
