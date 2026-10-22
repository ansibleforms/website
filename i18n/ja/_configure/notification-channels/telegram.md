---
layout: default
title: Telegram
parent: 通知チャネル
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Telegram のチャットに投稿するボット
{: .fs-6 .fw-300 }

Telegram チャネルは、チャットに投稿するボットです。 **認証情報** ステップには **ボットトークン** が、 **ボット** ステップにはそれ以外の設定があります。

| フィールド | 意味 |
|---|---|
| ボットトークン | [接続 > 認証情報](../credentials.html) の **api** 認証情報で、パスワードが BotFather から得たボットトークンのもの。 |
| チャット ID | ボットが投稿するチャット、グループ、チャネル。グループやチャネルの場合は負の数です。 |
| Bot API アドレス | 独自の Bot API サーバー。空の場合は `api.telegram.org` 。 |
