---
layout: default
title: Assistent de xat
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Assistent de xat
{: .no_toc }

Emplena i llança formularis a través d'una conversa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per als administradors que l'activen, i per als usuaris que hi xategen: emplena i llança formularis a través d'una conversa.

Un botó de xat a cada pàgina obre un
assistent que troba el formulari adequat, demana la informació que falta, ofereix les opcions del mateix
formulari com a botons i mostra un resum amb un botó **Llança**. Una tasca només s'inicia quan l'usuari hi fa clic.

---

## Com funciona

L'assistent es comunica amb el model d'IA a través del servidor, que respon les peticions del model amb el mateix motor de formularis que el navegador:

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

- **Les crides al model surten del servidor**, mai del navegador, així que la clau d'API es queda al servidor
  (consulta [Proveïdors](providers.html)).
- **El model no pot llançar res.** Prepara un resum d'un sol ús; Llança el torna a comprovar abans d'executar-lo.
- **L'usuari tria els destins.** Les opcions i els noms obligatoris vénen de l'usuari, mai del model.
- **Escriure "sí" o "llança" no fa res.** Només el botó llança una tasca.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Activar-lo](switching-it-on.html) | Activar l'assistent i oferir-hi formularis |
| [Proveïdors](providers.html) | El model de llenguatge que hi ha darrere de l'assistent, i els proxies |
| [Privadesa i límits](privacy-and-limits.html) | Què surt de la xarxa, i els límits per usuari |
| [Rellançament i auditoria](relaunching-and-audit.html) | Rellançar des del xat, la traça d'auditoria i les limitacions |
