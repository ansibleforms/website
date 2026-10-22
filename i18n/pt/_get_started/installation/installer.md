---
layout: default
title: Instalador
parent: Instalação
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# O instalador
{: .no_toc }

Instale, atualize e cuide do AnsibleForms num servidor Linux, com um único comando
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: o caminho mais rápido para uma instância a funcionar, ou para um Runner de um AnsibleForms instalado noutro sítio. Desde a 7.3.0.

---

## O que instala

O instalador faz algumas perguntas num assistente em ecrã inteiro, mostra todas as respostas para revisão e só então altera o servidor.
Instala uma de duas funções, num de quatro motores:

| Função | O que é |
|---|---|
| Controlador | A aplicação completa: a interface web, a sua base de dados e o seu próprio Runner. Escolha esta opção numa primeira instalação |
| Runner | Um RTE que executa os playbooks de um AnsibleForms instalado noutro sítio, por exemplo noutra rede, numa DMZ ou noutro centro de dados. Comunica com o AnsibleForms através de um único WebSocket e não guarda credenciais da base de dados |

Os motores em que as instala:

| Motor | Como é executado |
|---|---|
| Docker | O [projeto Docker Compose](docker-compose.html), no Docker Engine com o seu plugin de compose. Os contentores reiniciam juntamente com o Docker |
| Podman | O mesmo projeto no Podman, rootless ou como root, com podman-compose. Uma unidade systemd inicia os contentores no arranque |
| Kubernetes | O [chart de Helm](kubernetes.html), no cluster a que o `kubectl` chega. Um controlador é servido por trás de um ingress; um Runner usa o modo runner do chart |
| Diretamente neste servidor | Sem contentores: Node.js, MariaDB e Ansible no servidor, e o AnsibleForms como serviços systemd. Consulte [Instalação nativa](native.html) |

Depois da instalação, o mesmo programa atualiza a instalação, faz cópias de segurança, mostra o seu estado e remove-a. Também assume um
AnsibleForms que não instalou, como um configurado à mão a partir do projeto Docker Compose (consulte [Uma instalação existente](#an-existing-installation)).

---

## Execute-o

O script de instalação descarrega o instalador para este servidor e inicia-o:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

As variantes habituais: como root, para instalar o Docker ou o Podman, para instalar diretamente no servidor ou em `/opt`; com um comando ou
flags (consulte [Flags](#flags)); e um instalador de uma versão concreta em vez da mais recente:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

O script:

1. Verifica que o servidor corre Linux em amd64 ou arm64, e encontra `curl` ou `wget` e `sha256sum`
2. Descarrega `ansibleforms-installer_linux_<arch>` da versão mais recente de
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), ou da versão indicada em `AF_INSTALLER_VERSION`
3. Verifica-o contra o `checksums.txt` da versão, e não usa nenhuma transferência cujo checksum seja diferente
4. Guarda-o como `ansibleforms-installer`, em `/usr/local/bin` para o root e em `~/.local/bin` caso contrário, para as atualizações e cópias de segurança posteriores.
   Através do sudo, execute-o pelo caminho completo: o `secure_path` do sudo, como nos sistemas Red Hat, muitas vezes não inclui `/usr/local/bin`
5. Inicia-o com as flags indicadas, lendo o teclado a partir do terminal, mesmo que o script tenha chegado através de um pipe

Sem um terminal, como numa tarefa de CI, o instalador corre sem intervenção (consulte [Sem intervenção](#unattended)).

---

## O assistente

O assistente faz uma pergunta de cada vez, com os passos listados à esquerda. **Esc** volta ao passo anterior, mantendo a sua resposta:

| Passo | O que pergunta |
|---|---|
| Idioma | O idioma do instalador, por predefinição o da locale deste servidor: catalão, alemão, inglês, espanhol, francês, italiano, japonês, neerlandês, polaco, português ou chinês. É perguntado primeiro, antes de o instalador dizer algo sobre uma instalação que tenha encontrado |
| Notas | O que há de novo na versão que instala, com as alterações incompatíveis, as remoções e as descontinuações primeiro |
| Função | Controlador ou Runner |
| Motor | Docker, Podman, Kubernetes ou diretamente neste servidor |
| Pasta | A pasta de instalação e o nome da instância |
| Adesão, Aplicação, Modo | Apenas num Runner: consulte [Um Runner](#a-runner). O modo não é perguntado em Kubernetes |
| Rede | A porta da interface web, ou do Runner. Não em Kubernetes |
| HTTPS | Como os navegadores se ligam a um controlador |
| Admin | A palavra-passe do primeiro administrador, escrita duas vezes |
| Cluster, Ingress, Armazenamento | Apenas em Kubernetes: o namespace e a release, o ingress (num controlador), a classe de armazenamento |
| Revisão | Todas as respostas: **Instalar**, ou **Alterar respostas** |

**Motor.** A lista mostra o que este servidor tem. Um motor que falte é oferecido como *Docker (não instalado: o instalador instala-o)*
ou o mesmo para o Podman: depois de confirmar, o instalador instala o Docker com o script do próprio Docker (`get.docker.com`, com o plugin de compose
incluído) ou o Podman com o podman-compose a partir dos pacotes da distribuição. Isso exige root. O Kubernetes é oferecido quando o `kubectl` e o
`helm` estão instalados e chegam a um cluster. *Diretamente neste servidor* exige root e um Linux suportado, e diz porquê quando aparece desativado.

**Pasta.** As predefinições:

| | Controlador | Runner |
|---|---|---|
| Pasta, como root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Pasta, como outro utilizador | `~/ansibleforms` | `~/ansibleforms-runner` |
| Nome da instância, Docker ou Podman | `af` | `runner` |
| Nome da instância, nativa | `ansibleforms` | `ansibleforms-runner` |

Com Docker ou Podman, a pasta contém o ficheiro de compose e o seu `.env` com os segredos, e todos os dados: base de dados, formulários, playbooks
e registos. Tem de estar vazia. O nome da instância, com letras minúsculas, dígitos e `-`, serve de prefixo aos contentores (`af_app`, `af_db`, `af_rte`), para que várias
instâncias possam partilhar um servidor. O nome da instância de um Runner é também o nome do seu runner em **Ligações > Runners** (`RTE_NAME`).

**Rede.** A interface web de um controlador escuta na `443`, ou na porta livre seguinte. **HTTPS** oferece então:

| Opção | O que faz |
|---|---|
| HTTPS com um certificado autoassinado criado para este servidor | Um certificado para os nomes deste servidor, válido durante dez anos. Os navegadores pedem-lhe que o aceite uma vez |
| HTTPS com o meu próprio certificado e chave | O seu próprio certificado e chave, em formato PEM, da sua CA ou do Let's Encrypt |
| HTTP, com o HTTPS tratado por um reverse proxy à frente | HTTP simples na porta, para nginx, Traefik ou um balanceador de carga que trate do HTTPS |

**Admin.** A palavra-passe do utilizador `admin`, escrita duas vezes para que um erro de digitação não o deixe de fora. Se ficar vazia, o instalador gera
uma forte.

**O fim.** O instalador gera a palavra-passe da base de dados e os segredos, inicia o AnsibleForms e espera até que responda. Depois
mostra o endereço a abrir, o utilizador e a palavra-passe, e a pasta. Os Runners instalados para ele pedem para aderir, e um administrador aprova-os
em **Ligações > Runners** (consulte [Um Runner](#a-runner)).

---

## Um Runner

Um Runner é um RTE para um AnsibleForms que corre noutro sítio, na versão 7.3.0 ou posterior. Não guarda credenciais da base de dados: inicia sessão
com um token próprio, que o AnsibleForms guarda numa credencial de RTE (consulte [Modos](../rte/modes.html)). Depois da pasta, o assistente
pergunta mais três coisas:

| Passo | O que pergunta |
|---|---|
| Aplicação | O endereço do AnsibleForms para o qual este Runner trabalha, o que as pessoas abrem num navegador |
| Modo | **Saída: o Runner liga-se ao AnsibleForms** (a predefinição), ou **Entrada: o AnsibleForms liga-se ao Runner** |
| Rede | A porta do Runner, `8000` por predefinição. Em saída, só as verificações de saúde escutam nela, acessíveis apenas a partir deste servidor. Em entrada, também o endereço deste servidor tal como o AnsibleForms o alcança |

`--role runner` salta a pergunta da função, por isso este comando, executado no servidor do Runner, começa com as perguntas de um Runner:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

O instalador liga-se então ao AnsibleForms. Um certificado autoassinado, ou de uma CA privada, pergunta **Confiar neste certificado?**:
sim define [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) no Runner. Lê a versão que o AnsibleForms executa,
recusa uma anterior à 7.3.0 e instala o Runner com essa mesma versão, seja qual for a versão que o próprio instalador instalaria.

Escolha saída para uma DMZ, NAT ou uma zona que não permite ligações de entrada: apenas tráfego deste servidor para o AnsibleForms, na sua
porta. Escolha entrada para redes em que o lado central abre todas as ligações.

A revisão mostra **Registo: pede aprovação**, ou **sozinho, com um token de adesão** quando `--join` indicou um. No fim, o instalador
mostra o nome do Runner, o seu modo, a aplicação e, em entrada, o seu endereço, e depois diz que pediu para aderir ao AnsibleForms: aprove-o em
**Ligações > Runners**, depois de verificar que a impressão digital mostrada aí é a que ele imprime:

```
Fingerprint: abcd-ef12
```

A impressão digital são os primeiros 8 dígitos hexadecimais do SHA-256 do token do Runner, `RTE_TOKEN`, que fica guardado no ficheiro
`.env` da pasta (`rte.env` numa [instalação nativa](native.html)). Consulte [Aprovar um RTE](../runners/registration.html#approving-an-rte). Com `--join`, o Runner é aprovado de imediato:
registou-se a si próprio e aparece como ligado em **Ligações > Runners**.

Um Runner de entrada serve o seu socket por HTTPS. O instalador cria um certificado autoassinado para o endereço em que o AnsibleForms
o alcança, válido durante dez anos, em `data/certificates` da pasta, e define `RTE_URL` como `https://<address>:<port>`.
O Runner envia o certificado quando pede para aderir, e o AnsibleForms fixa-o: só se liga a esse Runner quando ele apresenta
esse mesmo certificado, por isso não é necessária nenhuma CA. O instalador imprime a impressão digital do certificado por baixo da do token:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

São os primeiros 8 dígitos hexadecimais do SHA-256 dos bytes DER do certificado, como `xxxx-xxxx`. Antes de aprovar o Runner,
verifique que a janela de aprovação mostra a mesma impressão digital do certificado. Um Runner registado com `--join` também a imprime.

Em Kubernetes, um Runner é o modo runner do chart de Helm, e é sempre de saída: o assistente não pergunta o modo nem a rede, pois nada
o alcança a partir de fora (consulte [Kubernetes](#kubernetes)).

---

## Kubernetes

Para um controlador em Kubernetes, o instalador instala o [chart de Helm](kubernetes.html) no cluster a que o `kubectl` chega:

| Pergunta | Predefinição |
|---|---|
| Namespace | `ansibleforms` |
| Nome da release Helm | `ansibleforms` |
| Nome de anfitrião servido pelo ingress | Nenhum: obrigatório, como `ansibleforms.example.com` |
| Classe de ingress | Uma das do cluster, `nginx` por predefinição |
| Servir por HTTPS (com o certificado do ingress)? | Sim |
| Classe de armazenamento para os volumes | A predefinida do cluster |

A palavra-passe de administrador está no Secret `<release>-secrets` desse namespace, na chave `ADMIN_PASSWORD`. O instalador guarda os
valores do chart num ficheiro ao lado do seu ficheiro de estado, `<release>-values.yaml`, e volta a aplicá-lo nas atualizações; `--values` acrescenta um ficheiro seu. O chart de uma versão é publicado pouco depois dela.

Para um Runner, o instalador instala o mesmo chart no seu [modo runner](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): um RTE
sozinho, sem aplicação, sem base de dados e sem ingress, que se liga ao AnsibleForms (saída). Depois do endereço da aplicação, o assistente pergunta:

| Pergunta | Predefinição |
|---|---|
| Namespace | `ansibleforms` |
| Nome da release Helm | `ansibleforms-runner`, que é também o nome do seu runner em **Ligações > Runners** |
| Classe de armazenamento para os volumes | A predefinida do cluster |

O instalador cria o token do Runner e define o endereço da aplicação, o nome do runner e, quando confia no certificado da aplicação,
`runner.appTlsVerify: false`. Com `--join`, o token de adesão aprova o Runner de imediato; sem ele, o Runner pede para aderir, e o
instalador imprime a sua impressão digital para a verificar antes de o aprovar em **Ligações > Runners**.

---

## Comandos

O instalador aceita um comando, antes ou depois das suas flags. Sem nenhum, instala:

| Comando | O que faz |
|---|---|
| `install` | Instala o AnsibleForms, como controlador ou como Runner (a predefinição). Num servidor que já tem uma instalação, própria ou que encontre, oferece-se para a atualizar |
| `upgrade` | Atualiza para uma versão mais recente, mostrando primeiro as suas notas de versão (consulte [Atualizar](#upgrade)) |
| `status` | Mostra a instalação (a sua função, motor e versão) e os seus contentores, pods ou serviços, e se responde. Depois lista qualquer outro AnsibleForms que encontre no servidor |
| `backup` | Faz agora uma cópia de segurança da base de dados, para `installer-backups` na pasta de instalação (em Kubernetes, `backups` ao lado do ficheiro de estado do instalador). Um Runner não tem dados para copiar |
| `release-notes` | Mostra as notas de versão de uma versão, `--version` ou a deste instalador, com as alterações incompatíveis primeiro |
| `uninstall` | Remove a instalação, e com `--purge` os seus dados |
| `version` | Imprime a versão do instalador |

O instalador lembra-se da instalação em `/etc/ansibleforms/installer.json` para o root, ou em `~/.config/ansibleforms/installer.json`
para outro utilizador, por isso os comandos depois de `install` não precisam de flags e encontram a instalação sozinhos. Essa pasta não contém nenhum binário,
e só existe depois de o instalador ter instalado ou assumido um AnsibleForms:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` pergunta **Eliminar também os dados (BD, formulários, playbooks, registos)?**. Para os eliminar, escreva o nome da instância (a release de Helm
em Kubernetes); caso contrário, remove os contentores, pods ou serviços e mantém os dados.

---

## Flags

Cada flag responde a uma pergunta, que o assistente depois salta. `ansibleforms-installer --help` lista-as:

| Flag | O que responde |
|---|---|
| `--lang <code>` | O idioma: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` ou `zh` |
| `--version <version>` | A versão do AnsibleForms a instalar ou para a qual atualizar; por predefinição a deste instalador |
| `--role <role>` | `controller` ou `runner` |
| `--mode <mode>` | `compose`, `kubernetes` ou `native` |
| `--runtime <runtime>` | `docker` ou `podman` (compose) |
| `--install-runtime` | Instala o Docker ou o Podman quando faltam, sem perguntar |
| `--dir <folder>` | A pasta de instalação (compose) |
| `--name <name>` | O nome da instância, o prefixo dos seus contentores (compose, `af` por predefinição) |
| `--port <port>` | A porta no host: a interface web num controlador, o RTE num Runner |
| `--tls <choice>` | `self`, `own` ou `off` (um controlador compose) |
| `--cert <file>`, `--key <file>` | Os ficheiros do certificado e da chave, com `--tls own` |
| `--admin-password <password>` | A palavra-passe do primeiro administrador; gerada por predefinição |
| `--join <token>` | Um token de adesão (`afj_...`), criado através da API, que aprova o Runner de imediato (um Runner, sem intervenção; consulte [Tokens de adesão](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | O endereço da aplicação, como `https://forms.example.com` (um Runner) |
| `--runner-mode <mode>` | `outbound` (o RTE liga-se à aplicação) ou `inbound` (a aplicação liga-se ao RTE) (um Runner) |
| `--host <address>` | O endereço deste servidor, ao qual a aplicação se liga (um Runner de entrada) |
| `--namespace <namespace>` | O namespace de Kubernetes, `ansibleforms` por predefinição |
| `--release <release>` | A release de Helm, `ansibleforms` por predefinição |
| `--hostname <name>` | O nome de anfitrião do ingress (kubernetes) |
| `--ingress-class <class>` | A classe de ingress (kubernetes) |
| `--storage-class <class>` | A classe de armazenamento (kubernetes) |
| `--values <file>` | Um ficheiro de valores de Helm adicional (kubernetes) |
| `--purge` | Com `uninstall`: elimina também os dados |
| `--source <folder>` | Uma cópia local do repositório [ansibleforms/docker](https://github.com/ansibleforms/docker) a partir da qual instalar (air-gapped) |
| `--bundle <file>` | Um pacote de versão, `ansibleforms-<version>-linux-<arch>.tar.gz`, a partir do qual instalar de forma nativa (consulte [Instalação nativa](native.html#air-gapped)) |
| `--yes` | Responde a todas as perguntas com a predefinição (sem intervenção) |
| `--verbose` | Mostra todos os comandos que executa |

---

## Sem intervenção

Com `--yes`, ou sem um terminal, o instalador não pergunta nada: as flags respondem às suas perguntas e as predefinições respondem ao resto. Salta
o idioma, as notas de versão, a palavra-passe de administrador (gerada, a menos que `--admin-password` indique uma) e a revisão, e imprime
em vez disso a ligação para as notas de versão. Só instala um Docker ou Podman em falta com `--install-runtime` ou `--yes`, e um Runner
precisa de `--app-url`. Sem `--join`, o Runner pede para aderir e espera pela aprovação de um administrador; com ele, é aprovado de imediato.

Um controlador em Docker, instalando o Docker quando falta:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Um Runner de entrada em Podman, ao qual a aplicação se liga em `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Uma instalação existente

O instalador lembra-se do que instalou em `installer.json`. Sem esse ficheiro, `install`, `upgrade` e `status` procuram primeiro um
AnsibleForms que já esteja no servidor, seja o que for que o tenha instalado:

| Encontrado | Como é encontrado | Assumido quando |
|---|---|---|
| Docker ou Podman | Contentores da imagem da aplicação ou do RTE, agrupados por projeto compose | A pasta contém o ficheiro de compose e o `.env` do repositório [ansibleforms/docker](https://github.com/ansibleforms/docker): os serviços `mysqldb`, `app` e `rte`, nos contentores `<name>_db`, `<name>_app` e `<name>_rte` |
| Um Runner 7.2 | Um RTE sozinho no seu projeto compose, com os `DB_*` da aplicação e sem `RTE_MODE` (modo base de dados) | O seu ficheiro de compose é legível. A sua atualização passa-o para um modo socket (consulte [Um Runner 7.2](#a-72-runner)) |
| Kubernetes | Releases de Helm do chart `ansibleforms`, e Deployments e StatefulSets das suas imagens | É uma release do chart: os seus valores atuais tornam-se o seu ficheiro de valores |
| Nativa | Serviços systemd que executam o AnsibleForms com Node.js | Seguem a estrutura do instalador: `releases/`, `current`, `app.env` e `rte.env` (consulte [Instalação nativa](native.html#the-folder)) |
| Sem motor | A aplicação ou um RTE a responder numa porta habitual: 443, 3000, 3001, 8000, 8001, 8010 ou 8443 | Nunca: é executado a partir do código-fonte ou à mão. O instalador apenas o comunica |

Só contam as imagens da aplicação e do RTE: um contentor MySQL com o nome do AnsibleForms não é uma instalação. O instalador lista o que
encontrou, uma linha por cada, com o motivo e o que fazer à mão para uma que não consegue assumir: o seu ficheiro de compose não é o do repositório,
a sua base de dados está fora do seu projeto compose, corre em Kubernetes sem o chart de Helm, é gerida pelo Argo CD (atualize-a aí,
alterando a versão do chart da Application), ou não é possível ler a sua versão.

Para uma instalação que consegue assumir, `install` oferece três opções:

| Opção | O que faz |
|---|---|
| Assumir e atualizar | Mostra o que vai memorizar, depois escreve `installer.json` assim que confirmar, e continua com a [atualização](#upgrade) |
| Instalar mesmo assim um novo AnsibleForms ao lado | Uma segunda instalação, com a sua própria pasta, portas e base de dados, depois de uma confirmação própria |
| Parar | Nada é alterado |

Para uma instalação que já executa a versão que o instalador instalaria, a primeira opção passa a ser **Assumir**: o instalador
memoriza onde está e como é executada, para as suas cópias de segurança, estado e próximas atualizações, e nada é alterado agora.

`upgrade` oferece o mesmo sem a segunda opção, e para quando não há nada para assumir. Sem intervenção, `install` para com uma mensagem,
e `upgrade --yes` só assume uma instalação quando encontra exatamente uma que consiga assumir. Os valores atuais de uma release de Kubernetes são
guardados ao lado de `installer.json`, e as atualizações voltam a aplicá-los com o chart da nova versão.

---

## Atualizar

`ansibleforms-installer upgrade` passa a instalação para uma versão mais recente da mesma versão principal. Lista as versões mais recentes,
a mais nova primeiro (sem intervenção, escolhe a mais nova), e mostra as notas de versão de todas as versões que ultrapassa, com as alterações incompatíveis
e as remoções primeiro. Quando contêm alterações incompatíveis, pede-lhe que confirme que as leu; sem intervenção, só `--yes` continua.

O instalador faz uma cópia de segurança da base de dados antes de alterar seja o que for. Quando a nova versão não responde, oferece-se para reverter: a versão
anterior volta, e a sua base de dados é restaurada a partir dessa cópia de segurança. Não faz downgrade, e não atravessa uma versão principal: siga
o [guia de atualização](../upgrade-7.html) para isso, por exemplo da 6.x para a 7.x, com o que fazer na 6.5 antes de atualizar.

Em Docker ou Podman, a atualização de um controlador também atualiza os seus ficheiros para a nova versão do repositório docker:

| Ficheiro | O que a atualização faz |
|---|---|
| `docker-compose.yml` | Substituído pelo da nova versão, depois de guardar uma cópia em `installer-backups` |
| `.env` | Todas as linhas existentes são mantidas, e são adicionadas as chaves de que a nova versão precisa, com segredos criados tal como numa instalação nova. É guardada primeiro uma cópia |
| `data/seed.yaml` | Substituído quando é um seed fornecido pelo repositório docker, sem alterações. Um alterado à mão é mantido, e o novo é guardado ao lado |
| `data/` | São adicionados os ficheiros novos que a versão traz, como um novo playbook. Todos os ficheiros existentes são mantidos |

Uma definição da base de dados em falta (`MYSQLDB_USER` ou uma palavra-passe) não pode ser inventada para uma base de dados que já existe, por isso a atualização para antes
de qualquer alteração. Uma reversão repõe o ficheiro de compose, o `.env` e o seed tal como estavam.

Um Runner executa a mesma versão que o seu AnsibleForms: atualize primeiro o AnsibleForms e depois os seus Runners. A atualização de um Runner reescreve o seu
ficheiro de compose para a nova imagem do RTE e mantém o seu `.env` e os seus dados como estão.

---

## Um Runner 7.2

Um Runner da 7.2 corre em modo base de dados, obsoleto desde a 7.3.0: o seu RTE guarda as definições da base de dados do AnsibleForms. O instalador encontra-o
(consulte [Uma instalação existente](#an-existing-installation)), e a sua atualização passa-o para um modo socket sob o mesmo runner:

1. Lê o nome do runner (`RTE_NAME`) e o token (`RTE_TOKEN`) do contentor RTE antigo. Quando o RTE não se registou a si próprio
   (`RTE_REGISTER=0`), escreve o nome que o seu runner tem em **Ligações > Runners**
2. Pergunta o endereço da aplicação e o modo, **saída** por predefinição ou entrada, e em entrada a porta e o endereço deste servidor
3. Mostra o plano e depois faz uma cópia de segurança do ficheiro de compose antigo e do `.env` para `installer-backups`
4. Escreve a estrutura de Runner do instalador sem as definições `DB_*`. Mantém `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` e `METRICS_TOKEN`, que um RTE em modo socket continua a ler
5. Inicia o novo RTE ao lado do antigo. O novo RTE inicia sessão com o token do próprio runner, e o AnsibleForms passa o runner para o
   novo modo sozinho, **sem aprovação**: as suas tarefas e os formulários que o indicam não mudam
6. Assim que o novo RTE estiver ligado, o contentor antigo é parado e removido

Um Runner de entrada serve HTTPS com um certificado fixado, tal como um novo (consulte [Um Runner](#a-runner)), e o instalador imprime a
impressão digital do seu certificado. Quando o RTE antigo ocupa a porta de que o novo precisa, é parado primeiro, por isso o Runner fica offline até o
novo se ligar. O novo RTE de um Runner de saída usa uma porta livre em `127.0.0.1` e corre ao lado do antigo sem interrupção.

Quando o instalador não consegue ler um token do RTE antigo, escolhe como o novo RTE inicia sessão:

| Opção | O que se segue |
|---|---|
| Escrever o token do runner | A palavra-passe da credencial de RTE do runner em **Ligações > Credenciais**. O runner mantém o seu nome e as suas tarefas |
| Aderir como runner novo com um token de adesão | Um [token de adesão](../runners/registration.html#join-tokens) adiciona um novo runner com outro nome. Retire o runner antigo à mão |

Quando o novo RTE não se liga, o instalador oferece-se para repor os ficheiros antigos e voltar a iniciar o contentor antigo; se o AnsibleForms
já tinha passado o runner para o novo modo, volte a colocar o seu modo em base de dados em **Ligações > Runners**. Assim que o novo RTE estiver ligado, não há
volta atrás: os ficheiros antigos ficam em `installer-backups`.

Quando o AnsibleForms não conhece nenhum runner com esse nome, o novo RTE pede antes para aderir e espera por uma aprovação. Rejeite esse pedido em
**Ligações > Runners** e depois execute novamente a atualização com o nome que o runner tem lá.

---

## Versões

A versão do instalador acompanha a da aplicação: cada versão do AnsibleForms vem com um instalador da mesma versão, lançado com ela, e
esse instalador instala essa versão por predefinição. `--version` instala outra. Cada versão na
[página de Releases do instalador](https://github.com/ansibleforms/installer/releases) tem binários para Linux em amd64 e arm64, com os seus
checksums.
