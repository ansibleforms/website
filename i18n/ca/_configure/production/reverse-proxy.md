---
layout: default
title: Proxy invers
parent: En producció
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Proxy invers
{: .no_toc }

Publica AnsibleForms darrere de Nginx, Traefik o Apache, a l'arrel o sota un subcamí
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quan fer-ne servir un

AnsibleForms serveix la interfície, l'API REST i Swagger en un sol port; un proxy invers al davant et permet:

* servir-lo al port 443 amb un certificat gestionat per les teves eines habituals (ACME, una CA corporativa)
* compartir un nom de host amb altres aplicacions, publicant AnsibleForms sota un subcamí
* mantenir el port de l'aplicació i la base de dades fora de la xarxa pública

Un proxy és opcional: l'aplicació pot servir HTTPS ella mateixa, vegeu [HTTPS](../security/https.html).

---

## Els ajustos que importen

Només uns quants ajustos afecten el comportament d'AnsibleForms darrere d'un proxy:

| Ajust | Darrere d'un proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | El port al qual reenvia el proxy, `8000` per defecte. El projecte docker-compose el posa a `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` quan el proxy termina el TLS i arriba a l'aplicació per una xarxa privada, `1` per xifrar també aquest tram. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | El subcamí, per exemple `/ansibleforms`. Deixa'l a `/` quan l'aplicació té un nom de host propi. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Quins proxies poden indicar l'adreça del client a `X-Forwarded-For`, normalment `1`. Vegeu [Adreces dels clients](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | La petició JSON més gran que accepta l'aplicació, 50 MB per defecte. El proxy n'ha de permetre com a mínim aquesta. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | El fitxer més gran que accepta un camp de pujada d'un formulari, 10 GB per defecte. El proxy també l'ha de permetre, o les pujades hi fallen. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | El conjunt més gran de capçaleres de petició que accepta l'aplicació, 16 KB per defecte, des de la 7.1.0. Vegeu [Mida de les capçaleres de petició](#request-header-size). |
| **URL arrel pública** | A **Sistema > General**, a la pestanya **Servidor**: l'adreça on arriben els usuaris, subcamí inclòs. Construeix els enllaços dels correus de notificació, dels missatges dels canals i de les sol·licituds d'aprovació. |

Per a Entra ID o OIDC, registra l'adreça pública com a URI de redirecció, amb el subcamí de `BASE_URL` si n'hi ha.

---

## Servir sota un subcamí

`BASE_URL` munta tota l'aplicació sota el subcamí; el proxy ha de reenviar el camí **sense canvis**.
Amb `BASE_URL=/ansibleforms`:

* la interfície, `/api/v2/...` i la interfície de Swagger se serveixen totes sota `/ansibleforms/`
* el `<base href>` de la interfície es reescriu en arrencar, de manera que els recursos i les crides a l'API es resolen sota el subcamí
* una petició a `/` o a `/ansibleforms` (sense barra final) es redirigeix a `/ansibleforms/`

Conserva el prefix: cap `StripPrefix` a Traefik, cap URI a `proxy_pass` a Nginx, ja que l'aplicació l'espera.

La pàgina **Estat** mostra la URL base vigent.

---

## Temps d'espera, pujades i sortida en directe

La pàgina de tasques i els comptadors de tasques s'assabenten dels canvis a través d'un únic flux de llarga durada d'esdeveniments enviats pel servidor,
[`/api/v2/events`](../api/events.html), obert per a cada navegador. El flux envia capçaleres que desactiven la memòria intermèdia del proxy
(`X-Accel-Buffering: no`) i una línia de keep-alive cada 15 segons, de manera que l'habitual temps d'espera de lectura de 60 segons el manté obert;
quan un proxy el tanca igualment, el navegador es torna a connectar tot sol. La sortida sota un formulari, just després d'un llançament, es
llegeix en canvi cada dos segons. El llançament d'una tasca torna tan bon punt es crea la tasca, de manera que un playbook llarg no manté
oberta cap petició.

Les peticions que poden trigar són:

* **còpia de seguretat i restauració** des de la pàgina **Còpies de seguretat**, que esperen que acabi l'ordre de bolcat o de restauració, fins a
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (3600 per defecte)
* **pujades grans** a través d'un camp de fitxer, que transmeten tot el fitxer en una sola petició
* **missatges de xat**, quan l'[assistent de xat](../chat/) està activat, que esperen que respongui el proveïdor del model

Els proxies sovint esgoten el temps d'espera als 60 segons i limiten el cos de les peticions (Nginx accepta 1 MB per defecte). Augmenta tots dos per a
les rutes d'AnsibleForms, com als exemples de més avall.

---

## WebSockets dels runners

Des de la 7.3.0 un [Runner sortint](../rte/modes.html#outbound) truca a l'aplicació i manté un WebSocket obert a
`<BASE_URL>/api/v2/rte/socket`. El proxy ha de deixar passar l'upgrade, o el Runner no es connecta mai i continua trucant:

| Proxy | Què necessita el WebSocket |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` i les capçaleres `Upgrade` i `Connection`, que Nginx no reenvia per defecte |
| Traefik | Res: els WebSockets hi passen tal com són |
| Apache | `upgrade=websocket` a la línia `ProxyPass` (2.4.47 i posteriors), o `mod_proxy_wstunnel` abans d'aquesta versió |

Tots dos extrems envien un ping cada 20 segons, de manera que l'habitual temps d'espera de lectura de 60 segons manté obert un sòcol inactiu.

---

## Mida de les capçaleres de petició

Cada petició porta el token d'inici de sessió a la seva capçalera `Authorization`, al costat de les galetes i de les capçaleres que afegeix el proxy.
Tant el proxy com l'aplicació limiten la mida de les capçaleres de petició, i rebutgen una petició que passa del límit abans que
AnsibleForms la vegi, de manera que res no arriba al registre del servidor. Els valors predeterminats:

| Component | Límit | Predeterminat | Rebutjada amb |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), totes les capçaleres juntes | 16384 bytes | 431 |
| Nginx | `large_client_header_buffers`, per camp de capçalera | `4 8k`: 8 KB per camp | 400 |
| Traefik | `http.maxHeaderBytes` del punt d'entrada, totes les capçaleres juntes | 1 MB | 431 |
| HAProxy | `tune.bufsize` a la secció `global`, tot el bloc de capçaleres, menys la reserva de `tune.maxrewrite` (1024 bytes) | 16384 bytes: 15360 bytes de capçaleres | 400 |
| Apache | `LimitRequestFieldSize`, per camp de capçalera | 8190 bytes | 400 |

Fins a la 7.0.3 el token d'inici de sessió portava tots els grups d'un usuari d'inici de sessió únic, i podia superar aquests límits, vegeu
[Formularis i tasques buits després d'un inici de sessió únic](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Des de la 7.1.0 el token es manté petit, i els valors predeterminats són suficients. Quan alguna altra cosa fa grans les capçaleres, com ara
galetes d'altres aplicacions al mateix domini o una passarel·la d'inici de sessió únic al davant, augmenta els límits alhora:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, o abans de la 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; tots dos es
  llegeixen en arrencar, així que reinicia l'aplicació després d'un canvi
* Nginx: `large_client_header_buffers 4 32k;` al bloc `http` o `server`
* HAProxy: `tune.bufsize 65536` a la secció `global`; cada flux rep una memòria intermèdia d'aquesta mida, així que HAProxy recomana
  reduir el `maxconn` global en el mateix factor, i HTTP/2 necessita com a mínim el valor predeterminat de 16384
* Apache: `LimitRequestFieldSize 32768` a la configuració del servidor o a l'amfitrió virtual

---

## Adreces dels clients

Darrere d'un proxy totes les connexions vénen del proxy. Sense [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY),
el rastre d'auditoria registra l'adreça del proxy per a cada acció, i els
[límits d'inici de sessió](../security/hardening.html#sign-in-limits-and-passwords) per adreça compten tots els clients com una sola adreça.
`TRUST_PROXY` indica quins proxies pot creure l'aplicació quan indiquen el client a `X-Forwarded-For`:

| Valor | Adreça del client |
|-------|----------------|
| `0` (predeterminat) | L'adreça de la connexió. `X-Forwarded-For` s'ignora; buit, `false`, `off` i `no` volen dir el mateix. |
| Un nombre, p. ex. `1` | Confia en aquest nombre de proxies davant de l'aplicació: `1` per a un sol proxy invers, `2` per a un balancejador de càrrega davant d'un ingress. |
| Una llista, p. ex. `10.0.0.5,172.16.0.0/12` | Confia en els proxies d'aquestes adreces i rangs CIDR. També s'accepten els predefinits `loopback`, `linklocal` i `uniquelocal`. |
| `true` | Confia en tots els salts: s'utilitza l'adreça de més a l'esquerra de `X-Forwarded-For`. |

L'aplicació recorre `X-Forwarded-For` des de la dreta, salta els proxies de confiança i pren la primera adreça que no
n'és cap. Fes servir el nombre exacte de proxies, o les seves adreces:

* `X-Forwarded-For` és una capçalera de petició normal que qualsevol client pot enviar. Un nombre massa alt, o `true`, permet a un
  client triar l'adreça que registra el rastre d'auditoria. `true` només és segur quan només es pot arribar a l'aplicació a través
  del proxy, i el servidor registra un avís `[SECURITY]` en arrencar quan està definit.
* El proxy ha d'afegir l'adreça des de la qual ha rebut la connexió, com fan els exemples de més avall
  (`$proxy_add_x_forwarded_for` a Nginx; Traefik i `mod_proxy` d'Apache l'afegeixen per defecte).
* Un valor no vàlid es rebutja a la pàgina de configuració; definit a l'entorn, es registra com a error en arrencar i
  no es confia en cap proxy. Un canvi desat a la pàgina de configuració s'aplica sense reiniciar.

---

## Exemples

Cada exemple publica AnsibleForms a `https://forms.example.com/ansibleforms/`, amb el TLS terminat pel proxy i
l'aplicació executant-se amb `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` i `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` no nomena cap URI, de manera que Nginx reenvia el camí tal com ha arribat, prefix inclòs. El bloc `map` va al
context `http` (un fitxer sota `conf.d/` s'hi inclou), i deixa passar l'upgrade a WebSocket dels runners:

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

Sense subcamí, fes servir `location /` i deixa `BASE_URL` sense definir.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Etiquetes al servei `app` del projecte docker-compose, amb Traefik a la mateixa xarxa de Docker. El servei
no publica cap port propi; Traefik hi arriba per la xarxa:

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

No hi ha cap middleware `StripPrefix`, a propòsit. Traefik defineix ell mateix les capçaleres `X-Forwarded-*` i no limita
la mida del cos, però revisa els `respondingTimeouts` del punt d'entrada quan les còpies de seguretat o les pujades triguen més que el seu
temps d'espera de lectura. Sense subcamí, conserva només la part `Host(...)` de la regla.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Necessita `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, i Apache 2.4.47 o posterior per a l'`upgrade=websocket` dels runners.
Tots dos costats de `ProxyPass` porten el prefix:

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

Sense subcamí, fes proxy de `/` cap a `http://10.0.0.20:8000/` i deixa `BASE_URL` sense definir.

</div>
</div>

Per mantenir xifrat el tram entre el proxy i l'aplicació, executa l'aplicació amb `HTTPS=1`, apunta el proxy a
`https://` i dona a l'aplicació un certificat en què el proxy confiï, vegeu [HTTPS](../security/https.html).
