---
layout: default
title: プロフィール
nav_order: 4
description: アカウント、個人設定、パスワード、権限、API トークン
has_children: true
has_toc: false
permalink: /profile/
translated_from: f2ec61e6df09174e802478963ba70ff7dee51098
---

# プロフィール
{: .no_toc }

アカウント、個人設定、パスワード、権限、API トークン
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

すべてのユーザー向け: 自分のアカウント、個人設定、パスワード、権限、API トークンについて説明します。

プロフィールは、右上のアバターから **プロフィール** を選んで開きます。

---

## ビューを開く

左側のメニューには、プロフィールのビューがアルファベット順に並んでいます。各ビューには固有のアドレスがあるため、
直接リンクできます。

| ビュー | アドレス |
|---|---|
| アカウント | `/profile/account` |
| API トークン | `/profile/token` |
| パスワード | `/profile/password` |
| 権限 | `/profile/permissions` |
| 個人設定 | `/profile/preferences` |

`/profile` だけを指定すると、メニューの最初のビューが開きます。ロールで許可されていないビューは表示されず、そのアドレスを開くと代わりに最初の
ビューが開きます。 **API トークン** は、ロールのいずれかに `allowApiTokens` ロールオプションがある場合にだけ表示されます。

---

## このセクションの内容

各トピックはそれぞれのページで説明しています。

| ページ | 内容 |
|---|---|
| [アカウント](account.html) | どのユーザーとしてサインインしているか |
| [個人設定](preferences.html) | 言語、テーマ、タイムゾーン、日付形式、デスクトップ通知 |
| [パスワード](password.html) | ローカルアカウントのパスワードを変更する |
| [権限](permissions.html) | ロールで何が許可されているか |
| [API トークン](api-token.html) | スクリプトや AI エージェント用のトークンを作成する |
