---
layout: default
title: Nativa
parent: Instalação
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Instalação nativa
{: .no_toc }

O AnsibleForms diretamente no servidor, sem contentores, como serviços systemd configurados pelo instalador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores de servidores onde os contentores não são permitidos: o [instalador](installer.html) instala tudo o que o AnsibleForms precisa
no próprio servidor, e depois atualiza-o e remove-o. Instala o AnsibleForms 7.3.0 ou posterior.

---

## Do que precisa

Escolha **Diretamente neste servidor, sem contentores** no passo **Motor** do instalador, ou passe `--mode native`. Precisa de:

* **Root** : execute o instalador com `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : os serviços correm como unidades systemd
* **Um Linux suportado** : Ubuntu, Debian, RHEL e as suas recompilações como Rocky Linux e AlmaLinux, SUSE Linux Enterprise ou openSUSE
* **amd64 ou arm64**
* **Acesso à Internet** : aos repositórios da distribuição, ao GitHub, ao nodejs.org e aos índices de pacotes de Python e Ansible (consulte
  [Air-gapped](#air-gapped) para saber o que um pacote de versão substitui)

Num servidor que não cumpra isto, o motor aparece como *Diretamente neste servidor (requer root: execute o instalador com sudo)* ou
*Diretamente neste servidor (não suportado neste Linux)*. As duas funções instalam-se desta forma: um controlador e um [Runner](installer.html#a-runner).

---

## O que instala

O instalador instala o seguinte a partir dos pacotes da distribuição, para as duas funções:

| Pacote | Porquê |
|---|---|
| `git` | Os repositórios |
| O cliente ssh | As ligações dos playbooks |
| O cliente MariaDB | As cópias de segurança da aplicação: `app.env` define [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) e [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) com o cliente encontrado, `mariadb-dump` e `mariadb` ou os mais antigos `mysqldump` e `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | As transferências |
| `libatomic` | O Node.js liga-se a ela, e os servidores mínimos não a têm |
| `sshpass` | Playbooks que iniciam sessão com uma palavra-passe ssh. No RHEL e nas suas recompilações vem do EPEL, que o instalador tenta ativar com `epel-release`; quando não pode ser instalado, a instalação continua e avisa |
| O servidor MariaDB | Apenas num controlador: a sua base de dados |

Depois, para a pasta de instalação, com cada transferência verificada contra o seu checksum publicado:

* **AnsibleForms** : o pacote de versão `ansibleforms-<version>-linux-<arch>.tar.gz` da release da aplicação no GitHub, a aplicação compilada para
  Node.js. Uma versão sem pacote mostra *Instalar sem contentores requer o AnsibleForms 7.3.0 ou posterior.*
* **Node.js** : a versão mais recente da versão principal indicada pelo pacote, a partir do nodejs.org
* **Python e Ansible** : o uv, e depois com ele o Python das imagens do RTE e um ambiente virtual com o Ansible e as bibliotecas da
  imagem RTE full, e depois as suas coleções Ansible (consulte [As imagens do RTE](../rte/images.html)). Isto demora alguns minutos
* **Os ficheiros iniciais** : os formulários, playbooks e definições da pasta `data` do
  [projeto docker-compose](https://github.com/ansibleforms/docker), tal como uma nova instalação Docker Compose os recebe. Um Runner mantém apenas a sua configuração do Ansible, ssh e git

Para um controlador, cria depois o esquema `AnsibleForms` no MariaDB, e um utilizador da base de dados com o nome da instância, com todos os direitos sobre esse
esquema e nenhum noutro sítio, que inicia sessão apenas a partir deste servidor.

---

## A pasta

Tudo fica na pasta de instalação, `/opt/ansibleforms` (ou `/opt/ansibleforms-runner` num Runner) por predefinição:

| Caminho | O que contém |
|---|---|
| `releases/<version>/` | Uma versão: o pacote, a sua ligação ao Node.js, o seu ambiente virtual Python e as suas coleções |
| `current` | A ligação para a versão em execução; uma atualização move-a, e uma reversão também |
| `runtime/` | Node.js, uv e Python, partilhados pelas versões |
| `data/` | O que os contentores montam como `/app/dist/persistent`: formulários, playbooks, `config.yaml`, o config seed, certificados e registos |
| `home/` | A pasta pessoal do utilizador de sistema: `.ssh` e `.gitconfig`, ligados a `data/ssh` e `data/git` |
| `app.env`, `rte.env` | As definições e os segredos dos serviços, legíveis apenas pelo root e pelo utilizador de sistema. O do RTE não contém definições da base de dados |
| `installer-backups/` | As cópias de segurança da base de dados que o instalador faz, antes de uma atualização ou com `backup` |

As versões e os runtimes pertencem ao root, para que os serviços não possam alterar o seu próprio código; `data/` e `home/` pertencem ao utilizador de sistema.
Os ficheiros da base de dados propriamente ditos são guardados pelo MariaDB, fora da pasta.

---

## Os serviços

Um controlador executa dois serviços systemd, um Runner executa um. Cada um corre como um utilizador de sistema com o nome da instância (`ansibleforms` por predefinição),
a partir de `current/server`, com o seu ficheiro de definições:

| Serviço | O que executa | Definições |
|---|---|---|
| `<name>` | A aplicação: a interface web, a API e o worker. Apenas num controlador | `app.env` |
| `<name>-rte` | O RTE que executa os playbooks | `rte.env` |

O RTE de um controlador é `inbound` numa porta própria em `127.0.0.1` (`8001`, ou a livre seguinte, com
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), executa os playbooks a partir das pastas da aplicação (`RTE_FILES=local`),
e é declarado pelo config seed `data/seed.yaml` como o runner predefinido.

O RTE de um Runner recebe o modo, `APP_URL`, `RTE_NAME` e, com `--join`, o token de adesão, e recebe os playbooks com cada tarefa (consulte
[Modos](../rte/modes.html)). Um de saída não recebe chamadas da aplicação, por isso escuta apenas em `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Um de entrada serve HTTPS com um certificado autoassinado do seu próprio endereço em `data/certificates`, que o AnsibleForms fixa.
Sem um token de adesão, pede para aderir, e um administrador aprova-o em **Ligações > Runners**.

Iniciam no arranque e reiniciam após uma falha. Faça a sua gestão e leia os seus registos com as próprias ferramentas do systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

A aplicação pode escutar numa porta abaixo de 1024, como a `443`, sem root. O RTE mantém o direito de usar `sudo`, de que os playbooks com
`become` precisam neste servidor, para que um playbook possa gerir o servidor onde o RTE corre.

---

## Atualizar e reverter

`sudo /usr/local/bin/ansibleforms-installer upgrade` atualiza uma instalação nativa tal como as outras (consulte [Atualizar](installer.html#upgrade)), por
esta ordem:

1. Coloca a nova versão ao lado da que está em execução: o seu pacote, Node.js, Python, Ansible e as coleções. Os serviços em execução
   ainda não são tocados
2. Adiciona os novos ficheiros iniciais que a versão traz, mantendo todos os ficheiros existentes
3. Faz uma cópia de segurança da base de dados (num controlador) para `installer-backups/`, com uma cópia de `app.env` e `rte.env`
4. Para os serviços, aponta `current` para a nova versão e volta a iniciá-los
5. Espera que a aplicação responda com a nova versão (num Runner: que o seu RTE volte a escutar)

Quando a nova versão não responde, o instalador oferece-se para reverter: `current` volta a apontar para a versão anterior, a
base de dados é restaurada a partir da cópia de segurança, e os serviços iniciam. Só se mantêm a versão em execução e a anterior.

Serviços nativos com a estrutura do instalador sem nenhum `installer.json` ao lado, por exemplo depois de ter sido eliminado, são encontrados por `install`
e `upgrade`, que se oferecem para os assumir (consulte [Uma instalação existente](installer.html#an-existing-installation)).

---

## Desinstalar

`sudo /usr/local/bin/ansibleforms-installer uninstall` para e remove os serviços. Mantém a pasta e a base de dados, a menos que opte por eliminar
os dados (ou passe `--purge`) e escreva o nome da instância para confirmar. Nesse caso também elimina a base de dados e o seu utilizador (num controlador),
apaga a pasta e remove o utilizador de sistema.

Os pacotes continuam instalados, incluindo o MariaDB: outro software pode usá-los.

---

## Air-gapped

`--bundle` instala a partir de um pacote de versão que copiou para o servidor, em vez de o descarregar do GitHub. Use o ficheiro da sua
arquitetura, `ansibleforms-<version>-linux-amd64.tar.gz` ou `-arm64`, das [Releases](https://github.com/ansibleforms/ansibleforms/releases) da aplicação:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` faz o mesmo para os ficheiros iniciais, a partir de uma cópia local do repositório [ansibleforms/docker](https://github.com/ansibleforms/docker).
O Node.js, o Python com os seus pacotes e as coleções Ansible continuam a ser descarregados durante a instalação.
