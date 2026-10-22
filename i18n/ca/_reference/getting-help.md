---
layout: default
title: Obtenir ajuda
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Obtenir ajuda
{: .no_toc }

On fer una pregunta, informar d'un error o d'un problema de seguretat, i proposar una millora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Abans de preguntar

La majoria de respostes ja estan escrites; una ullada ràpida sovint estalvia anades i vingudes:

1. Cerca en aquest lloc amb el quadre de cerca de la part superior de cada pàgina.
2. Busca el missatge d'error exacte a [Resolució de problemes](troubleshooting.html), i fes una ullada a les [PMF](faq.html).
3. Comprova el registre del servidor (**Configuració**, i després **Registre del servidor**) i la pàgina **Estat**, que informen de la majoria de problemes de configuració.
4. Consulta el [Registre de canvis](changelog.html): potser el problema ja està corregit en una versió més nova.

---

## On anar

Cada tipus de petició té el seu lloc, tots a GitHub:

| Vols | Ves a |
|---|---|
| Fer una pregunta o compartir una idea | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Informar d'un error | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Proposar una funcionalitat | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Informar d'un problema de seguretat | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), en privat |
| Corregir o millorar aquesta documentació | **Edita aquesta pàgina a GitHub** al peu de qualsevol pàgina, o una [issue al lloc web](https://github.com/ansibleforms/website/issues) |

---

## Informar d'un error

Un informe que es pot reproduir es corregeix més de pressa. La plantilla d'informe d'error demana el següent:

* **Versió** : es mostra a **Quant a** al menú d'ajuda (**?**) de la barra superior
* **Desplegament** : Docker, Docker Compose, Kubernetes, l'instal·lador (i el seu motor), una instal·lació nativa o des del codi font
* **Passos per reproduir-lo** : què has fet, què esperaves, i què ha passat en canvi
* **Proves** : les línies rellevants del registre del servidor, i una captura de pantalla quan el problema és visible

Per a un problema amb un formulari, inclou una definició de formulari mínima que el mostri. Treu les contrasenyes, els tokens, els noms d'host i qualsevol
altra dada privada dels registres i dels formularis abans de publicar-los: les issues i les discussions són públiques.

---

## Informar d'un problema de seguretat

**No obris mai una issue pública per a això:** fes servir [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), que només veuen els mantenidors.

La [política de seguretat](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) llista les versions compatibles i
què passa després d'informar-ne.
