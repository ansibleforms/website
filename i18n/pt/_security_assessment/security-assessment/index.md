---
layout: default
title: Visão geral
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Avaliação de segurança
{: .no_toc }

Para revisões de segurança: medidas, desenvolvimento e avisos
{: .fs-6 .fw-300 }

---

## Em resumo

O AnsibleForms executa playbooks e guarda as respetivas credenciais, pelo que faz parte da sua cadeia de confiança:

* É **auto-alojado**: corre na sua infraestrutura, guarda os seus dados na sua base de dados e não envia nada a quem o faz.
* É **open source** (GPL-3.0): o código, os seus pipelines e todos os avisos são públicos.
* Todos os segredos guardados são **cifrados**, todas as alterações **auditadas**, e as **funções** são verificadas em cada pedido.
* As vulnerabilidades são **reportadas em privado**, corrigidas em todas as versões suportadas e **publicadas**.

---

## Nesta secção

As páginas respondem às perguntas de uma revisão de segurança, desde o desenho até à lista de CVE:

| Página | O que abrange |
|---|---|
| [Medidas de segurança](measures.html) | Início de sessão, permissões, segredos guardados, o registo de auditoria, o navegador, o servidor, as ligações e os contentores |
| [Desenvolvimento seguro](development.html) | Como uma alteração é revista e testada, a análise de código e de dependências, como são construídas as imagens, as versões suportadas |
| [Reportar uma vulnerabilidade](reporting.html) | Como reportar um problema em privado, e o que acontece a seguir |
| [Avisos de segurança](advisories.html) | Todas as vulnerabilidades publicadas, com o seu CVE, gravidade e versão corrigida |
| [FAQ da avaliação](faq.html) | Respostas curtas às perguntas que os questionários de segurança mais fazem |

Para proteger uma instância em vez de a avaliar, consulte [Segurança](../security/) no guia do administrador.
