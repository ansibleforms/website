---
layout: default
title: Preferências
parent: O seu perfil
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Preferências
{: .no_toc }

Idioma, tema, fuso horário, formato de data e notificações no ambiente de trabalho
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As preferências

A vista Preferências muda o aspeto do AnsibleForms para si. Cada escolha é guardada no navegador
onde a faz, pelo que outro navegador ou computador começa com as predefinições.

| Definição | Opções | Também definida a partir de |
|---|---|---|
| Idioma | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (japonês), 简体中文 (chinês simplificado) | a bandeira no cabeçalho |
| Tema | Seguir o navegador, Claro, Escuro, ou Cor (um cabeçalho numa cor que escolher) | o ícone do sol no cabeçalho |
| Vista de formulários | Mosaicos ou Lista | o botão na página Formulários |
| Fuso horário | UTC, o fuso deste navegador, ou qualquer fuso pelo nome | só aqui |
| Formato de data | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` ou `DD.MM.YYYY` | só aqui |
| Notificações no ambiente de trabalho | Ligadas ou desligadas | só aqui |

A partir da 7.3.0, a vista está em separadores, cada um no seu próprio endereço (`/profile/preferences/<tab>`): **Aparência** (idioma, tema e vista
de formulários), **Data e hora** (fuso horário e formato de data) e **Notificações**. A caixa de pesquisa por cima deles lista as definições que correspondem
sob o nome do seu separador. Uma escolha é um rascunho até **Guardar**, e sair da vista com uma alteração por guardar pede confirmação primeiro.

**Seguir o navegador** passa a claro ou escuro como o navegador, e muda com ele. É o tema predefinido a partir da 7.3.0, a menos que o seu
administrador escolha outro. Passar o rato sobre uma cor do tema **Cor**, aqui ou no menu de temas do cabeçalho, pré-visualiza a aplicação nessa
cor, e o tema anterior volta quando o ponteiro sai da paleta; nada muda até um clique.

---

## Notificações no ambiente de trabalho

A partir da 7.3.0, o separador **Notificações** liga as notificações no ambiente de trabalho neste navegador, para os utilizadores cuja função define `showJobs`.

O navegador pede a sua autorização da primeira vez. Quando bloqueia as notificações do site, o interruptor fica desligado e diz como
as permitir, e um site em `http` simples não as pode mostrar de todo. Depois de ligadas, chega uma notificação:

| Quando | O que diz | Um clique nela |
|---|---|---|
| Uma tarefa que lançou termina | O formulário e o seu resultado, como *Patch Linux servers: Bem-sucedidas*, com o número e a duração da tarefa | Traz o separador para a frente nessa tarefa |
| Uma tarefa aguarda a sua aprovação | O formulário, o número da tarefa e quem a lançou, com os botões **Aprovar** e **Rejeitar** | Abre as tarefas à espera de aprovação |

Os botões **Aprovar** e **Rejeitar** aparecem no Chrome e no Edge; o Firefox e o Safari mostram a notificação sem eles, tal como um
site com um certificado autoassinado, já que os botões precisam de um service worker. As notificações só chegam enquanto houver um separador do AnsibleForms aberto,
mesmo em segundo plano: não é enviado nada depois de todos os separadores estarem fechados. Cada uma aparece uma vez, por muitos separadores que estejam abertos, e os passos de uma
tarefa multistep e a tarefa que está a ver ficam em silêncio.

---

## Fuso horário

As datas e horas em todo o AnsibleForms são mostradas no fuso horário que selecionar. Isto inclui as horas de início
e de fim das tarefas, o registo de auditoria, a página de estado, as cópias de segurança, as tarefas guardadas e a expiração de um token
de API. Mudar o fuso horário atualiza de imediato todas as páginas, sem recarregar.

Até escolher um, aplica-se o fuso horário que o seu administrador definiu para todos (**Definições > Aparência > Predefinições**, ver
[Aparência](../appearance.html)), **UTC** se não tiver sido alterado. **Este navegador** segue o fuso horário do seu computador, e a
lista contém todos os fusos pelo nome, como `Europe/Madrid`. O cartão mostra a hora atual no fuso e formato selecionados.

---

## Formato de data

O formato de data define como se lê a parte da data de cada data, com cada opção mostrada com a data de hoje: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` ou `DD.MM.YYYY`. Até escolher um, aplica-se o formato de data predefinido do seu administrador,
`YYYY-MM-DD` se não tiver sido alterado. Tal como as outras escolhas, fica guardado neste navegador.

---

## O que mantém as horas do servidor

Há duas exceções que mantêm as horas do próprio servidor:

- **O registo do servidor e o resultado das tarefas** são texto que contém as horas que o servidor lá escreveu.
- **As horas que introduz**, como quando uma tarefa planeada deve correr, e os agendamentos cron, funcionam como
  antes.
