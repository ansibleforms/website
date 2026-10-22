---
layout: default
title: Cópias de segurança
parent: Em produção
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Cópias de segurança
{: .no_toc }

Cópias de segurança noturnas, o que contêm, restauros, e o que mais guardar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cópias de segurança noturnas

O AnsibleForms faz uma cópia de segurança de si próprio todas as noites à meia-noite, no fuso horário de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(UTC por predefinição). Estas definições controlam-na:

| Variável | Predefinição | Significado |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Onde são escritas as cópias de segurança, cada uma numa pasta com data e hora |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Quantas cópias de segurança noturnas se mantêm, `0` mantém-nas todas |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | O comando que faz o dump da base de dados |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | O comando que reproduz um dump no restauro |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Quanto tempo podem correr o dump e o restauro |

Os utilizadores com a opção de função `allowBackupOps` também podem fazer uma cópia de segurança a qualquer momento na página **Cópias de segurança**. Só as cópias de segurança
noturnas são removidas pela retenção, e só as cópias com um dump utilizável contam para ela, por isso uma série de noites falhadas
nunca empurra para fora a última cópia boa.

Antes de uma atualização alterar a base de dados, o worker faz primeiro uma cópia de segurança normal, uma vez por versão, chamada *Before the upgrade to
&lt;version&gt;*. Aparece na página **Cópias de segurança** e nunca é removida pela retenção noturna. Se falhar (sem ferramenta de dump,
`BACKUP_PATH` sem permissão de escrita), a atualização para e diz porquê, para que a aplicação nunca arranque sobre uma base de dados meio atualizada.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` atualiza sem cópia de segurança.

Os comandos podem ser wrappers como `docker exec <container> mysqldump`, se a sua primeira palavra existir localmente. A partir da 7.3.0 correm
sem shell: as aspas e `$NAME` do ambiente do comando funcionam, mas `;`, `|`, `&&`, `>` e `<` são recusados.

---

## Permissões na base de dados

O dump corre como [`DB_USER`](../customization/server.html#env_DB_USER), e não precisa de mais permissões do que as que a própria aplicação precisa:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

O dump é feito com `--no-tablespaces`, por isso não é necessária a permissão `PROCESS` ao nível do servidor, e salta as tabelas
que descrevem os processos em execução (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). O restauro reprodu-lo com o mesmo utilizador.
A página **Estado** mostra um aviso na sua verificação **Utilizador da base de dados** quando o utilizador tem permissões em todas as bases de dados, como tem o `root`.

---

## O que contém uma cópia de segurança

Cada cópia de segurança é uma pasta em `BACKUP_PATH`, com o nome da sua data e hora UTC (`YYYYMMDDHHmmss`), que contém:

| Ficheiro | Conteúdo |
|------|---------|
| `ansibleforms.sql` | O dump da base de dados `AnsibleForms`: utilizadores, grupos, credenciais, tarefas, definições, o registo de auditoria |
| `config.yaml` | O ficheiro em [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | A pasta em [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | O ficheiro de ambiente que as páginas de definições escrevem, sem `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` e `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | A descrição da cópia de segurança |

Uma cópia de segurança cujo dump falha é removida de novo e registada como erro. A página **Estado** avisa quando não há nenhuma cópia de segurança,
quando a mais recente tem mais de dois dias, ou quando não tem um dump utilizável, e verifica que a ferramenta de dump existe.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) mantém por sua vez os pontos de restauro do designer (60 dias por predefinição).

---

## Restaurar uma cópia de segurança

Restaure a partir da [página **Cópias de segurança**](../gui/administration.html#restore), com **Criar uma nova cópia de segurança antes de restaurar** marcado. Um restauro:

* reproduz `ansibleforms.sql`, que substitui toda a base de dados; a partir da 7.3.0, uma cópia de segurança de uma versão anterior é depois atualizada
  de novo, como no arranque de uma versão nova, e um patch que falhe é reportado
* volta a copiar o `config.yaml`, e substitui a pasta `forms/` pela da cópia de segurança: a partir da 7.3.0 os formulários que não estão na cópia são
  removidos em vez de mantidos, as ligações e o modo da pasta mantêm-se, e uma cópia falhada repõe a pasta
* **não** restaura o `managed.env`, porque descreve o host de onde veio a cópia de segurança. O botão **Restaurar ambiente**
  repõe-no a pedido, guarda o ficheiro atual como `.env.bak`, e precisa de um reinício.

Uma cópia de segurança sem um dump utilizável é recusada; depois de um restauro interrompido, corrija a causa e restaure de novo.

Num host novo, defina o mesmo `ENCRYPTION_SECRET` antes de restaurar, ou as credenciais guardadas não poderão ser decifradas.

---

## O que mais guardar

A cópia de segurança noturna cobre a base de dados, a configuração e os formulários, mas nada mais da pasta persistente:

* **`ENCRYPTION_SECRET` e `ACCESS_TOKEN_SECRET`** : nunca numa cópia de segurança, por desenho. Guarde-os no seu gestor de segredos;
  sem o segredo de cifragem, um dump da base de dados é inútil para as credenciais.
* **as próprias cópias de segurança** : ficam no mesmo volume que a instância. Copie `BACKUP_PATH` para outro host.
* **o resto da pasta persistente** : playbooks, ficheiros carregados, ficheiros de variáveis, repositórios clonados, certificados e registos.
  Com o projeto docker-compose, faça cópia de segurança de toda a pasta `data/`, que contém também a chave SSH, as funções
  personalizadas e os roles e collections do Ansible.

O conteúdo que vem do git (repositórios, formulários num repositório) pode ser clonado de novo, por isso a sua cópia de segurança importa menos.
