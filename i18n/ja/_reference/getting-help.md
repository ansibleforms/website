---
layout: default
title: ヘルプを得る
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# ヘルプを得る
{: .no_toc }

質問、バグやセキュリティ問題の報告、改善の提案をする場所
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 質問する前に

答えのほとんどはすでに文書化されています。少し調べるだけで、やり取りを 1 往復省けることがよくあります。

1. 各ページの上部にある検索ボックスで、このサイトを検索します。
2. 正確なエラーメッセージを [トラブルシューティング](troubleshooting.html) で調べ、 [FAQ](faq.html) にも目を通します。
3. サーバーログ（ **設定** 、次に **サーバーログ** ）と **ステータス** ページを確認します。設定の問題の多くはここに表示されます。
4. [変更履歴](changelog.html) を確認します。問題は新しいリリースですでに修正されているかもしれません。

---

## 問い合わせ先

依頼の種類ごとに場所が決まっており、すべて GitHub にあります。

| したいこと | 行き先 |
|---|---|
| 質問する、アイデアを共有する | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| バグを報告する | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| 機能を提案する | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| セキュリティ問題を報告する | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new) で非公開に |
| このドキュメントを修正・改善する | 各ページの下部にある **GitHub でこのページを編集** 、または [Web サイトの issue](https://github.com/ansibleforms/website/issues) |

---

## バグを報告する

再現できる報告ほど早く修正されます。バグ報告のテンプレートでは、次の情報を求めています。

* **バージョン** : 上部バーのヘルプ（ **?** ）メニューの **バージョン情報** に表示されます
* **デプロイ方法** : Docker、Docker Compose、Kubernetes、インストーラー（とそのエンジン）、ネイティブインストール、またはソースから
* **再現手順** : 何をしたか、何を期待したか、そして実際に何が起きたか
* **証拠** : サーバーログの関連する行と、問題が目に見える場合はスクリーンショット

フォームの問題の場合は、それを再現する最小限のフォーム定義を含めてください。投稿する前に、ログやフォームからパスワード、トークン、ホスト名、その他の
非公開のデータを取り除いてください。issue とディスカッションは公開されています。

---

## セキュリティ問題を報告する

**公開の issue は決して作成しないでください。** メンテナーだけが見られる [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new) を使ってください。

[セキュリティポリシー](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) に、サポート対象のバージョンと
報告後の流れが記載されています。
