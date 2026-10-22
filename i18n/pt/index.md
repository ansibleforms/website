---
layout: default
title: Início
nav_order: 1
description: "AnsibleForms: crie formulários dinâmicos baseados em dados para a automação com Ansible"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Formulários self-service para <span>Ansible</span></h1>
    <p class="af-hero-lead">
      O Ansible é uma ferramenta de automação poderosa, mas continua a ser uma aplicação de linha de comandos, e ao AWX/AAP/Ascender faltam
      formulários que recolham dados de várias fontes. O AnsibleForms permite criar formulários dinâmicos baseados em dados, gerar extravars
      e enviá-las para Ansible, AWX/AAP/Ascender, Semaphore, Rundeck ou Jenkins e aí executar templates.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Instalar o AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Crie o seu primeiro formulário</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="O painel do AnsibleForms">
  </div>
</div>

## Capacidades

O que o AnsibleForms traz ao seu ambiente Ansible, e o que um só formulário consegue fazer:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Aplicação</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Plataformas de automação</strong><span>Playbooks em RTE, templates no Ascender, no Semaphore e noutros</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Controlo de acesso</strong><span>Funções e opções de função, com inícios de sessão locais, LDAP, Entra ID e OIDC</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Agendamento</strong><span>Executar um formulário mais tarde, ou segundo um agendamento cron</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Histórico de tarefas</strong><span>Acompanhar, interromper e relançar tarefas</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Credenciais e segredos</strong><span>Guardar credenciais, ou lê-las do Vault ou do CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Repositórios git</strong><span>Manter formulários, playbooks e configuração em Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Designer</strong><span>Editar formulários em YAML, com validação</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP e chat</strong><span>Lançar formulários a partir de scripts, agentes de IA ou de um chat</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Formulários</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Listas pendentes em cascata</strong><span>Listas pendentes que reagem a outros campos</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Expressões e fontes de dados</strong><span>Preencher campos a partir de bases de dados, APIs REST, ficheiros e JavaScript</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dependências entre campos</strong><span>Mostrar ou ocultar campos conforme outros campos</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validação</strong><span>Mínimo, máximo, regex e mais, opcionalmente verificados no servidor</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflows e assistentes</strong><span>Encadear playbooks e aprovações, ou dividir os dados por páginas</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Campos estruturados</strong><span>Listas e objetos baseados em subformulários reutilizáveis</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Pontos de aprovação</strong><span>Colocar uma tarefa em pausa até alguém a aprovar</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Notificações</strong><span>Email, Slack, Teams, Telegram ou um webhook nos eventos das tarefas</span></span>
      </li>
    </ul>
  </div>
</div>

## Precisa de ajuda?

As perguntas, os erros e os relatórios de segurança têm cada um o seu lugar:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Resolução de problemas</strong>
    <span>Procurar uma mensagem de erro e como a resolver</span>
    <span class="af-card-more">Resolução de problemas &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Fazer uma pergunta</strong>
    <span>Perguntar à comunidade e aos maintainers</span>
    <span class="af-card-more">Discussões &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Reportar um erro</strong>
    <span>Abrir uma issue com os passos para o reproduzir</span>
    <span class="af-card-more">Nova issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Obter ajuda</strong>
    <span>O que incluir, e como reportar um problema de segurança</span>
    <span class="af-card-more">Obter ajuda &rarr;</span>
  </a>
</div>

