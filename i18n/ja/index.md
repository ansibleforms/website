---
layout: default
title: ホーム
nav_order: 1
description: "AnsibleForms: Ansible による自動化のための、データ駆動型の動的なフォームを作成できます"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc"><span>Ansible</span> のためのセルフサービスフォーム</h1>
    <p class="af-hero-lead">
      Ansible は強力な自動化ツールですが、あくまでコマンドラインのアプリケーションです。また AWX/AAP/Ascender には、
      複数のソースからデータを集めるフォームがありません。AnsibleForms を使うと、データ駆動型の動的なフォームを作成して extravars を生成し、
      それを Ansible、AWX/AAP/Ascender、Semaphore、Rundeck、Jenkins に送ってテンプレートを実行できます。
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">AnsibleForms をインストール</a>
      <a href="first-form.html" class="btn btn-outline">最初のフォームを作成</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="AnsibleForms のダッシュボード">
  </div>
</div>

## 機能

AnsibleForms が Ansible 環境にもたらすものと、1 つのフォームでできることを紹介します。

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>アプリケーション</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>自動化プラットフォーム</strong><span>RTE での playbook、Ascender や Semaphore などでのテンプレート</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>アクセス制御</strong><span>ロールとロールオプション、ローカル、LDAP、Entra ID、OIDC によるログイン</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>スケジュール</strong><span>フォームを後で、または cron スケジュールで実行</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>ジョブ履歴</strong><span>ジョブの追跡、中止、再起動</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>認証情報とシークレット</strong><span>認証情報を保存するか、Vault や CyberArk から読み取る</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Git リポジトリ</strong><span>フォーム、playbook、設定を Git で管理</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>デザイナー</strong><span>検証付きで、フォームを YAML として編集</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API、MCP、チャット</strong><span>スクリプト、AI エージェント、チャットからフォームを起動</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>フォーム</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>連動するドロップダウン</strong><span>ほかのフィールドに応じて変わるドロップダウン</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>式とデータソース</strong><span>データベース、REST API、ファイル、JavaScript からフィールドに値を入れる</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>フィールドの依存関係</strong><span>ほかのフィールドに応じてフィールドを表示、非表示にする</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>検証</strong><span>最小値、最大値、正規表現など。必要に応じてサーバー側でもチェック</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>ワークフローとウィザードフォーム</strong><span>playbook と承認をつなげたり、入力を複数のページに分けたりする</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>構造化フィールド</strong><span>再利用できるサブフォームによるリストとオブジェクト</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>承認ポイント</strong><span>誰かが承認するまでジョブを一時停止</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>通知</strong><span>ジョブのイベントをメール、Slack、Teams、Telegram、Webhook で通知</span></span>
      </li>
    </ul>
  </div>
</div>

## お困りですか?

質問、バグ、セキュリティの報告には、それぞれ専用の窓口があります。

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>トラブルシューティング</strong>
    <span>エラーメッセージとその対処方法を調べる</span>
    <span class="af-card-more">トラブルシューティング &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>質問する</strong>
    <span>コミュニティとメンテナーに質問する</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>バグを報告する</strong>
    <span>再現手順を添えて issue を作成する</span>
    <span class="af-card-more">新しい issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>サポートを受ける</strong>
    <span>伝えるべき情報と、セキュリティ問題の報告方法</span>
    <span class="af-card-more">サポートを受ける &rarr;</span>
  </a>
</div>

