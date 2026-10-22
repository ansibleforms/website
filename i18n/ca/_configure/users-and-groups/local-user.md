---
layout: default
title: Un usuari local
parent: Usuaris i grups
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Un usuari local
{: .no_toc }

Afegir un usuari local, i les pestanyes de la seva pàgina
{: .fs-6 .fw-300 }

**Afegeix un usuari** obre un assistent de tres passos: **Usuari** (nom d'usuari, descripció, correu), **Contrasenya** i **Grup**.

La pàgina d'un usuari, `/settings/users/<id>`, té aquestes pestanyes:

| Pestanya | Què mostra |
|---|---|
| **Detalls** | L'interruptor **Permet l'inici de sessió**, el nom d'usuari, la descripció, el correu i, des de la 7.3.0, el **Darrer inici de sessió** |
| **Grups** | Els grups als quals pertany l'usuari |
| **Rols** | Els rols que té l'usuari, i què li dona cadascun: **Directament**, **A través de** un grup, o **Tothom** |
| **Formularis** | Els formularis que obren aquests rols |
| **Tasques** | Les tasques que ha llançat l'usuari, la més recent primer |
| **Tasques desades** | Els valors de formulari que l'usuari ha desat per tornar-los a executar |
| **Programacions** | Les tasques que l'usuari ha planificat amb Executa més tard |
| **Activitat** | El que el registre d'auditoria ha registrat que ha fet l'usuari |
| **Tokens d'API** | Els tokens d'API de l'usuari, amb quan es va crear, quan caduca i quan es va utilitzar per última vegada cadascun; **Revoca** n'acaba un a l'instant |

Des de la 7.3.0 els inicis de sessió d'un usuari local es registren, com ja passava amb els d'un usuari LDAP o SSO: **Darrer inici de sessió** mostra el més recent, i
la llista d'usuaris té una columna **Darrer inici de sessió** ordenable per a tots els orígens, de manera que un compte que no fa servir ningú salta a la vista. Un inici de sessió rebutjat no
es registra, i un usuari local que no ha iniciat sessió des de l'actualització mostra `–`.

**Canvia la contrasenya** i **Suprimeix** són a dalt a la dreta. L'usuari `admin` no es pot suprimir ni reanomenar mai.
