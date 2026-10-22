---
layout: default
title: Reverse proxy
parent: Em produção
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Reverse proxy
{: .no_toc }

Publique o AnsibleForms atrás de Nginx, Traefik ou Apache, na raiz ou num subcaminho
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quando usar um

O AnsibleForms serve a interface, a API REST e o Swagger numa só porta; um reverse proxy à frente permite-lhe:

* servi-lo na porta 443 com um certificado gerido pelas suas ferramentas existentes (ACME, uma CA empresarial)
* partilhar um nome de host com outras aplicações, publicando o AnsibleForms num subcaminho
* manter a porta da aplicação e a base de dados fora da rede pública

Um proxy é opcional: a aplicação pode servir HTTPS por si própria, consulte [HTTPS](../security/https.html).

---

## As definições que importam

Só algumas definições afetam o comportamento do AnsibleForms atrás de um proxy:

| Definição | Atrás de um proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | A porta para onde o proxy reencaminha, `8000` por predefinição. O projeto docker-compose define-a como `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` quando o proxy termina o TLS e chega à aplicação por uma rede privada, `1` para cifrar também esse troço. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | O subcaminho, por exemplo `/ansibleforms`. Deixe-o em `/` quando a aplicação tem um nome de host próprio. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Que proxies podem indicar o endereço do cliente em `X-Forwarded-For`, normalmente `1`. Consulte [Endereços dos clientes](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | O maior pedido JSON que a aplicação aceita, 50 MB por predefinição. O proxy tem de permitir pelo menos isto. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | O maior ficheiro que um campo de carregamento de um formulário aceita, 10 GB por predefinição. O proxy também tem de o permitir, ou os carregamentos falham aí. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | O maior conjunto de cabeçalhos de pedido que a aplicação aceita, 16 KB por predefinição, a partir da 7.1.0. Consulte [Tamanho dos cabeçalhos do pedido](#request-header-size). |
| **URL raiz público** | Em **Sistema > Geral**, no separador **Servidor**: o endereço a que os utilizadores chegam, subcaminho incluído. Constrói as ligações nos emails de notificação, nas mensagens dos canais e nos pedidos de aprovação. |

Para o Entra ID ou o OIDC, registe o endereço público como URI de redirecionamento, com o subcaminho de `BASE_URL` se estiver definido.

---

## Servir num subcaminho

`BASE_URL` monta toda a aplicação no subcaminho; o proxy tem de reencaminhar o caminho **sem alterações**.
Com `BASE_URL=/ansibleforms`:

* a interface, `/api/v2/...` e a interface Swagger são todas servidas em `/ansibleforms/`
* o `<base href>` da interface é reescrito no arranque, para que os recursos e as chamadas à API se resolvam no subcaminho
* um pedido para `/` ou para `/ansibleforms` (sem barra final) é redirecionado para `/ansibleforms/`

Mantenha o prefixo: nada de `StripPrefix` no Traefik, nada de URI no `proxy_pass` do Nginx, porque a aplicação conta com ele.

A página **Estado** mostra o URL base em vigor.

---

## Tempos limite, carregamentos e saída em direto

A página de tarefas e os contadores de tarefas sabem das alterações através de um único fluxo de longa duração de server-sent events,
[`/api/v2/events`](../api/events.html), mantido aberto por navegador. O fluxo envia cabeçalhos que desligam o buffering do proxy
(`X-Accel-Buffering: no`) e uma linha de keep-alive a cada 15 segundos, por isso o tempo limite de leitura habitual de 60 segundos mantém-no aberto;
quando um proxy o fecha mesmo assim, o navegador volta a ligar-se sozinho. A saída por baixo de um formulário, logo após um lançamento, é
lida em vez disso a cada dois segundos. Um lançamento de tarefa regressa assim que a tarefa é criada, por isso um playbook longo não mantém
um pedido aberto.

Os pedidos que podem demorar são:

* **cópia de segurança e restauro** a partir da página **Cópias de segurança**, que esperam que o comando de dump ou de restauro termine, até
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (3600 por predefinição)
* **carregamentos grandes** através de um campo de ficheiro, que transmitem o ficheiro inteiro num só pedido
* **mensagens de chat**, quando o [assistente de chat](../chat/) está ativado, que esperam pela resposta do fornecedor do modelo

Os proxies muitas vezes dão tempo limite ao fim de 60 segundos e limitam o corpo dos pedidos (o Nginx aceita 1 MB por predefinição). Aumente ambos para
as rotas do AnsibleForms, como nos exemplos abaixo.

---

## WebSockets dos runners

A partir da 7.3.0, um [Runner de saída](../rte/modes.html#outbound) liga-se à aplicação e mantém um WebSocket aberto em
`<BASE_URL>/api/v2/rte/socket`. O proxy tem de deixar passar o upgrade, ou o Runner nunca se liga e continua a tentar:

| Proxy | O que o WebSocket precisa |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` e os cabeçalhos `Upgrade` e `Connection`, que o Nginx não reencaminha por predefinição |
| Traefik | Nada: os WebSockets passam tal como estão |
| Apache | `upgrade=websocket` na linha `ProxyPass` (2.4.47 e posteriores), ou `mod_proxy_wstunnel` antes disso |

Ambos os lados enviam um ping a cada 20 segundos, por isso o tempo limite de leitura habitual de 60 segundos mantém aberto um socket inativo.

---

## Tamanho dos cabeçalhos do pedido

Cada pedido leva o token de início de sessão no seu cabeçalho `Authorization`, ao lado dos cookies e dos cabeçalhos que o proxy adiciona.
Tanto o proxy como a aplicação limitam o tamanho dos cabeçalhos do pedido, e recusam um pedido acima do limite antes de o
AnsibleForms o ver, por isso nada chega ao registo do servidor. As predefinições:

| Componente | Limite | Predefinição | Recusado com |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), todos os cabeçalhos juntos | 16384 bytes | 431 |
| Nginx | `large_client_header_buffers`, por campo de cabeçalho | `4 8k`: 8 KB por campo | 400 |
| Traefik | `http.maxHeaderBytes` do entry point, todos os cabeçalhos juntos | 1 MB | 431 |
| HAProxy | `tune.bufsize` na secção `global`, o bloco de cabeçalhos inteiro, menos a reserva de `tune.maxrewrite` (1024 bytes) | 16384 bytes: 15360 bytes de cabeçalhos | 400 |
| Apache | `LimitRequestFieldSize`, por campo de cabeçalho | 8190 bytes | 400 |

Até à 7.0.3, o token de início de sessão levava todos os grupos de um utilizador de início de sessão único, e podia ultrapassar estes limites, consulte
[Formulários e tarefas vazios depois de um início de sessão único](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
A partir da 7.1.0 o token mantém-se pequeno, e as predefinições chegam. Quando outra coisa torna os cabeçalhos grandes, como
cookies de outras aplicações no mesmo domínio ou um gateway de início de sessão único à frente, aumente os limites em conjunto:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, ou antes da 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; ambos são
  lidos no arranque, por isso reinicie a aplicação depois de uma alteração
* Nginx: `large_client_header_buffers 4 32k;` no bloco `http` ou `server`
* HAProxy: `tune.bufsize 65536` na secção `global`; cada fluxo recebe um buffer desse tamanho, por isso o HAProxy aconselha
  baixar o `maxconn` global no mesmo fator, e o HTTP/2 precisa de pelo menos os 16384 predefinidos
* Apache: `LimitRequestFieldSize 32768` na configuração do servidor ou no virtual host

---

## Endereços dos clientes

Atrás de um proxy, todas as ligações vêm do proxy. Sem [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY),
o registo de auditoria regista o endereço do proxy em todas as ações, e os
[limites de início de sessão](../security/hardening.html#sign-in-limits-and-passwords) por endereço contam todos os clientes como um só endereço.
`TRUST_PROXY` diz em que proxies a aplicação pode acreditar quando indicam o cliente em `X-Forwarded-For`:

| Valor | Endereço do cliente |
|-------|----------------|
| `0` (predefinição) | O endereço da ligação. `X-Forwarded-For` é ignorado; vazio, `false`, `off` e `no` significam o mesmo. |
| Um número, ex. `1` | Confia em tantos proxies à frente da aplicação: `1` para um único reverse proxy, `2` para um balanceador de carga à frente de um ingress. |
| Uma lista, ex. `10.0.0.5,172.16.0.0/12` | Confia nos proxies nestes endereços e intervalos CIDR. Também são aceites os presets `loopback`, `linklocal` e `uniquelocal`. |
| `true` | Confia em todos os saltos: é usado o endereço mais à esquerda de `X-Forwarded-For`. |

A aplicação percorre `X-Forwarded-For` a partir da direita, salta os proxies de confiança, e fica com o primeiro endereço que
não é um deles. Use o número exato de proxies, ou os seus endereços:

* `X-Forwarded-For` é um simples cabeçalho de pedido que qualquer cliente pode enviar. Um número demasiado alto, ou `true`, deixa um
  cliente escolher o endereço que o registo de auditoria regista. `true` só é seguro quando a aplicação só pode ser alcançada através
  do proxy, e o servidor regista um aviso `[SECURITY]` no arranque quando está definido.
* O proxy tem de adicionar o endereço de onde recebeu a ligação, como fazem os exemplos abaixo
  (`$proxy_add_x_forwarded_for` no Nginx; o Traefik e o `mod_proxy` do Apache adicionam-no por predefinição).
* Um valor inválido é recusado na página de definições; definido no ambiente, é registado como erro no arranque e
  não se confia em nenhum proxy. Uma alteração guardada na página de definições aplica-se sem reiniciar.

---

## Exemplos

Cada exemplo publica o AnsibleForms em `https://forms.example.com/ansibleforms/`, com o TLS terminado pelo proxy e
a aplicação a correr com `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` e `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` não nomeia nenhum URI, por isso o Nginx reencaminha o caminho tal como chegou, prefixo incluído. O bloco `map` vai no
contexto `http` (um ficheiro em `conf.d/` é incluído aí), e deixa passar o upgrade WebSocket dos Runners:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

Sem subcaminho, use `location /` e deixe `BASE_URL` por definir.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Labels no serviço `app` do projeto docker-compose, com o Traefik na mesma rede Docker. O serviço
não publica nenhuma porta própria, o Traefik chega a ele pela rede:

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

Não há middleware `StripPrefix` de propósito. O Traefik define ele próprio os cabeçalhos `X-Forwarded-*` e não limita
o tamanho do corpo, mas verifique os `respondingTimeouts` do entry point quando as cópias de segurança ou os carregamentos demoram mais do que o seu
tempo limite de leitura. Sem subcaminho, mantenha só a parte `Host(...)` da regra.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Precisa de `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, e do Apache 2.4.47 ou posterior para o `upgrade=websocket` dos Runners.
Ambos os lados de `ProxyPass` levam o prefixo:

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

Sem subcaminho, faça proxy de `/` para `http://10.0.0.20:8000/` e deixe `BASE_URL` por definir.

</div>
</div>

Para manter cifrado o troço entre o proxy e a aplicação, corra a aplicação com `HTTPS=1`, aponte o proxy para
`https://`, e dê à aplicação um certificado em que o proxy confie, consulte [HTTPS](../security/https.html).
