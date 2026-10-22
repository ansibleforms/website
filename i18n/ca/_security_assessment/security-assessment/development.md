---
layout: default
title: Desenvolupament segur
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Desenvolupament segur
{: .no_toc }

Com es comproven i es publiquen els canvis, i què té suport
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El codi font

AnsibleForms és de codi obert, de manera que tot el que diu aquesta pàgina es pot comprovar al mateix repositori:

* El codi, el seu historial i els seus pipelines de compilació són públics a [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* La [llicència](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) és GPL-3.0.
* El [registre de canvis](../changelog.html) recull tots els canvis de cada versió, correccions de seguretat incloses.

---

## Com s'integra un canvi

Cada canvi arriba a `main` a través d'una pull request, sota un conjunt de regles que ningú no pot saltar-se:

| Regla | Què vol dir |
|---|---|
| Pull request obligatòria | No es fa cap push directament a `main` |
| Comprovacions obligatòries | La pull request només s'integra quan passen totes les comprovacions de sota |
| Sense force push ni eliminació | L'historial de `main` no es pot reescriure ni eliminar |
| Historial lineal | Cada pull request es converteix en un sol commit, de manera que cada canvi es pot rastrejar i revertir per separat |

Les comprovacions que ha de passar una pull request:

| Comprovació | Què fa |
|---|---|
| Client, Server | Les proves unitàries de la interfície web i del servidor |
| CodeQL | L'anàlisi estàtica de GitHub del codi JavaScript i TypeScript, per detectar injeccions, cross-site scripting i altres debilitats |
| Public schema is up to date | L'esquema de base de dades que espera el codi coincideix amb el que porta |
| Title, Branch | La pull request segueix les regles de nomenclatura, perquè el registre de canvis sigui exacte |

N'hi ha dues més que s'executen a cada pull request i n'informen:

* **Database** prova el servidor amb MySQL i MariaDB, i **Browser** fa funcionar la interfície en un navegador.
* **Dependency review** bloqueja una dependència nova amb una vulnerabilitat coneguda alta o crítica.

---

## Anàlisi del codi i dependències

El codi i allò de què depèn es tornen a comprovar després d'integrar-se:

* **CodeQL** també analitza cada push a `main` i a les branques de versió, i tot el codi cada setmana:
  així, una regla nova de CodeQL també comprova el codi integrat abans que existís.
* **Dependabot** obre una pull request per a cada versió nova d'una dependència: els paquets npm del servidor i de la
  interfície, els paquets Python de l'entorn d'execució i les GitHub Actions dels pipelines cada setmana, i
  les imatges base dels contenidors cada dia.
* Les imatges base estan fixades per digest (`node:26-trixie-slim@sha256:...`), de manera que una compilació fa servir exactament la imatge revisada.
  Dependabot actualitza el digest quan la imatge es torna a construir a l'origen.

---

## Versions i imatges

Una versió només la construeix i la publica GitHub Actions, mai la màquina d'un desenvolupador:

* Una versió es crea a partir de `main` (o de `release/6.x`), amb un registre de canvis construït a partir de les seves pull requests.
* Les imatges les construeix el [workflow Publish](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  i es publiquen al GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, amb les imatges de l'entorn d'execució
  al costat. El workflow i els seus registres són públics, de manera que qualsevol pot veure què ha entrat en una imatge.
* Les imatges de l'aplicació i de l'entorn d'execució s'executen com l'usuari sense privilegis `node` (uid 1000), mai com a root.

---

## Versions amb suport

Les correccions de seguretat van a la versió més recent de cada línia amb suport:

| Versió | Rep correccions de seguretat |
|---|---|
| 7.x | Sí |
| 6.5.x | Sí |
| Anterior a la 6.5 | No: la solució és actualitzar |

La [guia d'actualització](../upgrading/) explica com passar a una versió més nova, i [Actualitzar a la v7](../upgrade-7.html), el pas des de la 6.5.
