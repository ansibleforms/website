---
layout: default
title: 概念
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# 概念
{: .no_toc }

このドキュメント全体で使う用語と、それぞれの説明ページへのリンク
{: .fs-6 .fw-300 }

---

## 用語集

このドキュメント全体で使う用語です。

| 用語 | 意味 |
|---|---|
| **[フォーム](forms/)** | 入力を集め、プレイブック、テンプレート、またはワークフローを実行する YAML の定義 |
| **[フォームフィールド](formfields/)** | `text` 、 `enum` 、 `checkbox` など、フォームの 1 つの入力。その値は extravar になります |
| **[カテゴリ](config/categories.html)** | 「フォーム」ページに表示されるフォームのツリーのグループ。 `config.yaml` で定義します |
| **[ロール](config/roles.html)** | ユーザーとグループの集まり。フォームには、そのフォームを表示・実行できるロールを列挙します。全員を対象にするには `default` です |
| **[式](expressions/)** | フィールドの値を計算する JavaScript。ブラウザー（ `runLocal: true` ）またはサーバーで実行されます |
| **[Extravars](formfields/)** | フィールドの値から組み立てられ、プレイブックやテンプレートに送られる変数 |
| **[認証情報](expressions/credentials.html)** | `ENCRYPTION_SECRET` で暗号化して保存されたログイン情報。ユーザーとパスワード（およびホスト、ポート、データベース）、または 7.3.0 以降は LDAP ディレクトリ、SSO プロバイダー、ランナー、HashiCorp Vault のアドレスとシークレット |
| **[シークレットストア](secret-stores/)** | 認証情報のユーザーとパスワードを提供する、HashiCorp Vault または CyberArk への接続 |
| **[ジョブ](gui/forms-and-jobs.html)** | フォームの 1 回の実行。ステータス、extravars、出力を持ち、ジョブ履歴に残ります |
| **[ランナー](runners.html)** | ジョブの実行場所。 **接続 > ランナー** で追加します。プレイブックには `rte` 、テンプレートやジョブには `awx` （AWX、または派生の `aap` や `ascender` ）、 `semaphore` 、 `rundeck` 、 `jenkins` を使います。フォームは `runner:` で 1 つを選ぶか、既定の `rte` （プレイブック）または `awx` （テンプレート）のランナーで実行されます |
| **[RTE](rte/)** | ランタイム環境。 `AF_ROLE=rte` で起動した AnsibleForms サーバーで、python と ansible とともに専用のコンテナーで動き、種類 `rte` のランナーのプレイブックを実行します |
| **[承認ポイント](forms/approval.html)** | 承認ロールを持つユーザーが承認または拒否するまで、ジョブを一時停止する箇所 |
| **[ワークフロー](workflows/)** | 成功時、失敗時、または常にでつながれたプレイブック、承認、その他のワークフローのグラフ。AWX の構文で記述します |
| **[マルチステップフォーム](forms/multistep.html)** | 7 以降は非推奨。複数のプレイブックやテンプレートを順に実行するフォームで、ワークフローが置き換えます |
| **[通知チャネル](notification-channels.html)** | 通知や承認依頼の送り先となるメールサーバー、Slack や Teams の Webhook、Telegram のチャット、または Webhook |
| **[デザイナー](designer/)** | フォーム、プレイブック、インベントリ、ワークフローを編集するブラウザー上のエディター。一度に 1 人が使います |
| **[サブフォーム](forms/subform.html)** | `list` フィールドの行や `yaml` フィールドのオブジェクトを記述する、再利用可能なフィールドの集まり |
| **[config.yaml](config/)** | カテゴリ、ロール、定数を記述するファイル。フォームはそれぞれ専用のファイルに置きます |
| **[設定シード](seed/)** | ランナーや認証情報などの管理オブジェクトを宣言する YAML ファイル（ `CONFIG_SEED_PATH` ） |
| **[永続フォルダー](customization/paths.html)** | 再起動やアップグレードをまたいで AnsibleForms が保持しなければならないファイルを置くフォルダー |
