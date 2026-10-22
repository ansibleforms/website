---
layout: default
title: Dissenyador i push
parent: Repositoris Git
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Dissenyador i push
{: .no_toc }

Edita formularis al dissenyador i fes-ne push al repositori
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Editar i fer push des del dissenyador

Amb un repositori que es fa servir per a formularis, el dissenyador edita els fitxers de la seva còpia de treball i els torna a enviar al remot.

| Botó | Què fa |
|---|---|
| **Desa (local)** | Escriu els formularis i el `config.yaml` a les còpies de treball, sense fer commit |
| **Desa (repositori)** | Fa commit i push dels canvis desats; s'activa quan hi ha canvis sense enviar |
| **Carrega (repositori)** | Fa pull dels repositoris de formularis i recarrega el dissenyador, després d'una confirmació si hi ha edicions sense desar |

Els formularis es queden al seu repositori; els nous esperen, ja utilitzables, a [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) fins que en facis push.
Un formulari desat en una subcarpeta conserva el seu camí relatiu: `team/deploy.yaml` s'envia a `team/deploy.yaml` dins de la carpeta de formularis
del repositori. Un formulari nou el camí del qual ja hi existeix no se sobreescriu; es queda a la carpeta de preparació, així que reanomena'l.
Amb diversos repositoris de formularis, **Desa (repositori)** i **Carrega (repositori)** pregunten quin, i per defecte proposen el del `config.yaml`.

Un push prepara tots els canvis, en fa commit com a `AnsibleForms` amb el missatge `Forms sync by <user>`, després fa fetch, rebase sobre
el remot i push, i ho reintenta fins a cinc vegades. Un conflicte de rebase s'avorta i es llisten els fitxers en conflicte;
corregeix-los al remot, o fes servir **Restableix** a la pàgina Repositoris. **Push** a la pàgina Repositoris fa el mateix.

Quan un únic repositori de formularis es clona buit, AnsibleForms copia el `config.yaml` i els formularis locals a la seva còpia
de treball, de manera que un push (**Desa (repositori)**, o **Push** a la pàgina Repositoris) els publica. Trobaràs més informació sobre el dissenyador a [Dissenyador i git](../gui/designer-and-git.html).
