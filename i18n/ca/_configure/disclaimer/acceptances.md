---
layout: default
title: Acceptacions
parent: Avís legal
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Acceptacions
{: .no_toc }

Qui ha acceptat quina versió, i com tornar-ho a demanar als usuaris que triïs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qui l'ha acceptat

Cada acceptació es registra amb l'usuari i la versió, i la pestanya **Acceptacions** de la pàgina d'una versió les llista, la més recent primer:

| Columna | Significat |
|---|---|
| **Usuari** | El nom d'usuari |
| **Inici de sessió** | Com ha iniciat sessió: Local, LDAP, Microsoft Entra ID o OpenID Connect |
| **Acceptat** | Quan |
| **Adreça IP** | Des d'on |
| **Navegador** | El seu navegador |

---

## Tornar-ho a demanar

Des de la 7.3.0 es pot demanar als usuaris que triïs que tornin a acceptar una versió, sense demanar-ho a tothom.

**Torna a demanar**, al menú d'una fila o sobre les files marcades a la llista, esborra aquestes acceptacions després d'una confirmació: aquests usuaris
tornen a rebre l'avís legal a la seva propera petició, sense haver de tornar a iniciar sessió. La llista també es pot exportar, com qualsevol taula.

El [registre d'auditoria](../production/logs.html#audit-trail) també registra cada acceptació, cada rebuig i cada canvi de l'avís legal.
