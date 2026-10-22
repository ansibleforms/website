---
layout: default
title: Kubernetes
parent: Instalação
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Instale o AnsibleForms e a sua base de dados MySQL com o chart de Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

O chart de Helm implementa o AnsibleForms com o MySQL e o RTE que executa os playbooks (consulte a [referência de valores](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
O [instalador](installer.html) também instala o chart, a partir de algumas perguntas, e atualiza uma release que não instalou. O mesmo
chart também instala um Runner sozinho, para um AnsibleForms que corre noutro sítio (consulte [Um Runner em Kubernetes](#a-runner-on-kubernetes)).

---

## Pré-requisitos

Antes de começar, precisa de:

* **Cluster Kubernetes** : com o `kubectl` configurado para lhe chegar
* **Helm 3** : para instalar e atualizar o chart
* **Armazenamento** : uma StorageClass para aprovisionamento dinâmico, ou PersistentVolumes criados previamente
* **Ingress controller** : apenas se quiser expor o AnsibleForms através de um ingress

---

## 1. Obtenha os valores do chart

Obtenha os valores predefinidos do chart para um ficheiro seu, a partir do repositório de charts ou do registo OCI:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Repositório de charts</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">Registo OCI</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

Não há repositório a adicionar: o chart é obtido do GitHub Container Registry.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Configure o armazenamento

Tanto o AnsibleForms como o MySQL guardam os seus dados num volume persistente. Defina a StorageClass e o tamanho de cada um:

```yaml
storages:
  server:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
  mysql:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
```

Um `className` vazio usa a StorageClass predefinida do cluster. O modo de acesso é por predefinição `ReadWriteMany`, que muitas classes de
armazenamento não oferecem; `ReadWriteOnce` serve bem com uma única réplica. Para PersistentVolumes criados previamente, consulte o
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) do chart.

---

## 3. Defina as credenciais

O AnsibleForms precisa de uma conta de administrador, de uma palavra-passe da base de dados e de um `ENCRYPTION_SECRET`, a chave que cifra as credenciais
guardadas no AnsibleForms. Para alterar essa chave mais tarde, defina [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
com a antiga durante um arranque: todos os segredos guardados são então cifrados de novo com a nova chave. Forneça-os de uma de três formas:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">No ficheiro de valores</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Gerados pelo chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Secret existente</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Defina-os em `my_values.yaml`. O chart guarda-os num Secret chamado `<release>-secrets`:

```yaml
applications:
  server:
    env:
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: a-strong-password
      ENCRYPTION_SECRET: a-random-string-of-32-characters
  mysql:
    password: a-strong-database-password
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="generate" markdown="1" hidden>

Deixe o chart gerar tudo o que não fornecer, na primeira instalação. Depois mantém os mesmos valores em todas as
atualizações:

```bash
--set secrets.generate=true
```

Isto não funciona com o Argo CD nem com o Flux, que renderizam o chart sem acesso ao cluster. O Secret gerado
sobrevive a `helm uninstall`; faça uma cópia de segurança dele, porque o `ENCRYPTION_SECRET` não pode ser recuperado.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Aponte o chart para um Secret gerido por si, por exemplo com External Secrets, Sealed Secrets ou SOPS. O chart
não cria então nenhum:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

O Secret tem de conter `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` e `ADMIN_PASSWORD`.

</div>
</div>

---

## 4. Escolha a imagem do RTE

O AnsibleForms 7 não executa nenhum playbook por si: quem o faz é o RTE (ambiente de execução). O chart executa-o como um segundo contentor no
pod do servidor, no mesmo volume, e regista-o como o runner predefinido `rte`, para que os formulários de playbook funcionem sem qualquer configuração. Desde a 7.3.0
a aplicação liga-se a ele em `127.0.0.1` e mantém um WebSocket aberto (`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)): o RTE não recebe
definições da base de dados nem a chave de cifragem. O config seed do chart declara uma credencial de RTE com o token e esse endereço, e
o runner, em modo inbound, que inicia sessão com ela.

A imagem predefinida, `ghcr.io/ansibleforms/ansibleforms-rte-full`, contém o ansible com as suas coleções e as bibliotecas Python que a imagem 6.5 tinha.
Para mais, ou para menos, construa a sua própria sobre uma das três camadas do RTE (`ansibleforms-rte-base`, `-rte-core` ou `-rte-full`, consulte
[As imagens do RTE](../rte/images.html)) e aponte o chart para ela:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

O token entre a aplicação e o RTE, e a chave que assina as sessões, são gerados na primeira instalação no
Secret `<release>-keys` e mantidos em todas as atualizações. Com um config seed seu, adicione-lhe essa credencial e esse runner: as notas que o Helm imprime depois da instalação mostram como
(consulte o [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) do chart).

---

## 5. Instale o chart

Instale o chart no seu próprio namespace com os seus valores:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Com o registo OCI, use `oci://ghcr.io/ansibleforms/charts/ansibleforms` como chart. Em tudo o que corra sem intervenção,
fixe a versão do chart com `--version`, para que uma nova versão nunca seja instalada sozinha.

---

## 6. Verifique a instalação

O chart inclui um teste que verifica tanto o servidor web como a ligação à base de dados:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

O teste termina com `OK` quando o AnsibleForms responde e a sua base de dados aceita ligações.

---

## 7. Abra o AnsibleForms

A forma de chegar ao AnsibleForms depende de como o servidor está exposto:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Com o serviço `ClusterIP` predefinido e sem ingress, nada fica exposto fora do cluster. Reencaminhe uma porta local para
dar uma vista de olhos:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Depois abra `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Defina `services.server.type: LoadBalancer` (opcionalmente com um endereço fixo em `services.server.loadbalancer.ip`)
e depois espere que o serviço obtenha o seu endereço:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Ative o ingress e defina o nome de anfitrião que encaminha para o seu ingress controller:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

O [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) do chart trata do TLS por trás de um ingress, incluindo a definição de backend de que o HTTPS no
servidor precisa.

</div>
</div>

---

## 8. Inicie sessão

Inicie sessão como o utilizador administrador, `admin` por predefinição. Para ler a palavra-passe do Secret:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Com `secrets.existingSecret`, leia-a antes do seu próprio Secret.

---

## Um Runner em Kubernetes

Com `runner.enabled`, o chart instala apenas um RTE: um Runner para um AnsibleForms instalado noutro sítio, noutro namespace, noutro
cluster ou numa VM. Liga-se à aplicação e mantém um WebSocket aberto (`RTE_MODE=outbound`, consulte [Modos](../rte/modes.html)), por isso não precisa
de base de dados, de chave de cifragem nem de porta de entrada. Não renderiza aplicação, MySQL, Service nem Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Valor | O que faz |
|---|---|
| `runner.enabled` | Instala apenas o Runner: sem aplicação, sem MySQL, sem Service, sem Ingress |
| `runner.appUrl` | O endereço da aplicação tal como as pessoas o abrem, com o seu `BASE_URL`, se existir. Obrigatório |
| `runner.name` | O nome de runner com que adere (`RTE_NAME`). Vazio: o nome da release |
| `runner.joinToken` | Um [token de adesão](../runners/registration.html#join-tokens) criado na aplicação, lido no primeiro arranque para aprovar o Runner de imediato |
| `runner.appTlsVerify` | `false` aceita o certificado autoassinado da aplicação (`APP_TLS_VERIFY=0`), apenas dentro de uma rede de confiança |

Sem um token de adesão, o Runner pede para aderir e espera até que um administrador o aprove em **Ligações > Runners**. Depois de aprovado,
inicia sessão com o seu próprio `RTE_TOKEN`, guardado no Secret `<release>-keys`: mantenha esse Secret com a release. O
[instalador](installer.html#kubernetes) também instala este modo runner, quando escolhe a função Runner e Kubernetes.

---

## Próximos passos

O [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) do chart trata do resto da configuração:

* **A sua própria base de dados** : defina `mysql.enabled: false` e aponte o AnsibleForms para um servidor MySQL existente
* **Formulários a partir de ConfigMaps** : forneça o `config.yaml` e os ficheiros de formulário através de ConfigMaps
* **HTTPS por trás de um ingress**, recursos, colocação nos nós e registos privados
* **O RTE** : o seu token, uma imagem de RTE própria, ou nenhum RTE

Para passar para uma versão mais recente, consulte [Atualizar em Kubernetes](../upgrading/kubernetes.html).
