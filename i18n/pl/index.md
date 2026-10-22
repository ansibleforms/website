---
layout: default
title: Strona główna
nav_order: 1
description: "AnsibleForms: twórz dynamiczne formularze oparte na danych do automatyzacji z Ansible"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Formularze samoobsługowe dla <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible to potężne narzędzie do automatyzacji, ale pozostaje aplikacją wiersza poleceń, a AWX/AAP/Ascender nie ma
      formularzy, które zbierają dane z wielu źródeł. AnsibleForms pozwala budować dynamiczne formularze oparte na danych, generować extravars,
      wysyłać je do Ansible, AWX/AAP/Ascender, Semaphore, Rundeck lub Jenkins i uruchamiać tam szablony.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Zainstaluj AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Zbuduj swój pierwszy formularz</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="Pulpit AnsibleForms">
  </div>
</div>

## Możliwości

Co AnsibleForms wnosi do twojego środowiska Ansible i co potrafi pojedynczy formularz:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Aplikacja</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Platformy automatyzacji</strong><span>Playbooki na RTE, szablony na Ascender, Semaphore i nie tylko</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Kontrola dostępu</strong><span>Role i opcje ról, z logowaniem lokalnym, LDAP, Entra ID i OIDC</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Planowanie</strong><span>Uruchamianie formularza później lub według harmonogramu cron</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Historia zadań</strong><span>Śledzenie, przerywanie i ponowne uruchamianie zadań</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Poświadczenia i sekrety</strong><span>Przechowywanie poświadczeń lub odczyt z Vault albo CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Repozytoria git</strong><span>Formularze, playbooki i konfiguracja w Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Projektant</strong><span>Edycja formularzy jako YAML, z walidacją</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP i czat</strong><span>Uruchamianie formularzy ze skryptów, agentów AI lub czatu</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Formularze</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Kaskadowe listy rozwijane</strong><span>Listy rozwijane reagujące na inne pola</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Wyrażenia i źródła danych</strong><span>Wypełnianie pól z baz danych, REST API, plików i JavaScriptu</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Zależności pól</strong><span>Pokazywanie lub ukrywanie pól na podstawie innych pól</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Walidacja</strong><span>Min, max, regex i inne, opcjonalnie sprawdzane na serwerze</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflowy i formularze kreatora</strong><span>Łączenie playbooków i zatwierdzeń w łańcuch lub podział danych na strony</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Pola strukturalne</strong><span>Listy i obiekty oparte na podformularzach wielokrotnego użytku</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Punkty zatwierdzenia</strong><span>Wstrzymanie zadania, dopóki ktoś go nie zatwierdzi</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Powiadomienia</strong><span>Poczta, Slack, Teams, Telegram lub webhook przy zdarzeniach zadań</span></span>
      </li>
    </ul>
  </div>
</div>

## Potrzebujesz pomocy?

Pytania, błędy i zgłoszenia bezpieczeństwa mają każde swoje miejsce:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Rozwiązywanie problemów</strong>
    <span>Wyszukaj komunikat błędu i sposób jego naprawy</span>
    <span class="af-card-more">Rozwiązywanie problemów &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Zadaj pytanie</strong>
    <span>Zapytaj społeczność i maintainerów</span>
    <span class="af-card-more">Dyskusje &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Zgłoś błąd</strong>
    <span>Otwórz issue z krokami pozwalającymi go odtworzyć</span>
    <span class="af-card-more">Nowe issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Uzyskiwanie pomocy</strong>
    <span>Co zawrzeć i jak zgłosić problem z bezpieczeństwem</span>
    <span class="af-card-more">Uzyskiwanie pomocy &rarr;</span>
  </a>
</div>

