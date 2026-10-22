---
layout: default
title: 首页
nav_order: 1
description: "AnsibleForms：为 Ansible 自动化构建动态的、数据驱动的表单"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">面向 <span>Ansible</span> 的自助服务表单</h1>
    <p class="af-hero-lead">
      Ansible 是一款强大的自动化工具，但它终究是一个命令行应用程序，而 AWX/AAP/Ascender 缺少
      能从多个来源收集数据的表单。AnsibleForms 让您可以构建动态的、数据驱动的表单，生成 extravars，
      并将其发送到 Ansible、AWX/AAP/Ascender、Semaphore、Rundeck 或 Jenkins，在那里执行模板。
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">安装 AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">构建您的第一个表单</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="AnsibleForms 仪表板">
  </div>
</div>

## 功能

AnsibleForms 能为您的 Ansible 环境带来什么，以及单个表单能做什么：

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>应用程序</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>自动化平台</strong><span>在 RTE 上运行 playbook，在 Ascender、Semaphore 等平台上运行模板</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>访问控制</strong><span>角色和角色选项，支持本地、LDAP、Entra ID 和 OIDC 登录</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>调度</strong><span>稍后运行表单，或按 cron 调度运行</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>作业历史</strong><span>跟踪、中止和重新运行作业</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>凭据和机密</strong><span>保存凭据，或从 Vault 或 CyberArk 读取</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Git 仓库</strong><span>把表单、playbook 和配置保存在 Git 中</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>设计器</strong><span>以 YAML 编辑表单，并进行校验</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API、MCP 和聊天</strong><span>从脚本、AI 代理或聊天中运行表单</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>表单</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>级联下拉框</strong><span>随其他字段变化的下拉框</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>表达式和数据源</strong><span>从数据库、REST API、文件和 JavaScript 填充字段</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>字段依赖</strong><span>根据其他字段显示或隐藏字段</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>校验</strong><span>最小值、最大值、正则表达式等，可选择在服务器上检查</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>工作流和向导表单</strong><span>串联 playbook 和审批，或把输入拆分到多个页面</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>结构化字段</strong><span>基于可复用子表单的列表和对象</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>审批点</strong><span>暂停作业，直到有人批准</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>通知</strong><span>在作业事件发生时通过邮件、Slack、Teams、Telegram 或 webhook 通知</span></span>
      </li>
    </ul>
  </div>
</div>

## 需要帮助？

问题、缺陷和安全报告各有各的去处：

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>故障排除</strong>
    <span>查找错误消息及其解决方法</span>
    <span class="af-card-more">故障排除 &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>提问</strong>
    <span>向社区和维护者提问</span>
    <span class="af-card-more">讨论区 &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>报告缺陷</strong>
    <span>提交 issue，并附上复现步骤</span>
    <span class="af-card-more">新建 issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>获取帮助</strong>
    <span>应提供哪些信息，以及如何报告安全问题</span>
    <span class="af-card-more">获取帮助 &rarr;</span>
  </a>
</div>

