---
layout: default
title: Imagens
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# Imagens do RTE
{: .no_toc }

As três imagens publicadas do RTE, e um RTE seu com as collections e bibliotecas que os seus playbooks usam
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As imagens do RTE

O RTE é publicado em três camadas, cada uma construída sobre a anterior, com as mesmas tags que a aplicação (consulte [Tags das imagens](../installation/#image-tags)):

| Imagem | O que contém | Use-a |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js e o servidor do AnsibleForms, git, ssh e sshpass. Sem python e sem ansible, por isso não corre nenhum playbook sozinha | Para construir um RTE com as suas próprias versões de python e ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | A base, mais python 3.14, ansible-core e algumas bibliotecas comuns (`jmespath`, `netaddr`, `requests`, `paramiko`). Sem collections | Para construir um RTE mais pequeno só com as collections e bibliotecas que os seus playbooks usam |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | A core, mais o pacote `ansible` sobre o mesmo ansible-core, e o que a imagem do AnsibleForms 6.5 tinha: as collections da NetApp, da AWS e da comunidade, `pandas`, `pyvmomi`, `boto3`, o cliente mariadb, ytt e algumas ferramentas do sistema operativo | **A predefinição.** Corra-a tal como está: os playbooks da 6.5 encontram o que usavam |

Tal como a imagem da aplicação, todas as camadas correm como o utilizador `node` (uid 1000), e os playbooks também correm como esse utilizador.

---

## Construir o seu próprio RTE

Construa sobre `ansibleforms-rte-core` e adicione as collections e as bibliotecas python que os seus playbooks usam. Este exemplo da NetApp é um dos
Dockerfiles de [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

O ambiente python e a pasta das collections pertencem a `node`, por isso estas instalações não precisam de root. Uma camada que instala pacotes
do sistema operativo muda para `USER root` para eles e volta a `USER node` no fim. Para trazer o seu próprio python e ansible, construa sobre
`ansibleforms-rte-base` (`Dockerfile.own-ansible` na mesma pasta).

Mantenha a imagem na versão da aplicação: `:7` acompanha o `:7` da aplicação. As collections e os roles também podem ser montados em vez de incluídos na imagem, em
`/etc/ansible/collections` e `/etc/ansible/roles`. Assim não é preciso reconstruir a cada alteração, mas o que corre depende desse volume;
as bibliotecas python vão sempre para a imagem. Incluir tudo na imagem é reprodutível e arranca depressa, o que faz disso o caminho para produção.

---

## O contrato

O que a aplicação e um RTE têm de partilhar é o seu contrato, um número que ambos indicam. Um RTE de uma versão anterior continua a funcionar com uma
aplicação mais recente desde que ambos falem o mesmo contrato; quando uma versão o altera, as suas notas de versão dizem que os RTE têm de ser atualizados. Cada modo
tem o seu:

| Modo | Contrato | Numa incompatibilidade |
|---|---|---|
| Saída, Entrada | 3, novo na 7.3.0 | A aplicação fecha o socket do RTE com o código `4409` e regista *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Um RTE de saída regista *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Uma tarefa enviada com outro contrato é recusada |
| Base de dados (obsoleto) | 2, desde a 7.0.0 | O RTE recusa as tarefas da aplicação |

**Testar ligação** no runner diz que contrato o RTE fala e qual a aplicação precisa (consulte
[Testar ligação](../runners/runner-page.html#test-connection)), e a linha **Runners** da página **Estado** faz a mesma verificação.
