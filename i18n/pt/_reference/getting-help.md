---
layout: default
title: Obter ajuda
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Obter ajuda
{: .no_toc }

Onde fazer uma pergunta, comunicar um erro ou um problema de segurança, e sugerir uma melhoria
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Antes de perguntar

A maior parte das respostas já está escrita; uma pesquisa rápida poupa muitas vezes uma ida e volta:

1. Pesquise neste site com a caixa de pesquisa no topo de cada página.
2. Procure a mensagem de erro exata em [Resolução de problemas](troubleshooting.html), e dê uma vista de olhos às [FAQ](faq.html).
3. Verifique o registo do servidor (**Definições** e depois **Registo do servidor**) e a página **Estado**, que indicam a maior parte dos problemas de configuração.
4. Verifique o [Registo de alterações](changelog.html): o problema pode já estar corrigido numa versão mais recente.

---

## Onde ir

Cada tipo de pedido tem o seu próprio sítio, todos no GitHub:

| Pretende | Vá a |
|---|---|
| Fazer uma pergunta ou partilhar uma ideia | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Comunicar um erro | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Sugerir uma funcionalidade | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Comunicar um problema de segurança | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), em privado |
| Corrigir ou melhorar esta documentação | **Editar esta página no GitHub** no fundo de qualquer página, ou uma [issue no site](https://github.com/ansibleforms/website/issues) |

---

## Comunicar um erro

Um relatório que possa ser reproduzido é corrigido mais depressa. O modelo de relatório de erro pede o seguinte:

* **Versão** : mostrada em **Acerca de** no menu de ajuda (**?**) da barra superior
* **Implementação** : Docker, Docker Compose, Kubernetes, o instalador (e o seu motor), uma instalação nativa ou a partir do código-fonte
* **Passos para reproduzir** : o que fez, o que esperava e o que aconteceu em vez disso
* **Evidências** : as linhas relevantes do registo do servidor, e uma captura de ecrã quando o problema é visível

Para um problema com um formulário, inclua uma definição de formulário mínima que o mostre. Retire as palavras-passe, os tokens, os nomes de hosts e quaisquer
outros dados privados dos registos e dos formulários antes de os publicar: as issues e as discussões são públicas.

---

## Comunicar um problema de segurança

**Nunca abra uma issue pública para isso:** use [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), que só os maintainers veem.

A [política de segurança](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) lista as versões suportadas e
o que acontece depois de comunicar.
