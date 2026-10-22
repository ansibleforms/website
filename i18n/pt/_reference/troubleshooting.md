---
layout: default
title: Resolução de problemas
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Resolução de problemas
{: .no_toc }

Mensagens de erro e sintomas, porque acontecem e como os corrigir
{: .fs-6 .fw-300 }

---

Cada problema abaixo tem como título a mensagem ou o sintoma que vê, seguido da causa e da correção. As mensagens são citadas
exatamente como o AnsibleForms as escreve; `<name>` representa um valor que muda de caso para caso. A maior parte delas aparece no registo
do servidor, que pode ler em [Registo do servidor](gui/administration.html#server-log) ou com `docker logs`.

**Base de dados e arranque**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Configuração e formulários**

* [Could not load the forms](#could-not-load-the-forms)
* [A configuração base tem uma secção forms](#the-base-config-has-a-forms-section)
* [Falta um formulário no painel](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Início de sessão**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Falha na autenticação Azure AD ou OIDC](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Sessão terminada depois de um reinício ou ao fim de um dia](#logged-out-after-a-restart-or-after-a-day)
* [Formulários e tarefas vazios depois de um início de sessão único (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Tarefas**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Uma tarefa mostra o estado abandoned](#a-job-shows-the-status-abandoned)
* [Um RTE não se liga](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Repositórios git e cópias de segurança**

* [Falha ao clonar ou fazer pull de um repositório](#a-repository-clone-or-pull-failed)
* [O repositório de formulários ainda não foi clonado](#the-forms-repository-is-not-cloned-yet)
* [Falha numa cópia de segurança](#a-backup-failed)

As [FAQ](faq.html) tratam em detalhe de dois problemas relacionados: uma
[palavra-passe de administrador perdida](faq.html#recovering-a-lost-admin-password) e
[restringir os destinos dos auxiliares REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

O AnsibleForms não arranca, e o registo repete estas linhas a cada 5 segundos:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Porque acontece**

No arranque, o AnsibleForms espera até que a base de dados responda a uma consulta, e continua à espera enquanto isso não acontecer.
O `<reason>` é a própria mensagem do driver da base de dados: uma ligação recusada ou que expirou aponta para o host ou a porta,
uma mensagem de acesso negado para o nome de utilizador ou a palavra-passe.

**Como corrigir**

Verifique [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) e [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
De dentro de um contentor, `localhost` é o próprio contentor, e não o host que executa o MySQL. Certifique-se de que o MySQL escuta
num endereço de rede e de que o utilizador se pode ligar a partir do host do AnsibleForms. O AnsibleForms continua sozinho assim
que a base de dados responder; não é necessário reiniciar.

---

## Schema is not ready, skipping group and user initialization

O navegador abre uma página da base de dados em vez da página de início de sessão, e o registo mostra:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Porque acontece**

O esquema `AnsibleForms` falta ou está incompleto. Uma base de dados *vazia* é aprovisionada automaticamente no arranque, a menos que
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) seja `0`. Se isso falhar, por exemplo porque
o utilizador da base de dados não pode criar um esquema, o registo diz `Failed to create the schema automatically : <reason>`. Um esquema
que existe mas a que faltam tabelas (`Table '<name>' is not present`) nunca é recriado automaticamente, porque criar o
esquema elimina primeiro todas as tabelas. A página da base de dados diz então *It appears that you have an unuseable schema*.

**Como corrigir**

Numa instalação nova, dê ao utilizador da base de dados o direito de criar o esquema `AnsibleForms` e reinicie, ou carregue em
**Criar** na página da base de dados. Num esquema parcialmente presente, restaure uma cópia de segurança ou remova o esquema `AnsibleForms`
incompleto para que o AnsibleForms o possa criar de novo. O registo lista as tabelas e os patches que falharam.

---

## Schema creation is disabled

Criar o esquema, a partir da página da base de dados ou com `POST /api/v2/schema`, falha com:

```
Schema creation is disabled
```

**Porque acontece**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) é `0`, o que desativa tanto a criação
automática no arranque como o endpoint. Numa base de dados que já tem utilizadores, o endpoint também recusa quem não tenha
sessão iniciada como administrador, com `Schema creation requires an authenticated administrator`.

**Como corrigir**

Crie o esquema uma vez com `ALLOW_SCHEMA_CREATION=1` (é a predefinição), ou restaure-o a partir de uma cópia de segurança, e depois volte a colocar a
variável em `0`. Numa base de dados aprovisionada, inicie sessão como administrador antes de recriar o esquema, e lembre-se
de que isso elimina e recria todas as tabelas.

---

## Config seed failed, refusing to start

O contentor termina logo depois do arranque, e a sua saída acaba com:

```
Config seed failed, refusing to start : <reason>
```

**Porque acontece**

O ficheiro em [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) não pôde ser aplicado: não é YAML
válido ou viola o esquema do seed, por exemplo; `<reason>` diz o que correu mal. O AnsibleForms recusa-se a arrancar em vez de
funcionar com metade dos seus objetos declarados. O motivo também é escrito na saída de erro padrão, por isso `docker logs` e `kubectl logs` mostram-no.

**Como corrigir**

Corrija o que `<reason>` indica e inicie novamente. Consulte [Recarregamento e arranque](seed/reloading.html) para saber como o seed é
aplicado, e [Exemplo](seed/example.html) para um ficheiro válido.

---

## ENCRYPTION_SECRET is not set

Cada arranque regista este aviso:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

Ou o worker recusa-se a arrancar com:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Porque acontece**

Os segredos guardados são cifrados com [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET): desde a 7.3.0 vivem em
credenciais (as palavras-passe e os tokens dos diretórios LDAP, dos fornecedores de SSO, dos runners e dos cofres de segredos, entre outros), ao lado dos endereços de webhook do Slack
e do Teams. Sem ela, é usada uma chave que é pública no código-fonte. Desde a 7.3.0, um arranque com um novo
`ENCRYPTION_SECRET` volta a cifrar todos os segredos guardados com ele, numa única transação: a partir da chave predefinida quando é definido pela primeira
vez, ou a partir de [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) quando muda. Quando os
segredos guardados não foram cifrados com nenhuma das duas, nada é alterado e o AnsibleForms não arranca.

**Como corrigir**

Defina `ENCRYPTION_SECRET`, e guarde-o com os seus outros segredos: as cópias de segurança nunca o contêm. O arranque seguinte regista
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Para o alterar mais tarde, defina o novo valor em
`ENCRYPTION_SECRET` e o antigo em `ENCRYPTION_SECRET_PREVIOUS` durante um arranque, e depois remova `ENCRYPTION_SECRET_PREVIOUS`. Quando o
worker se recusa a arrancar, defina `ENCRYPTION_SECRET_PREVIOUS` com a chave com que os segredos foram cifrados, ou volte a colocar o valor antigo.

---

## Could not load the forms

O painel não mostra formulários e indica:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Porque acontece**

A configuração base (`config.yaml`) não pôde ser lida ou não é válida. O `<reason>` diz qual o caso:

| Motivo | Causa |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Um erro de sintaxe YAML |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Um ficheiro vazio, ou só com comentários |
| `Duplicate role name(s) : <names>. Each role must appear once.` | A mesma função está definida duas vezes |
| `There is no config.yaml nor could one be created from template.` | Falta o `config.yaml` e a sua pasta não permite escrita |
| `There is no forms directory nor could there be one created from template.` | Falta a pasta de formulários e não pode ser criada |
| Qualquer outra linha | A configuração viola o esquema, por exemplo uma função sem `groups` |

**Como corrigir**

Corrija o ficheiro indicado por [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH), ou o `config.yaml` no
repositório usado para a configuração. Quando faltam ficheiros, faça com que [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) e
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) apontem para um local persistente com permissão de escrita. Consulte
[config.yaml](config/) para a estrutura.

---

## A configuração base tem uma secção forms

Depois de uma atualização a partir da 6.x o painel fica vazio, e o painel de avisos mostra:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Porque acontece**

Desde a 7.0.0, cada formulário vive no seu próprio ficheiro na pasta de formulários. Os formulários que ainda estão listados em `config.yaml` são
ignorados.

**Como corrigir**

Mova cada formulário para o seu próprio ficheiro em [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Consulte
[Atualizar para a 7.x](upgrade-7.html).

---

## Falta um formulário no painel

Existe um ficheiro de formulário, mas um utilizador não vê o formulário no painel.

**Porque acontece**

Um utilizador só vê um formulário quando uma das `roles` do formulário é uma das funções do utilizador; os administradores veem todos os formulários. Todos os utilizadores têm
a função `default`, por isso um formulário com `roles: [default]` é visível para todos. As funções de um utilizador vêm dos grupos e dos utilizadores
listados em `roles` no `config.yaml`. Um formulário sem `categories` aparece em **Default**, por isso falta nas
outras categorias, embora continue listado em **Todos os formulários**. Por fim, um formulário que falha a validação é ignorado. O
painel mostra então um botão **This config has Warnings or Errors**, que abre mensagens como:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Como corrigir**

Abra o painel de avisos e corrija o que lá está listado. Verifique as funções do utilizador em
[Permissões](profile/permissions.html) no perfil, e as `roles` e `categories` do formulário. Consulte
[Funções](config/roles.html) e [Categorias](config/categories.html). Quando dois ficheiros definem o mesmo nome de formulário,
ganha o primeiro que for carregado.

---

## Could not save the forms

Guardar no designer falha com:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Porque acontece**

O designer valida todos os formulários contra o esquema antes de escrever o que quer que seja. Cada linha de `<messages>` indica o
formulário e o campo que violam uma regra. As opções removidas na 7.0.0 têm uma mensagem própria, por exemplo
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Como corrigir**

Corrija os campos que as mensagens indicam. Para as opções que a 7.0.0 removeu, siga [Atualizar para a 7.x](upgrade-7.html).
Para validar os ficheiros de formulários antes de chegarem ao AnsibleForms, consulte
[Validação no VS Code para ficheiros de formulários](faq.html#vs-code-validation-for-form-files) nas FAQ.

---

## The editor is read-only

O designer mostra **Bloqueado** com o nome de outro utilizador, e guardar falha com:

```
The editor is read-only
```

**Porque acontece**

Só uma pessoa de cada vez pode editar os formulários. O bloqueio é obtido quando alguém inicia o designer, e mantém-se até que
o pare, mesmo que tenha fechado o navegador sem o parar. A API recusa uma gravação de qualquer outra pessoa com
`Designer is locked by <username>`.

**Como corrigir**

Peça a `<username>` que pare o designer. Se isso não for possível, use **Force Unlock** no designer. Quem detém o
bloqueio perde as alterações que ainda não guardou.

---

## Abuse attempt of eval function

Um campo de expressão mostra um erro, e o registo tem uma linha como:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Porque acontece**

As expressões do lado do servidor são verificadas antes de serem executadas. Só podem chamar funções `fn.` e `fnc.`; várias instruções,
várias linhas, template literals, `process.env` e palavras como `require` ou `constructor` são recusadas. A mensagem
diz que regra foi violada. Com [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) definido como
`off`, todas as expressões do servidor falham com
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Como corrigir**

Reescreva a expressão como uma única chamada `fn.` ou uma operação simples, ou execute-a no navegador com `runLocal: true`. Consulte
[Expressões](expressions/) e [Expressões locais](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Um campo que chama uma API REST fica vazio, e o registo mostra:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Porque acontece**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) está definido, e o host do URL não consta dele.
Um host que corresponda a [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) é recusado com
`blocked by REST_DENIED_HOSTS entry "<entry>"`, e um host que não resolve com `cannot resolve <host>`.

**Como corrigir**

Adicione o nome do host, ou um CIDR que abranja os seus endereços, a `REST_ALLOWED_HOSTS`, ou remova de
`REST_DENIED_HOSTS` a entrada que o bloqueia. Consulte [Restringir os destinos dos auxiliares REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

A página de início de sessão recusa um nome de utilizador e uma palavra-passe com:

```
Authentication failed: Invalid credentials
```

**Porque acontece**

A página de início de sessão dá a mesma resposta para todas as falhas, para não revelar se um utilizador existe. O AnsibleForms
tenta primeiro os utilizadores locais e depois o LDAP: com vários diretórios, um nome de utilizador é procurado pela sua ordem em **Acesso > LDAP**,
a menos que indique um diretório (`corp\jane`) ou um dos seus domínios de início de sessão (`jane@corp.example`). O motivo real vai para o registo. As falhas
de LDAP são registadas como `Error connecting to ldap: <reason>`, com motivos como `Wrong binding credentials` ou
`Unable to verify the certificate`; os códigos do Active Directory são traduzidos para `Wrong password`, `User not found`,
`Account disabled`, `Account locked` ou `Password expired`.

**Como corrigir**

Leia o motivo no registo. Para o motivo completo de cada início de sessão falhado, defina
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) como `debug`, que regista `Ldap authentication failed: <reason>`.
Se a palavra-passe do administrador local se perdeu, consulte [Recuperar uma palavra-passe de administrador perdida](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Testar um diretório LDAP em **Acesso > LDAP** falha com uma destas mensagens:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Porque acontece**

O utilizador de bind ou a sua palavra-passe estão errados, o servidor ou a porta não estão acessíveis, ou, com TLS, o certificado do servidor não pode ser
verificado contra o CA bundle. Desde a 7.3.0 estes dados estão na credencial ldap do diretório, em **Ligações > Credenciais**. Um utilizador de teste que não existe
continua a contar como um teste bem-sucedido, porque a ligação e o bind funcionaram.

**Como corrigir**

Abra a credencial que o diretório indica (o diretório predefinido é `main`) em **Ligações > Credenciais**, e corrija o DN de bind
e a sua palavra-passe, os servidores e a porta (normalmente 389, ou 636 para LDAPS). Para problemas de TLS, cole o CA bundle que assinou o
certificado do servidor LDAP; ignorar a verificação do certificado não é para produção. Consulte [LDAP](authentication/ldap.html).

---

## Falha na autenticação Azure AD ou OIDC

Um início de sessão único volta à página de início de sessão com:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Porque acontece**

O fornecedor de identidade devolveu o utilizador, mas o AnsibleForms não conseguiu concluir o início de sessão. Os motivos comuns são
`azuread login is not enabled` ou `oidc login is not enabled` (o fornecedor está desativado), e `jwt expired`, porque
a passagem a partir do fornecedor só é válida durante 5 minutos. Um erro durante a callback do fornecedor também é mostrado
na página de início de sessão, e registado.

**Como corrigir**

Ative o fornecedor em **Acesso > SSO**, e registe o URL de callback no fornecedor de identidade exatamente como
o AnsibleForms o usa: `https://<your host>/api/v2/auth/entraid/callback` para o Entra ID (a partir da 7.3.0; `azureadoauth2` continua a funcionar), ou
`https://<your host>/api/v2/auth/oidc/callback` para OIDC. Um URL de callback com `/api/v1/`, de antes da 7 ou de antes da
6.1.5, tem de ser atualizado: a página de início de sessão volta então a carregar sem iniciar sessão e sem erro. Tente novamente o início de sessão depois de
uma passagem expirada.

---

## Not authenticated, login is not enabled for this user

Um utilizador com uma palavra-passe válida não consegue iniciar sessão, e recebe:

```
Not authenticated, login is not enabled for this user.
```

**Porque acontece**

Uma das funções do utilizador define a opção de função `allowLogin` como `false`. O registo diz
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Como corrigir**

Remova `allowLogin: false` da função, ou retire o utilizador dessa função. Consulte [Funções](config/roles.html).

---

## Sessão terminada depois de um reinício ou ao fim de um dia

Todos os utilizadores são enviados de volta para a página de início de sessão depois de o AnsibleForms reiniciar, ou ao fim de um dia de utilização.

**Porque acontece**

Quando [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) não está definido, cada arranque gera uma
nova chave de assinatura, e regista
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Os tokens de antes do
reinício deixam então de ser aceites. Independentemente disso, uma sessão termina quando o seu refresh token expira
(`Refresh token is expired`), ao fim de
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), 24 horas por predefinição.

**Como corrigir**

Defina `ACCESS_TOKEN_SECRET` com um valor fixo e secreto. Aumente `ACCESS_TOKEN_REFRESH_EXPIRATION` se um dia for pouco. Para
acesso à API de longa duração, use um [token de API](profile/api-token.html).

---

## Formulários e tarefas vazios depois de um início de sessão único (HTTP 431)

Um utilizador inicia sessão com Entra ID ou OIDC sem erro, mas as páginas de formulários e de tarefas ficam vazias. O separador de rede
do navegador mostra as chamadas à API respondidas com:

```
431 Request Header Fields Too Large
```

O registo do servidor não mostra nada para estas chamadas, e o mesmo utilizador pode funcionar bem com uma conta LDAP ou local.

**Porque acontece**

Antes da 7.1.0, o token de início de sessão transportava todos os grupos do utilizador, e os grupos do Entra ID apareciam nele duas vezes, pelo ID do objeto
e pelo nome. O navegador envia esse token no cabeçalho `Authorization` de cada pedido, por isso um utilizador em cerca de cem
grupos ou mais acaba com um cabeçalho bem acima dos 16 KB. O Node.js recusa cabeçalhos de pedido maiores do que 16 KB com um 431,
antes de o pedido chegar ao AnsibleForms, e é por isso que nada é registado. Um reverse proxy à frente pode recusar o
pedido ainda antes: o Nginx permite 8 KB por campo de cabeçalho por predefinição
(`large_client_header_buffers 4 8k`), e responde 400 em vez disso.

**Como corrigir**

Atualize para a 7.1.0 ou posterior: o token de início de sessão deixa de transportar os grupos, por isso o seu tamanho deixa de depender de quantos
grupos um utilizador tem, e a interface indica-o quando um pedido é recusado com 431 em vez de mostrar páginas vazias.
Até poder atualizar, faça uma destas coisas:

* defina um **Filtro de grupos** no fornecedor em **Acesso > SSO**, uma expressão regular que mantenha apenas os grupos que as suas
  funções usam, consulte [Entra ID](authentication/entra-id.html) ou [OIDC](authentication/oidc.html); o utilizador inicia sessão novamente
  para obter um token mais pequeno
* ou aumente o limite do Node.js com a variável de ambiente `NODE_OPTIONS=--max-http-header-size=65536`, e
  reinicie o AnsibleForms

A partir da 7.1.0, [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) define o mesmo limite, 16384
bytes por predefinição e lido no arranque, para outros cabeçalhos grandes, como cookies grandes definidos por um gateway de início de sessão único à
frente. Aumente também os limites de cabeçalhos do proxy, consulte [Tamanho dos cabeçalhos do pedido](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Uma tarefa Ansible termina como falhada, e a última linha da sua saída é:

```
[ERROR]: Playbook failed with status (<code>)
```

**Porque acontece**

O `ansible-playbook` terminou com um código diferente de zero. As linhas acima contêm o próprio erro do Ansible: o playbook não foi
encontrado, um host estava inacessível, uma tarefa falhou, ou o inventário está errado. O playbook é procurado no repositório
com **Usar para playbooks ?** ativado, ou em [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); a linha do registo
`Running from directory : <path>` mostra a pasta que foi usada.

**Como corrigir**

Leia a saída da tarefa acima da última linha. Quando o playbook não é encontrado, compare o `playbook` do formulário com a
pasta em `Running from directory`. Consulte [Formulários Ansible](forms/ansible.html).

---

## Playbook was aborted by the main process

Uma tarefa Ansible termina como falhada com:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Porque acontece**

O processo `ansible-playbook` no RTE foi terminado por um sinal, e ninguém abortou a tarefa. Desde a 7.0.0 o tamanho da
saída já não provoca isto: acima de [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (50 MB por stream
por predefinição) o resto da saída não é guardado, a tarefa mostra
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
e o playbook corre até ao fim. A causa habitual agora é a memória: o contentor do RTE atingiu o seu limite de memória e o
kernel matou o playbook, por exemplo com muitos forks ou facts grandes.

**Como corrigir**

Verifique a memória do contentor do RTE enquanto o playbook corre (`docker stats`, `kubectl top pod`) e aumente o seu limite, ou reduza
o uso de memória do playbook (menos `forks`, sem recolha de facts desnecessária). Quando só vê o aviso de `PROCESS_MAX_BUFFER` e
precisa da saída completa, aumente `PROCESS_MAX_BUFFER` no ambiente do contentor do RTE; é lido pelo RTE, e não pela aplicação.
---

## Failed to launch awx template

Uma tarefa AWX termina como falhada, com uma saída que começa por:

```
failed to launch awx template <name>
```

**Porque acontece**

A linha seguinte dá o motivo. `Request failed with status code 401` significa que o token ou o nome de utilizador e a palavra-passe na
credencial do runner AWX são recusados. `could not find job template <name>` significa que nem um job template nem um workflow job template
têm exatamente esse nome, ou que o utilizador da ligação não o consegue ver. Um erro de certificado, como
`unable to verify the first certificate`, significa que o certificado do AWX não é fidedigno.

**Como corrigir**

Use **Testar ligação** no runner (**Ligações > Runners**), que responde `Runner connection is OK` quando funciona. Desde a
7.3.0 o token ou o utilizador e a palavra-passe, o endereço e o **CA bundle** estão na credencial do runner, em
**Ligações > Credenciais**: renove aí o token ou a palavra-passe, e para erros de certificado cole a CA no seu **CA bundle**.
Verifique o nome e as permissões do template. Introduza o endereço sem `/api/v2`: o AnsibleForms acrescenta ele próprio
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX).
Consulte [Formulários AWX](forms/awx.html).

---

## Uma tarefa mostra o estado abandoned

Uma tarefa que estava em execução está agora marcada como `abandoned`, e o registo de um nó ou de um RTE mostra uma destas linhas:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Um RTE em modo base de dados, obsoleto, regista as suas próprias:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Porque acontece**

Uma tarefa pertence ao contentor que a executa ou acompanha: um playbook ao seu RTE, qualquer outra tarefa (uma tarefa AWX, os passos de um formulário
multistep) ao nó da aplicação que a iniciou. Quando esse contentor reinicia, termina as suas próprias tarefas por concluir. Quando desaparece, um pod
substituído por exemplo, o worker termina as suas tarefas assim que deixa de responder durante dois minutos. Um RTE num modo socket que volta sem
uma tarefa que estava a executar, um contentor novo sem o seu spool por exemplo, faz com que essa tarefa termine como abandonada. Um RTE que está a parar espera
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) pelos seus playbooks primeiro. A cada hora, as tarefas que estão em execução há mais
de um dia também são marcadas como abandonadas.

Desde a 7.3.0 uma tarefa no AWX, AAP ou Ascender continua no seu runner: logo depois de um reinício a abandonar, um nó volta a acompanhá-la,
se tiver começado nas últimas 24 horas, e termina com o que realmente aconteceu lá. O registo diz então `Following <n> abandoned job(s) again on their runner`.

**Como corrigir**

Relance uma tarefa de playbook. Reinicie ou atualize os RTEs e os nós da aplicação quando não houver nenhuma tarefa em execução, e dê a um RTE que está a parar tempo suficiente
(consulte [Escalar](rte/run.html)). Verifique se o playbook terminou realmente nos hosts geridos antes de
relançar, porque pode ter sido executado parcialmente.

---

## Um RTE não se liga

**Testar ligação** num runner RTE (**Ligações > Runners**) falha com:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Porque acontece**

Um RTE num modo socket comunica com a aplicação através de um WebSocket: em saída liga-se à aplicação, em entrada é a aplicação que se liga a ele (consulte
[Modos](rte/modes.html)). Os registos da aplicação e do RTE dizem porque é que o socket não está aberto:

| Mensagem | Onde | O que significa |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | O RTE (entrada) | O token da credencial de RTE do runner não é o `RTE_TOKEN` do RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | A aplicação (entrada) | O mesmo, visto a partir da aplicação |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | A aplicação, e o RTE que é recusado (`401`) | O RTE inicia sessão com um token diferente do que a aplicação guarda para o seu runner |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | O RTE (saída) | Pediu para aderir e aguarda uma aprovação |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | O RTE (entrada, com `APP_URL`) | O mesmo, para um RTE de entrada |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | A aplicação, e o RTE que é recusado (`409`) | O config seed declara o runner sem `rte_mode`, portanto em modo base de dados, e é o seed que decide o seu modo. Um RTE de entrada recebe `rte_mode: inbound` e `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | O RTE | Um RTE de entrada que se regista a si próprio precisa do endereço em que a aplicação se liga a ele |
| `Runner '<name>': dialing <address>: <reason>` | A aplicação, no nível `debug` | A aplicação não consegue abrir o socket, por exemplo porque o certificado do RTE não é o fixado para o seu runner |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | O RTE | Corre em modo base de dados, e não abre nenhum socket |

**Como corrigir**

* **Um token recusado** : dê ao RTE o token da credencial de RTE do seu runner (**Ligações > Credenciais**), ou o contrário
* **À espera de aprovação** : aprove-o em **Ligações > Runners**, depois de verificar que a impressão digital mostrada aí é a que está no seu
  registo (consulte [Aprovar um RTE](runners/registration.html#approving-an-rte))
* **Gerido pelo config seed em modo base de dados** : defina `rte_mode` no runner no seed, com uma credencial de RTE (para entrada, o seu
  endereço), e depois reinicie o RTE
* **Entrada sem `RTE_URL`** : defina `RTE_URL` com o endereço em que a aplicação chega ao RTE, ou omita `APP_URL` e declare o
  runner no seed ou em **Ligações > Runners**
* **Um certificado que não é o fixado** : um RTE de entrada por HTTPS envia o seu certificado quando se regista, e a aplicação só se liga
  a ele com esse. Depois de um certificado novo, o RTE volta a enviá-lo quando se regista; quando o CA bundle da credencial foi definido
  à mão, a aplicação mantém-no e regista
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **O aviso [DEPRECATED]** : defina `RTE_MODE` no RTE, remova `DB_*` do seu ambiente, e defina o seu runner com esse modo (consulte
  [Modos](rte/modes.html))

---

## The form data is not valid

Com a validação do lançamento em `enforce`, um lançamento é recusado com `422` e:

```
The form data is not valid
```

**Porque acontece**

O servidor verificou os valores dos campos contra as regras do formulário e encontrou campos em falta ou inválidos; a resposta lista-os
em `details`. Um lançamento sem `rawFormData` também é recusado. Um formulário que ainda não pode ser verificado, como um wizard,
é recusado com `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Como corrigir**

Corrija os campos que os detalhes indicam, ou as regras do formulário se forem demasiado restritivas. Execute primeiro com `log`: regista
`Launch validation would refuse form '<name>' ...` sem recusar nada. Consulte
[O que faz o enforce](launch-validation/log-and-enforce.html#what-enforce-does) e
[Implementá-la](launch-validation/rolling-it-out.html).

---

## Falha ao clonar ou fazer pull de um repositório

Um repositório mostra um estado de falha, e a sua saída contém o erro do git, ou o registo mostra
`Background clone of '<name>' failed : <reason>`.

**Porque acontece**

O git não conseguiu chegar ao remoto ou autenticar-se nele. Para URLs SSH (`git@host:path`), o remoto tem de aceitar a chave
pública do AnsibleForms; para HTTPS, o nome de utilizador e o token têm de ser válidos. Um pull também é recusado quando a árvore de trabalho tem
alterações, com
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Como corrigir**

Para SSH, copie a chave pública do separador **Chave** de **Ligações > SSH** e adicione-a como deploy key, ou a um utilizador com
acesso ao repositório. O AnsibleForms adiciona o host remoto aos hosts conhecidos num clone; para outros hosts, use o
separador **Hosts conhecidos** da mesma página. Para
HTTPS, renove o token. Consulte [Repositórios Git](gui/designer-and-git.html#git-repositories) e
[Sobre os repositórios](faq.html#about-repositories).

---

## O repositório de formulários ainda não foi clonado

Guardar formulários no designer falha com:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Porque acontece**

Um repositório com **Usar para formulários ?** ativado ainda não tem árvore de trabalho, porque o clone não foi executado ou falhou.

**Como corrigir**

Clone o repositório a partir das definições de repositórios. Se o clone falhar, consulte
[Falha ao clonar ou fazer pull de um repositório](#a-repository-clone-or-pull-failed).

---

## Falha numa cópia de segurança

Uma cópia de segurança falha, e nada é adicionado à lista de cópias de segurança. O motivo é um destes:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Porque acontece**

O comando de dump, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), não está instalado, não conseguiu
ligar-se, ou produziu um ficheiro vazio. Uma base de dados grande também pode demorar mais do que
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), uma hora por predefinição.
Uma cópia de segurança falhada não deixa nenhuma pasta para trás; o registo diz `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Como corrigir**

Instale as ferramentas de cliente do MySQL ou do MariaDB, ou defina `MYSQLDUMP_COMMAND` (e `MYSQL_COMMAND` para os restauros) com um comando
que funcione neste host e contra a versão do seu servidor. Aumente `BACKUP_COMMAND_TIMEOUT_SECONDS` para uma base de dados grande.
Consulte [Cópias de segurança](gui/administration.html#backups).
