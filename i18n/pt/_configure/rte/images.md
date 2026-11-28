---
layout: default
title: Imagens
parent: RTE
nav_order: 1
translated_from: 42d2358e58b374791786a5f99e571e566eca4d4a
---

# Imagens do RTE
{: .no_toc }

As três imagens publicadas do RTE, e um RTE seu com as collections e bibliotecas que os seus playbooks usam
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As imagens do RTE

O RTE é publicado em três camadas, cada uma construída sobre a anterior, com as mesmas tags que o controlador (consulte [Tags das imagens](../installation/#image-tags)):

| Imagem | O que contém | Use-a |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js e o servidor do AnsibleForms, git, ssh e sshpass. Sem python e sem ansible, por isso não corre nenhum playbook sozinha | Para construir um RTE com as suas próprias versões de python e ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | A base, mais python 3.14, ansible-core e algumas bibliotecas comuns (`jmespath`, `netaddr`, `requests`, `paramiko`). Sem collections | Para construir um RTE mais pequeno só com as collections e bibliotecas que os seus playbooks usam |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | A core, mais o pacote `ansible` sobre o mesmo ansible-core, e o que a imagem do AnsibleForms 6.5 tinha: as collections da NetApp, da AWS e da comunidade, `pandas`, `pyvmomi`, `boto3`, o cliente mariadb, ytt e algumas ferramentas do sistema operativo | **A predefinição.** Corra-a tal como está: os playbooks da 6.5 encontram o que usavam |

Tal como a imagem do controlador, todas as camadas correm como o utilizador `node` (uid 1000), e os playbooks também correm como esse utilizador.

A partir da 7.6.0, todas as camadas são publicadas para `linux/amd64` e `linux/arm64` com a mesma tag. Um RTE que construa sobre uma é
construído para a arquitetura da máquina que o constrói: para hosts arm64, construa-o num deles, ou com `docker buildx build --platform linux/arm64`.

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

Mantenha a imagem na versão do controlador: `:7` acompanha o `:7` do controlador. As collections e os roles também podem ser montados em vez de incluídos na imagem, em
`/etc/ansible/collections` e `/etc/ansible/roles`. Assim não é preciso reconstruir a cada alteração, mas o que corre depende desse volume;
as bibliotecas python vão sempre para a imagem. Incluir tudo na imagem é reprodutível e arranca depressa, o que faz disso o caminho para produção.

---

## Construí-lo no Designer

A partir de 7.9.0 descreve um ambiente de execução no Designer; um [builder](builder.html) constrói a sua imagem, envia-a e assina-a.

1. Dê a um repositório o uso **Ambientes de execução** (Definições > Repositórios); guarda as definições.
2. No Designer, abra **Ambientes de execução** e clique em **Novo**: preencha-o no separador **Visual**, ou escreva-o no separador **YAML**.
3. **Guardar**, depois **Push** para fazer commit no repositório, e **Compilar**: a compilação é uma tarefa na página **Tarefas**, com o seu log em direto.

Cada ambiente de execução é uma pasta própria no repositório, com o seu nome, que guarda apenas a sua definição:

```text
rte-netapp/
  rte.yaml
```

O Dockerfile, `ansible.cfg` e os ficheiros de requisitos são escritos de novo em cada compilação, a partir da definição e da versão da app,
por isso nunca ficam desatualizados no repositório. O separador **Ficheiros** mostra-os tal como o builder os recebe.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Todas as chaves exceto o nome podem ser omitidas; a barra de ferramentas do separador **YAML** define cada parte numa caixa de diálogo.

| Chave | O que é |
|---|---|
| `name` | O nome do ambiente de execução, o da sua pasta e o da sua imagem: letras minúsculas, dígitos, pontos, hífenes e sublinhados |
| `arch` | `all`, uma imagem para amd64 e arm64 como as publicadas, ou só `amd64` ou `arm64`; `all` se omitida. Uma arquitetura diferente da do host do builder precisa de [QEMU nesse host](builder.html#amd64-and-arm64) |
| `python` | O python da imagem, de 3.11 a 3.15; 3.15 se omitida |
| `ansible_core` | Uma release do ansible-core (`2.22`) ou versão (`2.22.0`) que corra nesse python; a mais recente que o faça se omitida |
| `ansible_collections` | As coleções, cada uma com o seu `name` (namespace.name) e uma `version` opcional; a mais recente se omitida. O que cada coleção precisa, o seu `requirements.txt` e `bindep.txt` (ou o seu `meta/execution-environment.yml`), é instalado com ela, como faz o ansible-builder |
| `python_packages` | Pacotes python, como linhas de um `requirements.txt` |
| `os_packages` | Pacotes do Debian 13 (trixie) |
| `registry` | `credential`: uma credencial de **Registo de contentores**, com o endereço do registo e o seu login; `path`: o caminho da imagem nele, o seu nome se omitido; `tag`: `app`, a versão da app (`7.9.0`), para que uma recompilação acompanhe cada atualização, ou uma etiqueta sua |
| `sbom` | `true` anexa à imagem uma lista de materiais de software (SBOM) |
| `sign` | `credential`: uma credencial de **Chave de assinatura**, com a qual o builder assina a imagem com o cosign 3; verifique-a com `cosign verify --key <chave pública>` do cosign 3 (o cosign 2 não lê as suas assinaturas) |

Cada ambiente de execução é construído a partir de `ansibleforms-rte-base` da versão da app, por isso um com a etiqueta `app` cuja imagem foi
construída para uma versão anterior aparece como tal na página **Ambientes de execução**, com **Recompilá-los**.

---

## O contrato

O que o controlador e um RTE têm de partilhar é o seu contrato, um número que ambos indicam. Um RTE de uma versão anterior continua a funcionar com um
controlador mais recente desde que ambos falem o mesmo contrato; quando uma versão o altera, as suas notas de versão dizem que os RTE têm de ser atualizados. Cada modo
tem o seu:

| Modo | Contrato | Numa incompatibilidade |
|---|---|---|
| Saída, Entrada | 3, novo na 7.3.0 | O controlador fecha o socket do RTE com o código `4409` e regista *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Um RTE de saída regista *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Uma tarefa enviada com outro contrato é recusada |
| Base de dados (obsoleto) | 2, desde a 7.0.0 | O RTE recusa as tarefas do controlador |

**Testar ligação** no runner diz que contrato o RTE fala e qual o controlador precisa (consulte
[Testar ligação](../runners/runner-page.html#test-connection)), e a linha **Runners** da página **Estado** faz a mesma verificação.
