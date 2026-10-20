---
layout: default
title: Inicio
nav_order: 1
description: "AnsibleForms: crea formularios dinámicos basados en datos para la automatización con Ansible"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Formularios de autoservicio para <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible es una potente herramienta de automatización, pero sigue siendo una aplicación de línea de comandos, y a AWX/AAP/Ascender le faltan
      formularios que recojan datos de varias fuentes. AnsibleForms te permite crear formularios dinámicos basados en datos, generar extravars
      y enviarlas a Ansible, AWX/AAP/Ascender, Semaphore, Rundeck o Jenkins para ejecutar allí las plantillas.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Instalar AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Crea tu primer formulario</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="El panel de AnsibleForms">
  </div>
</div>

## Capacidades

Lo que AnsibleForms aporta a tu entorno de Ansible, y lo que puede hacer un solo formulario:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Aplicación</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Plataformas de automatización</strong><span>Playbooks en RTEs, plantillas en Ascender, Semaphore y más</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Control de acceso</strong><span>Roles y opciones de rol, con inicio de sesión local, LDAP, Entra ID y OIDC</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Programación</strong><span>Ejecuta un formulario más tarde, o según una programación cron</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Historial de trabajos</strong><span>Sigue, aborta y relanza trabajos</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Credenciales y secretos</strong><span>Guarda credenciales, o léelas de Vault o CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Repositorios git</strong><span>Guarda formularios, playbooks y configuración en Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Diseñador</strong><span>Edita formularios en YAML, con validación</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP y chat</strong><span>Lanza formularios desde scripts, agentes de IA o un chat</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Formularios</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Desplegables en cascada</strong><span>Desplegables que reaccionan a otros campos</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Expresiones y orígenes de datos</strong><span>Rellena campos desde bases de datos, APIs REST, archivos y JavaScript</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dependencias entre campos</strong><span>Muestra u oculta campos según otros campos</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validación</strong><span>Mínimo, máximo, regex y más, opcionalmente comprobados en el servidor</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflows y formularios wizard</strong><span>Encadena playbooks y aprobaciones, o reparte la entrada en varias páginas</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Campos estructurados</strong><span>Listas y objetos basados en subformularios reutilizables</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Puntos de aprobación</strong><span>Pausa un trabajo hasta que alguien lo apruebe</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Notificaciones</strong><span>Correo, Slack, Teams, Telegram o un webhook ante eventos de trabajos</span></span>
      </li>
    </ul>
  </div>
</div>

## ¿Necesitas ayuda?

Las preguntas, los bugs y los informes de seguridad tienen cada uno su sitio:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Solución de problemas</strong>
    <span>Busca un mensaje de error y cómo solucionarlo</span>
    <span class="af-card-more">Solución de problemas &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Haz una pregunta</strong>
    <span>Pregunta a la comunidad y a los mantenedores</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Informa de un bug</strong>
    <span>Abre una issue con los pasos para reproducirlo</span>
    <span class="af-card-more">Nueva issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Obtener ayuda</strong>
    <span>Qué incluir y cómo informar de un problema de seguridad</span>
    <span class="af-card-more">Obtener ayuda &rarr;</span>
  </a>
</div>
