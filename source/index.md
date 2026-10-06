---
layout: default
title: Home
nav_order: 1
description: "AnsibleForms - Build dynamic, data-driven forms for Ansible automation"
permalink: /
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Self-service forms for <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible is a powerful automation tool, but it remains a command-line application, and AWX/AAP/Ascender lacks
      forms that collect data from several sources. AnsibleForms lets you build dynamic, data-driven forms, generate extravars
      and send them to Ansible or AWX/AAP/Ascender.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Install AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Build your first form</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="The AnsibleForms dashboard">
  </div>
</div>

## Capabilities

What AnsibleForms brings to your Ansible setup, and what a single form can do:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Application</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Automation platforms</strong><span>Run playbooks locally or on AWX, AAP or Ascender</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Access control</strong><span>Roles and role options, with local, LDAP, Entra ID and OIDC logins</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Scheduling</strong><span>Run a form later, or on a cron schedule</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Job history</strong><span>Follow, abort and relaunch jobs</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Credentials and secrets</strong><span>Store credentials, or read them from Vault or CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Git repositories</strong><span>Keep forms, playbooks and configuration in Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Designer</strong><span>Edit forms as YAML, with validation</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP and chat</strong><span>Launch forms from scripts, AI agents or a chat</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Forms</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Cascaded dropdowns</strong><span>Dropdowns that react to other fields</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Expressions and data sources</strong><span>Fill fields from databases, REST APIs, files and JavaScript</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Field dependencies</strong><span>Show or hide fields based on other fields</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validation</strong><span>Min, max, regex and more, optionally checked on the server</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-list-ol" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Multistep and wizard forms</strong><span>Run playbooks in steps, or split input across pages</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Structured fields</strong><span>Lists and objects backed by reusable subforms</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Approval points</strong><span>Pause a job until someone approves it</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-envelope" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Notifications</strong><span>Send an email when a job finishes</span></span>
      </li>
    </ul>
  </div>
</div>

## Need help?

Questions, bugs and security reports each have their own place:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Troubleshooting</strong>
    <span>Look up an error message and how to fix it</span>
    <span class="af-card-more">Troubleshooting &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Ask a question</strong>
    <span>Ask the community and the maintainers</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Report a bug</strong>
    <span>Open an issue with the steps to reproduce it</span>
    <span class="af-card-more">New issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Getting help</strong>
    <span>What to include, and how to report a security problem</span>
    <span class="af-card-more">Getting help &rarr;</span>
  </a>
</div>

