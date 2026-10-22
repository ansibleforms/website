---
layout: default
title: Medidas de segurança
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Medidas de segurança
{: .no_toc }

Como são protegidos o início de sessão, as permissões, os segredos e as ligações
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Onde corre

O AnsibleForms é auto-alojado, na sua infraestrutura, com os seus dados numa base de dados que gere.

* Não há nenhum serviço na nuvem nem servidor de licenças do AnsibleForms, nem telemetria ou verificação de atualizações.
* A interface é servida pela própria aplicação e não carrega nada de outro site.
* A aplicação só se liga aos sistemas que um administrador configura, enumerados em [Ligações de saída](#outbound-connections).

As partes e o que cada uma contém:

| Parte | O que faz | O que contém |
|---|---|---|
| Aplicação | A interface web, a API REST, o agendador | Nenhum dado próprio: está tudo na base de dados |
| MySQL ou MariaDB | A base de dados da aplicação | Utilizadores, grupos, credenciais (cifradas), tarefas com as suas extravars e resultado, o registo de auditoria |
| Ambiente de execução (RTE) | Executa os playbooks, no seu próprio contentor | Os ficheiros das tarefas que executa, e os segredos de uma tarefa só enquanto essa tarefa corre |
| Pasta persistente | A configuração, os formulários, os playbooks e os ficheiros carregados | Os ficheiros que os formulários e os playbooks usam |

Consulte [Como funciona](../how-it-works.html) para ter a visão completa, e [RTE](../rte/) para o ambiente de execução.

---

## Início de sessão

Todas as páginas e chamadas à API que leem ou alteram dados precisam de um utilizador com sessão iniciada. Os poucos endpoints abertos sem sessão servem o
próprio início de sessão, a versão, o nome e o logótipo da instância, a documentação da API e a configuração da base de dados de um primeiro arranque,
que [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` fecha:

| Método | Como funciona |
|---|---|
| Contas locais | Palavras-passe com hash bcrypt, um [comprimento mínimo](../security/hardening.html#sign-in-limits-and-passwords), e a palavra-passe predefinida pública do administrador tem de ser alterada no primeiro início de sessão |
| LDAP / Active Directory | O diretório verifica a palavra-passe, e os seus grupos correspondem a funções. Ver [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Início de sessão único através do seu fornecedor de identidade, que traz também a sua própria autenticação multifator. Ver [Autenticação](../authentication/) |

* Os inícios de sessão falhados [bloqueiam a conta](../security/hardening.html#sign-in-limits-and-passwords), e o início de sessão tem limite de pedidos.
* Um início de sessão devolve um token de acesso assinado válido 30 minutos e um token de atualização válido 24 horas.
* Os tokens podem ser terminados antes de expirarem: terminar sessão, uma alteração de palavra-passe, um utilizador bloqueado e um token de API revogado terminam-nos
  em todos os nós ao mesmo tempo, ver [Tokens](../security/secrets.html#tokens).
* O AnsibleForms não tem autenticação multifator própria: use o início de sessão único quando for exigida.

---

## Permissões

O que um utilizador pode fazer vem das funções dos seus grupos, verificadas pelo servidor em cada pedido:

* As funções são definidas no [config.yaml](../config/roles.html): que formulários um utilizador vê e que opções tem,
  como o designer, as páginas de definições ou as tarefas de outros utilizadores.
* O servidor verifica cada lançamento com as regras do formulário (os seus campos, os seus valores e o acesso do utilizador), incluindo
  os lançamentos através da API REST, ver [Validação no lançamento](../launch-validation/).
* A função de administrador executa qualquer playbook por definição. As outras funções só recebem o que lhes é concedido: um utilizador com várias funções só recebe uma
  opção quando nenhuma dessas funções a recusa, pelo que basta uma função restritiva para a negar.

---

## Segredos guardados

As palavras-passe, os tokens e as chaves são cifrados antes de serem escritos na base de dados:

* Todos os segredos guardados, as credenciais, a palavra-passe de bind do LDAP, os tokens dos runners, os segredos de cliente do início de sessão único, os endereços de webhook
  e as chaves de API, são cifrados com AES-256 e um vetor de inicialização aleatório por valor, sob o
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) que definir.
* Nenhuma chamada à API nem página de definições mostra um segredo guardado, e as cópias de segurança omitem os segredos mestres.
* Os segredos podem ficar no seu cofre: o [HashiCorp Vault e o CyberArk](../secret-stores/) são lidos quando uma tarefa precisa deles.
* Os segredos de uma tarefa chegam ao ambiente de execução selados com AES-256-GCM, sob uma chave derivada do seu token.
* As extravars cujo nome se parece com um segredo são ocultadas na vista da tarefa, e os campos de palavra-passe são-no sempre, ver [Dados das tarefas](../security/hardening.html#job-data).

O resto da base de dados, as tarefas, as suas extravars e o seu resultado, é guardado tal como é: proteja-o com a cifragem em repouso e o controlo de acesso
da própria base de dados, ver [A base de dados](../security/hardening.html#the-database).

---

## Registo de auditoria

Todas as alterações, e todas as tentativas recusadas, ficam registadas:

* Cada criação, alteração e eliminação, através da interface ou da API, é escrita no registo de auditoria com o utilizador, o seu
  endereço, a ação, o objeto e o resultado. As recusas e os inícios de sessão também ficam registados, incluindo os falhados.
* Os valores que se parecem com segredos são ocultados antes de serem escritos.
* O registo é guardado 365 dias por predefinição, e pode ser copiado para syslog por UDP, TCP ou TLS.

---

## No navegador

A interface está protegida contra código injetado numa página:

* Uma [Content-Security-Policy](../security/hardening.html#the-content-security-policy) só permite os scripts e frames da própria aplicação.
* Todas as respostas levam cabeçalhos de proteção: nosniff, proteção contra frames e HSTS sobre HTTPS.
* O HTML dos formulários, dos textos de ajuda e das respostas do chat é sanitizado, e o resultado das tarefas é escapado.

---

## No servidor

O código que trata os dados introduzidos pelo utilizador evita as injeções clássicas:

* As consultas à base de dados passam os seus valores como parâmetros, nunca como texto colado na consulta.
* Os comandos, incluindo o git, correm a partir de uma lista de argumentos, nunca de uma shell, pelo que os caracteres de shell não fazem nada.
* As expressões do servidor passam por um [sanitizador de expressões](../security/hardening.html#expressions-and-outbound-calls), e as suas chamadas REST por um filtro de hosts.
* O [servidor MCP](../mcp/), o [assistente de chat](../chat/) e o endpoint de métricas estão desligados até os ligar.

---

## Ligações

O tráfego de e para o AnsibleForms pode ser cifrado de ponta a ponta:

* A aplicação serve ela própria [HTTPS](../security/https.html), ou fica por trás do seu proxy inverso.
* Um ambiente de execução fala com a aplicação através de um WebSocket, `wss://` com um endereço HTTPS, e a aplicação
  fixa o certificado de um que chegue de fora, ver [Modos do RTE](../rte/modes.html).
* O LDAP, o início de sessão único, os runners, o git, os cofres de segredos e as chamadas REST das expressões verificam o certificado do
  servidor a que se ligam, a menos que um administrador desligue a verificação para um servidor com um certificado autoassinado.

### Ligações de saída

O AnsibleForms só se liga ao que um administrador configura:

| Ligação | Quando |
|---|---|
| LDAP, OpenID Connect, Entra ID (início de sessão Microsoft e Graph) | Quando esse método de início de sessão está configurado |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Quando um formulário corre nesse runner |
| Servidores git | Quando um repositório está configurado |
| Servidor de correio, Slack, Teams, Telegram, webhooks | Quando um canal de notificação está configurado |
| HashiCorp Vault, CyberArk | Quando um cofre de segredos está configurado |
| Um fornecedor de modelos (Anthropic, OpenAI e outros) | Só com o [assistente de chat](../chat/) ligado, que está desligado por predefinição |
| Hosts e APIs indicados nos formulários | Quando as expressões de um formulário ou um playbook os chamam |
| Servidores syslog | Quando o reencaminhamento de auditoria ou de registos está configurado |

---

## Os contentores

As imagens são construídas para correr com o mínimo de privilégios possível:

* A aplicação e o ambiente de execução correm como o utilizador sem privilégios `node`, não como root.
* São construídas sobre imagens Debian slim fixadas por digest, ver [Desenvolvimento seguro](development.html#code-analysis-and-dependencies).
* A aplicação escuta numa única porta, a 8000.

Para os passos que protegem uma instância nova, siga [Reforço da segurança](../security/hardening.html).
