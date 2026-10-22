---
layout: default
title: Reportar uma vulnerabilidade
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Reportar uma vulnerabilidade
{: .no_toc }

Como reportar um problema de segurança em privado, e o que acontece a seguir
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Reporte-o em privado

O AnsibleForms guarda credenciais e tokens de cofres, por isso nunca reporte um problema de segurança numa issue pública:

1. Abra **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: um aviso privado que só os maintainers veem.
2. Se essa página não estiver disponível para si, abra uma issue normal que diga apenas que tem um relatório de segurança e peça
   um canal privado: sem detalhes, sem forma de reproduzir, sem números de versão. Um maintainer abre um aviso privado e
   convida-o para ele.

A política completa é o [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) do repositório.

---

## O que incluir

Quanto mais disto um relatório trouxer, mais depressa é corrigido:

* O que um atacante ganha: os dados de outro utilizador, um playbook que não pode executar, o host ou direitos de administrador.
* A versão, e como está implementado: Docker, Kubernetes ou instalado de forma nativa.
* Uma forma de reproduzir, ou o pedido que o provoca.
* Se precisa de um utilizador com sessão iniciada, e com que [opções de função](../config/roles.html).

---

## O que acontece a seguir

Um relatório passa pelo mesmo aviso privado desde a primeira mensagem até à publicação:

| Passo | O que recebe |
|---|---|
| Receção | A confirmação de que o relatório chegou, e se se reproduz |
| Aceite | Uma correção na próxima versão de cada [versão suportada](development.html#supported-versions), e um aviso publicado que lhe dá o crédito, a não ser que prefira não ser nomeado |
| Recusado | A justificação, normalmente que o comportamento precisa de uma permissão que quem reportou já tinha |

Depois de a correção ser publicada, o aviso é publicado e aparece em [Avisos de segurança](advisories.html).

---

## Âmbito

A política traça a linha onde o modelo de funções a traça:

| Dentro do âmbito | Fora do âmbito |
|---|---|
| Tudo aquilo a que um utilizador com sessão iniciada consegue aceder para além do que a sua função lhe concede | Descobertas que exigem que a conta de administrador já esteja comprometida: um administrador a executar qualquer playbook é o próprio produto |
| Tudo aquilo a que se consegue aceder sem iniciar sessão | Relatórios de scanners sem impacto demonstrado |
| Credenciais guardadas que se tornam legíveis, ou que são escritas num registo | |
| Injeção na shell, na base de dados ou no navegador | |
