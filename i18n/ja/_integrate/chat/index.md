---
layout: default
title: チャットアシスタント
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# チャットアシスタント
{: .no_toc }

会話を通じてフォームを入力し、起動します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

これを有効にする管理者と、これとチャットするユーザー向けです。会話を通じてフォームを入力し、起動します。

すべてのページにあるチャットボタンでアシスタントが開きます。アシスタントは適切なフォームを見つけ、足りない情報を尋ね、フォーム自身の
選択肢をボタンとして示し、 **起動** ボタン付きの概要を表示します。ジョブが開始されるのは、ユーザーがそのボタンをクリックしたときだけです。

---

## 仕組み

アシスタントはサーバーを介して AI モデルと通信し、サーバーはブラウザーと同じフォームエンジンを使ってモデルの要求に応えます。

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **モデルの呼び出しはサーバーから行われます。** ブラウザーからは行われないため、API キーはサーバーに留まります
  （ [プロバイダー](providers.html) を参照）。
- **モデルは何も起動できません。** モデルが用意するのは 1 回限りの概要で、起動の前に再チェックされます。
- **対象を選ぶのはユーザーです。** 選択肢や必須の名前はユーザーから来るもので、モデルから来ることはありません。
- **「yes」や「launch」と入力しても何も起きません。** ジョブを起動するのはボタンだけです。

---

## このセクションの内容

トピックごとに個別のページがあります。

| ページ | 内容 |
|---|---|
| [有効にする](switching-it-on.html) | アシスタントを有効にし、フォームをアシスタントで使えるようにする |
| [プロバイダー](providers.html) | アシスタントの背後にある言語モデルとプロキシ |
| [プライバシーと制限](privacy-and-limits.html) | ネットワークの外に出るもの、ユーザーごとの制限 |
| [再起動と監査](relaunching-and-audit.html) | チャットからの再起動、監査証跡、制限事項 |
