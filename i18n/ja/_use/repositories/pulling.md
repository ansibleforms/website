---
layout: default
title: 変更のプル
parent: Git リポジトリ
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# 変更のプル
{: .no_toc }

スケジュール、手動、API によるプルと、ローカルの変更
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 変更のプル

リポジトリは、スケジュールに従って、起動時に、ページから、または API を通じてプルされます。Webhook のエンドポイントはありません。

| トリガー | 方法 |
|---|---|
| スケジュール | **定期プルを有効にする** と **プルのスケジュール** 。たとえば `0 * * * *` で 1 時間ごと |
| 起動時 | **アプリ起動時にプル** で、リポジトリをクローンするか、すでにクローン済みならプルします |
| 設定ページ | 行メニューの **プル** 、または一覧の上の **すべてプル** |
| デザイナー | **読み込み (リポジトリ)** 。フォームリポジトリをプルしてデザイナーを再読み込みします。デザイナーのロックを取得したときにも、先にすべてのフォームリポジトリがプルされます |
| API | `POST /api/v2/repository/<name>/pull` ( `showSettings` または `showConnectionsSettings` ) または `POST /api/v2/forms-repos/pull/<name>` (下記参照) |

### パイプラインや Webhook からプルする

AnsibleForms には専用の Webhook 受信機能はありませんが、CI ジョブや git サーバーの Webhook からプルのエンドポイントを呼び出せます。

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

トークンは [API トークン](../profile/api-token.html) の説明に従い、ロールに `showSettings` または
`showConnectionsSettings` を持つユーザーで作成します。 `/api/v2/forms-repos/pull/<name>` には代わりに `showDesigner` と `allowFormDesign` が必要で、デザイナーが
有効になっている必要があります ( [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) )。 `GET /api/v2/repository/<name>` は
`head`、 `status`、 `output` を返すため、パイプラインはプルの後にインスタンスがどのコミットで動いているかを確認できます。

### ローカルの変更

プルによって、まだプッシュされていない作業が上書きされることはありません。そのため、定期プルは実行前に作業ツリーを確認します。

作業ツリーに未コミットの変更や未プッシュのコミットがある間、またはデザイナーが
デザイナーのロックを保持している間は、定期プルはスキップされます。競合する変更がある作業ツリーを手動でプルすると、次のエラーで失敗します。

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

変更をプッシュするか、行メニューの **リセット** で破棄してください。リセットは作業ツリーを削除して再度クローンします。
