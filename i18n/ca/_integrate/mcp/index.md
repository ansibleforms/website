---
layout: default
title: Servidor MCP
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# Servidor MCP
{: .no_toc }

Deixa que els agents d'IA facin servir els teus formularis a través del Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors i integradors: deixa que els clients MCP llistin, emplenin i llancin formularis com l'usuari del token que tenen.

AnsibleForms pot servir un
servidor de [Model Context Protocol](https://modelcontextprotocol.io), perquè un client MCP, com ara
el backend d'un xat o un assistent d'un IDE, pugui llistar els formularis que un usuari pot fer servir, determinar-ne els camps,
llançar tasques i seguir-ne el progrés.

---

## Què és, i què no és

El servidor MCP és una interfície tècnica al mateix flux de formularis que fa servir el navegador. S'executa
**com l'usuari del token que rep**: els mateixos rols de formulari, la mateixa visibilitat de les tasques i les
mateixes comprovacions sobre les extravars reservades que un enviament des del navegador.

No hi afegeix cap política d'IA pròpia. Si un agent ha de demanar confirmació abans d'un llançament,
quins formularis pot fer servir o quantes peticions pot fer, ho decideix el client MCP. L'eina
de llançament està marcada com a destructiva, així que un client ben comportat demana confirmació primer,
però el servidor no ho imposa.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Configuració](setup.html) | Activar el servidor i autenticar el client |
| [Eines](tools.html) | Les eines que fa servir un agent per emplenar, aprovar i rellançar formularis |
| [Limitacions](limitations.html) | Les expressions s'executen al servidor, i què no fa el servidor MCP |
