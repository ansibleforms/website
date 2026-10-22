---
layout: default
title: Kubernetes
parent: Atualizar
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Atualize uma instalação feita com o chart de Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cada versão do chart implementa uma versão do AnsibleForms. Uma atualização instala uma versão mais recente do chart com os seus valores existentes;
os dados nos volumes persistentes são preservados. Uma atualização que não altera nada deixa os pods intactos.

---

## Antes de atualizar

Prepare a atualização para poder voltar atrás se algo correr mal:

* **Faça uma cópia de segurança** em **Definições → Cópias de segurança**. A nova versão atualiza o esquema da base de dados no primeiro arranque.
* **Leia o [registo de alterações](../changelog)** das versões entre a sua e a nova.
* **Vai passar para uma nova versão principal?** Siga primeiro [Atualizar para a v7](../upgrade-7.html).
* **Leia o [registo de alterações](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) do chart** para ver as alterações aos valores.
* **Com credenciais geradas** (`secrets.generate`), faça uma cópia de segurança do Secret `<release>-secrets`: o `ENCRYPTION_SECRET` não pode ser recuperado.
* **Vem da 7.2?** O RTE no pod do servidor muda de modo: consulte [Da 7.2 para a 7.3](#from-72-to-73).

---

## Da 7.2 para a 7.3

O chart 7.3.0 tira o RTE ao lado da aplicação do modo base de dados, descontinuado na 7.3.0 e removido na 8.0.0. A aplicação liga-se a ele em
`127.0.0.1` e mantém um WebSocket aberto (`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)):

* O contentor do RTE deixa de receber `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` ou `RTE_URL`, e obtém os ficheiros da tarefa a partir
  do volume partilhado (`RTE_FILES=local`)
* O config seed do chart declara uma credencial de RTE com o token e o endereço, e o runner, `rte_mode: inbound`, que inicia
  sessão com ela. Com o seed do chart, não há nada a fazer
* Com `containers.rte.seedRunner: false`, ou um config seed seu (`CONFIG_SEED_PATH`), o RTE deixa de se adicionar a si próprio como runner.
  Declare-o por si, no seu seed ou em **Ligações → Runners**: uma credencial de RTE com `http://127.0.0.1:<port>` e o token,
  e um runner do tipo RTE com `rte_mode: inbound` que a indique. As notas que o Helm imprime depois da atualização mostram como

Desde a 7.3.0 o chart também instala um Runner sozinho, com `runner.enabled` (consulte
[Um Runner em Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Encontre a nova versão do chart

Atualize o repositório de charts e liste as versões do chart disponíveis:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Atualize a release

Execute o mesmo comando `helm upgrade` que na instalação, com o seu ficheiro de valores e a nova versão do chart:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Com o registo OCI, use `oci://ghcr.io/ansibleforms/charts/ansibleforms` como chart.

---

## 3. Verifique a atualização

Espere pelos novos pods e depois execute o teste do chart, que verifica tanto o servidor web como a ligação à base de dados:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

No AnsibleForms, **Ajuda → Acerca de** mostra a versão em execução, e **Definições → Estado** mostra a saúde da
base de dados, do esquema e dos outros sistemas de que o AnsibleForms depende.

---

## Reverter

O Helm guarda o histórico da release. Para voltar à revisão anterior:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Se não arrancar na base de dados atualizada, restaure a sua cópia de segurança (consulte o [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) do chart).
