---
layout: default
title: Un usuari local
parent: Usuaris i grups
nav_order: 1
translated_from: 830382a6160c7dd5632ad0f8d89b7ad520d7ae52
---

# Un usuari local
{: .no_toc }

Afegir un usuari local, i les pestanyes de la seva pàgina
{: .fs-6 .fw-300 }

**Afegeix un usuari** obre l'assistent **Nou usuari** en quatre passos:

| Pas | Què demana |
|---|---|
| **Usuari** | El nom d'usuari, la descripció i el correu; només el nom d'usuari és obligatori |
| **Contrasenya** | La contrasenya, escrita dues vegades: **Següent** espera que totes dues coincideixin |
| **Grup** | El grup local al qual pertany l'usuari, i que li dona els rols del grup |
| **Rols** | Els rols que es donen al mateix usuari, cadascun triat amb **Afegeix un rol**; no cal cap |

El pas **Rols** i la contrasenya escrita dues vegades són nous a la 7.8.0. **Desa**, a l'últim pas, crea l'usuari i després li dona els
rols triats: un rol que no se li ha pogut donar s'anomena en un missatge, i l'usuari es crea igualment.

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
