---
layout: default
title: セキュリティ
nav_order: 14
has_children: true
has_toc: false
permalink: /security/
translated_from: f2b18fd1638cb4ccb2401652eafb82e6ce0e82eb
---

# セキュリティ
{: .no_toc }

インスタンスを保護します：管理者アカウント、シークレット、HTTPS、ユーザーとフォームにできること
{: .fs-6 .fw-300 }

---

インスタンスを本番環境向けに準備する管理者と、既存のインスタンスのセキュリティレビューのためのものです。

---

## このセクションの内容

トピックごとに専用のページがあります。

| ページ | 内容 |
|---|---|
| [強化](hardening.html) | 管理者アカウント、サインインの制限、データベース、式、ジョブのデータ、ブラウザーのポリシー、任意の機能、ロールオプション |
| [HTTPS](https.html) | TLS を終端する場所、アプリケーションからの HTTPS の提供、サンプル証明書の置き換え |
| [シークレットと暗号化](secrets.html) | `ENCRYPTION_SECRET` 、 `ACCESS_TOKEN_SECRET` 、トークンの有効期間 |

関連ページ：サインイン方法については [認証](../authentication/) 、すべての起動をサーバー側で確認する [起動時の検証](../launch-validation/) 、
そして [セキュリティの変数](../customization/security.html) 。
