---
layout: default
title: Fer pull dels canvis
parent: Repositoris Git
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Fer pull dels canvis
{: .no_toc }

Pulls programats, manuals i per API, i els canvis locals
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fer pull dels canvis

Es fa pull d'un repositori segons la seva programació, en arrencar, des de la pàgina o a través de l'API; no hi ha cap punt final de webhook.

| Disparador | Com |
|---|---|
| Programació | **Activa el pull programat** i una **Programació del pull**, per exemple `0 * * * *` per a cada hora |
| Arrencada | **Fes pull en iniciar l'aplicació** clona el repositori, o en fa pull quan ja està clonat |
| Pàgina de configuració | **Pull** al menú de la fila, o **Pull de tots** a sobre de la llista |
| Dissenyador | **Carrega (repositori)**, que fa pull dels repositoris de formularis i recarrega el dissenyador; obtenir el bloqueig del dissenyador també fa primer pull de tots els repositoris de formularis |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` o `showConnectionsSettings`) o `POST /api/v2/forms-repos/pull/<name>` (vegeu més avall) |

### Pull des d'un pipeline o un webhook

AnsibleForms no té cap receptor de webhooks dedicat, però una tasca de CI o un webhook del servidor git poden cridar el punt final de pull.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Crea el token tal com es descriu a [Tokens d'API](../profile/api-token.html), per a un usuari el rol del qual tingui `showSettings` o
`showConnectionsSettings`. `/api/v2/forms-repos/pull/<name>`, en canvi, necessita `showDesigner` i `allowFormDesign`, amb el dissenyador
activat ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` retorna el
`head`, l'`status` i l'`output`, de manera que un pipeline pot comprovar quin commit executa la instància després d'un pull.

### Canvis locals

Un pull no sobreescriu mai feina que encara no s'ha enviat, així que un pull programat comprova la còpia de treball abans d'executar-se.

Un pull programat s'omet mentre la còpia de treball té canvis sense commit o commits sense push, i mentre un dissenyador
té el bloqueig del dissenyador. Un pull manual d'una còpia de treball amb canvis en conflicte falla amb:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Fes push dels canvis, o descarta'ls amb **Restableix** al menú de la fila, que esborra la còpia de treball i la torna a clonar.
