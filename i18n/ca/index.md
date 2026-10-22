---
layout: default
title: Inici
nav_order: 1
description: "AnsibleForms: crea formularis dinàmics basats en dades per a l'automatització amb Ansible"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Formularis d'autoservei per a <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible és una eina d'automatització potent, però continua sent una aplicació de línia d'ordres, i a AWX/AAP/Ascender li falten
      formularis que recullin dades de diverses fonts. AnsibleForms et permet construir formularis dinàmics basats en dades, generar extravars
      i enviar-les a Ansible, AWX/AAP/Ascender, Semaphore, Rundeck o Jenkins i executar-hi plantilles.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Instal·la AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Construeix el teu primer formulari</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="El tauler d'AnsibleForms">
  </div>
</div>

## Funcionalitats

Què aporta AnsibleForms a la teva instal·lació d'Ansible, i què pot fer un sol formulari:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Aplicació</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Plataformes d'automatització</strong><span>Playbooks en RTE, plantilles a Ascender, Semaphore i més</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Control d'accés</strong><span>Rols i opcions de rol, amb inicis de sessió locals, LDAP, Entra ID i OIDC</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Programació</strong><span>Executa un formulari més tard, o segons una programació cron</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Historial de tasques</strong><span>Segueix, avorta i rellança tasques</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Credencials i secrets</strong><span>Desa credencials, o llegeix-les de Vault o CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Repositoris Git</strong><span>Guarda formularis, playbooks i configuració a Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dissenyador</strong><span>Edita formularis en YAML, amb validació</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP i xat</strong><span>Llança formularis des de scripts, agents d'IA o un xat</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Formularis</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Desplegables en cascada</strong><span>Desplegables que reaccionen a altres camps</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Expressions i fonts de dades</strong><span>Omple camps des de bases de dades, API REST, fitxers i JavaScript</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dependències entre camps</strong><span>Mostra o amaga camps segons altres camps</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validació</strong><span>Mínim, màxim, regex i més, opcionalment comprovats al servidor</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflows i formularis amb assistent</strong><span>Encadena playbooks i aprovacions, o reparteix les dades en diverses pàgines</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Camps estructurats</strong><span>Llistes i objectes basats en subformularis reutilitzables</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Punts d'aprovació</strong><span>Atura una tasca fins que algú l'aprovi</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Notificacions</strong><span>Correu, Slack, Teams, Telegram o un webhook segons els esdeveniments de les tasques</span></span>
      </li>
    </ul>
  </div>
</div>

## Necessites ajuda?

Les preguntes, els errors i els informes de seguretat tenen cadascun el seu lloc:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Resolució de problemes</strong>
    <span>Busca un missatge d'error i com solucionar-lo</span>
    <span class="af-card-more">Resolució de problemes &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Fes una pregunta</strong>
    <span>Pregunta a la comunitat i als mantenidors</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Informa d'un error</strong>
    <span>Obre una issue amb els passos per reproduir-lo</span>
    <span class="af-card-more">Nova issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Obtenir ajuda</strong>
    <span>Què cal incloure, i com comunicar un problema de seguretat</span>
    <span class="af-card-more">Obtenir ajuda &rarr;</span>
  </a>
</div>

