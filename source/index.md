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
      <a href="forms/" class="btn btn-outline">Build your first form</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="The AnsibleForms dashboard">
  </div>
</div>

## Quick Navigation
{: .no_toc }

Start with these guides to set up AnsibleForms:

<div class="af-cards af-quick">
  <a class="af-card" href="installation/">
    <span class="af-card-icon"><i class="fa-solid fa-rocket"></i></span>
    <strong>How to install</strong>
    <span>Run it with Docker, Kubernetes or from source</span>
    <span class="af-card-more">Installation guide &rarr;</span>
  </a>
  <a class="af-card" href="customization">
    <span class="af-card-icon"><i class="fa-solid fa-sliders"></i></span>
    <strong>How to customize</strong>
    <span>Configure it with environment variables</span>
    <span class="af-card-more">Environment variables &rarr;</span>
  </a>
  <a class="af-card" href="config/">
    <span class="af-card-icon"><i class="fa-solid fa-user-shield"></i></span>
    <strong>Set up config.yaml</strong>
    <span>Define the roles, categories and access control</span>
    <span class="af-card-more">Roles &amp; categories &rarr;</span>
  </a>
  <a class="af-card" href="forms/">
    <span class="af-card-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></span>
    <strong>Your first form</strong>
    <span>Create forms with fields, validation and sources</span>
    <span class="af-card-more">Forms documentation &rarr;</span>
  </a>
</div>

## Application Capabilities

What AnsibleForms brings to your Ansible setup:

<div class="af-cards af-collapsible" id="app-capabilities">
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-play"></i></span>
    <strong>Automation platforms</strong>
    <span>Run playbooks locally or on AWX, AAP or Ascender</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-user-shield"></i></span>
    <strong>Role based access</strong>
    <span>Limit forms to roles of users and groups</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-calendar-days"></i></span>
    <strong>Job scheduling</strong>
    <span>Run a form later, or on a cron schedule</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Chat assistant</strong>
    <span>Fill in and launch forms by chatting</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-folder-tree"></i></span>
    <strong>Categories</strong>
    <span>Group the forms in a tree of categories</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-key"></i></span>
    <strong>Authentication</strong>
    <span>Local, LDAP, Entra ID and OIDC logins</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-clock-rotate-left"></i></span>
    <strong>Job history</strong>
    <span>See past jobs, abort running ones, relaunch</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-sliders"></i></span>
    <strong>Configuration</strong>
    <span>Set up the server with environment variables</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-vault"></i></span>
    <strong>Credential manager</strong>
    <span>Store credentials and pass them to playbooks</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-code-branch"></i></span>
    <strong>Git repositories</strong>
    <span>Sync forms and playbooks with Git</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-plug"></i></span>
    <strong>REST API</strong>
    <span>A REST API with Swagger documentation</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-floppy-disk"></i></span>
    <strong>Stored jobs</strong>
    <span>Save form data and load it later to pre-fill</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-user-lock"></i></span>
    <strong>Role options</strong>
    <span>Decide who may use each feature</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-database"></i></span>
    <strong>Automated backups</strong>
    <span>Nightly backups with configurable retention</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-pen-ruler"></i></span>
    <strong>Designer</strong>
    <span>Edit forms as YAML, with validation</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-robot"></i></span>
    <strong>MCP server</strong>
    <span>Let AI agents list and launch your forms</span>
  </div>
</div>

<div class="af-expand-wrap">
  <button type="button" class="btn btn-outline af-expand" aria-expanded="false" aria-controls="app-capabilities">Show all 16</button>
</div>

## Form Capabilities

What a single form can do:

<div class="af-cards af-collapsible" id="form-capabilities">
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-sitemap"></i></span>
    <strong>Cascaded dropdowns</strong>
    <span>Dropdowns that react to other fields</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-database"></i></span>
    <strong>Database sources</strong>
    <span>Query MySQL, Oracle, MongoDB and more</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-list-ol"></i></span>
    <strong>Multistep forms</strong>
    <span>Run several playbooks in steps from one form</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-shoe-prints"></i></span>
    <strong>Wizard forms</strong>
    <span>Split input across pages with Back and Next</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-code"></i></span>
    <strong>Server expressions</strong>
    <span>Fetch data from REST APIs, files and more</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-calculator"></i></span>
    <strong>Local expressions</strong>
    <span>JavaScript in the browser to compute values</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-eye"></i></span>
    <strong>Field dependencies</strong>
    <span>Show or hide fields based on other fields</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-palette"></i></span>
    <strong>Visualization</strong>
    <span>Icons, images, colors and a responsive grid</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-check-double"></i></span>
    <strong>Field validations</strong>
    <span>Min, max, regex, in and more</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-layer-group"></i></span>
    <strong>Group fields</strong>
    <span>Group fields vertically and horizontally</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-diagram-project"></i></span>
    <strong>Output modelling</strong>
    <span>Shape the extravars into your own objects</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-stamp"></i></span>
    <strong>Approval points</strong>
    <span>Pause a job until someone approves it</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-cubes"></i></span>
    <strong>Structured fields</strong>
    <span>Lists and objects backed by reusable subforms</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-stopwatch"></i></span>
    <strong>Scheduled forms</strong>
    <span>Run on a cron schedule or at a set time</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-envelope"></i></span>
    <strong>Email notifications</strong>
    <span>Send an email when a job finishes</span>
  </div>
  <div class="af-card">
    <span class="af-card-icon"><i class="fa-solid fa-shield-halved"></i></span>
    <strong>Launch validation</strong>
    <span>Check every launch on the server</span>
  </div>
</div>

<div class="af-expand-wrap">
  <button type="button" class="btn btn-outline af-expand" aria-expanded="false" aria-controls="form-capabilities">Show all 16</button>
</div>

## Tech stack

What AnsibleForms is built with:

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Component</th>
      <th>Technology</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Backend</strong></td>
      <td>Node.js / Express</td>
    </tr>
    <tr>
      <td><strong>Database</strong></td>
      <td>MySQL</td>
    </tr>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>Vue 3</td>
    </tr>
    <tr>
      <td><strong>Layout</strong></td>
      <td>Bootstrap 5 / Font Awesome</td>
    </tr>
  </tbody>
</table>

## Requirements

{: .warning }
> **Requirements depend on how you plan to install AnsibleForms.** [See the installation section to learn more.](installation)

<script>
  /* the capability grids show their first row ; the button below each one shows the rest (a // comment would swallow the script : the theme puts the page on one line) */
  document.querySelectorAll('.af-expand').forEach(function (button) {
    var grid = document.getElementById(button.getAttribute('aria-controls'));
    var label = button.textContent;
    button.addEventListener('click', function () {
      var open = grid.classList.toggle('af-open');
      button.setAttribute('aria-expanded', open);
      button.textContent = open ? 'Show less' : label;
      if (!open) grid.scrollIntoView({ block: 'nearest' });
    });
  });
</script>
