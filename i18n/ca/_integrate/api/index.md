---
layout: default
title: API REST
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# API REST
{: .no_toc }

Llança formularis i gestiona AnsibleForms des de scripts
{: .fs-6 .fw-300 }

---

Per a desenvolupadors i enginyers d'automatització: llança formularis i gestiona AnsibleForms des de scripts.

Tot el que fa la interfície web passa per l'API REST, així que els scripts i altres eines poden fer el mateix.

---

## Visió general

L'API se serveix sota `/api/v2` al servidor d'AnsibleForms:

* **Referència completa** : aquestes pàgines cobreixen el que més fan servir els scripts. Cada endpoint es descriu, i es pot provar, a la
  pàgina Swagger integrada del servidor, `https://<your server>/api/v2/docs`.
* **Permisos** : una crida s'executa com l'usuari del token que porta, amb els rols d'aquest usuari, igual que al navegador.
* **Validació del llançament** : les tasques llançades a través de l'API es poden comprovar com els llançaments des del navegador
  (consulta [Validació del llançament](../launch-validation/)).
* **Límits de peticions** : només estan limitats els endpoints d'inici de sessió, tancament de sessió, renovació del token i inici de sessió únic, el canvi de
  contrasenya (`PUT /api/v2/profile`) i els endpoints de tokens d'API (`POST` i `DELETE /api/v2/profile/tokens`) (consulta
  [Autenticació](authentication.html)). Les altres crides no tenen cap límit de peticions (l'[assistent de xat](../chat/) té límits
  propis), així que un script s'hauria de regular ell mateix, per exemple quan segueix una tasca.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Autenticació](authentication.html) | Iniciar sessió, renovar el token o fer servir un token de llarga durada |
| [Tasques](jobs.html) | Llançar un formulari, seguir la tasca, avortar-la, rellançar-la o aprovar-la |
| [Respostes i errors](responses.html) | La forma d'una resposta i els codis d'estat |
| [Esdeveniments en directe](events.html) | Saber quan canvien les tasques i la configuració, en lloc de consultar-ho periòdicament |
