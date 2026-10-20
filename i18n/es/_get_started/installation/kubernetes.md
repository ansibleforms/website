---
layout: default
title: Kubernetes
parent: Instalación
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Instala AnsibleForms y su base de datos MySQL con el chart de Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El chart de Helm despliega AnsibleForms con MySQL y el RTE que ejecuta los playbooks (consulta la [referencia de valores](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
El [instalador](installer.html) también instala el chart a partir de unas pocas preguntas, y actualiza una release que no instaló él. El mismo
chart instala también un Runner por sí solo, para un AnsibleForms que se ejecuta en otro sitio (consulta [Un Runner en Kubernetes](#a-runner-on-kubernetes)).

---

## Requisitos previos

Antes de empezar, necesitas:

* **Clúster de Kubernetes** : con `kubectl` configurado para acceder a él
* **Helm 3** : para instalar y actualizar el chart
* **Almacenamiento** : una StorageClass con aprovisionamiento dinámico, o PersistentVolumes creados de antemano
* **Controlador de ingress** : solo si quieres exponer AnsibleForms a través de un ingress

---

## 1. Obtén los valores del chart

Descarga los valores predeterminados del chart a un archivo propio, desde el repositorio de charts o desde el registro OCI:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Repositorio de charts</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">Registro OCI</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

No hay que añadir ningún repositorio: el chart se descarga del GitHub Container Registry.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Configura el almacenamiento

Tanto AnsibleForms como MySQL guardan sus datos en un volumen persistente. Indica la StorageClass y el tamaño de cada uno:

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

Un `className` vacío usa la StorageClass predeterminada del clúster. El modo de acceso es `ReadWriteMany` de forma predeterminada,
y muchas clases de almacenamiento no lo ofrecen; `ReadWriteOnce` basta con una sola réplica. Para PersistentVolumes creados de
antemano, consulta el [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart.

---

## 3. Define las credenciales

AnsibleForms necesita una cuenta de administrador, una contraseña de base de datos y un `ENCRYPTION_SECRET`, la clave que cifra las credenciales
guardadas en AnsibleForms. Para cambiar esa clave más adelante, pon la antigua en [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
durante un arranque: todos los secretos guardados se vuelven a cifrar con la clave nueva. Puedes proporcionarlos de tres maneras:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">En el archivo de valores</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Generadas por el chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Secret existente</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Defínelas en `my_values.yaml`. El chart las guarda en un Secret llamado `<release>-secrets`:

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

Deja que el chart genere lo que no proporciones, en la primera instalación. Después conserva los mismos valores en cada
actualización:

```bash
--set secrets.generate=true
```

Esto no funciona con Argo CD ni con Flux, que renderizan el chart sin acceso al clúster. El Secret generado
sobrevive a `helm uninstall`; haz una copia de seguridad, porque `ENCRYPTION_SECRET` no se puede recuperar.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Apunta el chart a un Secret que gestiones tú, por ejemplo con External Secrets, Sealed Secrets o SOPS. El chart
no crea entonces ninguno:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

El Secret debe contener `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` y `ADMIN_PASSWORD`.

</div>
</div>

---

## 4. Elige la imagen del RTE

AnsibleForms 7 no ejecuta ningún playbook por sí mismo: lo hace el RTE (entorno de ejecución). El chart lo ejecuta como un segundo contenedor en el
pod del servidor, sobre el mismo volumen, y lo registra como el runner predeterminado `rte`, así que los formularios de playbook funcionan sin configurar nada. Desde la 7.3.0,
la aplicación lo llama en `127.0.0.1` y mantiene abierto un WebSocket (`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)): el RTE no recibe
ajustes de base de datos ni clave de cifrado. La semilla de configuración del chart declara una credencial de RTE con el token y esa dirección, y
el runner, en modo inbound, que inicia sesión con ella.

La imagen predeterminada, `ghcr.io/ansibleforms/ansibleforms-rte-full`, contiene ansible con sus colecciones y las bibliotecas de Python que tenía la imagen 6.5.
Para más, o para menos, construye la tuya sobre una de las tres capas del RTE (`ansibleforms-rte-base`, `-rte-core` o `-rte-full`, consulta
[Las imágenes del RTE](../rte/images.html)) y apunta el chart a ella:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

El token entre la aplicación y el RTE, y la clave que firma las sesiones, se generan en la primera instalación en
el Secret `<release>-keys` y se conservan en cada actualización. Con una semilla de configuración propia, añade a ella esa credencial y ese runner: las notas que Helm muestra tras la instalación indican cómo
(consulta el [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart).

---

## 5. Instala el chart

Instala el chart en su propio namespace con tus valores:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Con el registro OCI, usa `oci://ghcr.io/ansibleforms/charts/ansibleforms` como chart. En todo lo que se ejecute de forma desatendida,
fija la versión del chart con `--version`, para que nunca se instale una nueva release por su cuenta.

---

## 6. Comprueba la instalación

El chart incluye una prueba que comprueba tanto el servidor web como la conexión con la base de datos:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

La prueba termina con `OK` cuando AnsibleForms responde y su base de datos acepta conexiones.

---

## 7. Abre AnsibleForms

Cómo llegas a AnsibleForms depende de cómo esté expuesto el servidor:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Con el servicio `ClusterIP` predeterminado y sin ingress, no hay nada expuesto fuera del clúster. Redirige un puerto local para
echar un vistazo:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Después abre `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Pon `services.server.type: LoadBalancer` (opcionalmente con una dirección fija en `services.server.loadbalancer.ip`)
y espera a que el servicio obtenga su dirección:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Activa el ingress e indica el nombre de host que se enruta a tu controlador de ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

El [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart cubre TLS detrás de un ingress, incluido el ajuste del backend que necesita HTTPS en el
servidor.

</div>
</div>

---

## 8. Inicia sesión

Inicia sesión como el usuario administrador, `admin` de forma predeterminada. Para leer la contraseña del Secret:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Con `secrets.existingSecret`, léela de tu propio Secret.

---

## Un Runner en Kubernetes

Con `runner.enabled`, el chart instala solo un RTE: un Runner para un AnsibleForms instalado en otro sitio, en otro namespace, otro
clúster o en una VM. Llama a la aplicación y mantiene abierto un WebSocket (`RTE_MODE=outbound`, consulta [Modos](../rte/modes.html)), así que no necesita
base de datos, ni clave de cifrado, ni puerto de entrada. No renderiza ni aplicación, ni MySQL, ni Service, ni Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Valor | Qué hace |
|---|---|
| `runner.enabled` | Instala solo el Runner: sin aplicación, sin MySQL, sin Service, sin Ingress |
| `runner.appUrl` | La dirección de la aplicación tal como la abren los usuarios, con su `BASE_URL` si lo hay. Obligatorio |
| `runner.name` | El nombre de runner con el que se une (`RTE_NAME`). Vacío: el nombre de la release |
| `runner.joinToken` | Un [token de unión](../runners/registration.html#join-tokens) creado en la aplicación, que se lee en el primer arranque para aprobar el Runner al momento |
| `runner.appTlsVerify` | `false` acepta el certificado autofirmado de la aplicación (`APP_TLS_VERIFY=0`), solo dentro de una red de confianza |

Sin token de unión, el Runner pide unirse y espera a que un administrador lo apruebe en **Conexiones > Runners**. Una vez aprobado,
inicia sesión con su propio `RTE_TOKEN`, guardado en el Secret `<release>-keys`: conserva ese Secret junto con la release. El
[instalador](installer.html#kubernetes) también instala este modo runner, cuando eliges el rol Runner y Kubernetes.

---

## Siguientes pasos

El [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart cubre el resto de la configuración:

* **Tu propia base de datos** : pon `mysql.enabled: false` y apunta AnsibleForms a un servidor MySQL existente
* **Formularios desde ConfigMaps** : proporciona `config.yaml` y los archivos de formulario mediante ConfigMaps
* **HTTPS detrás de un ingress**, recursos, ubicación en nodos y registros privados
* **El RTE** : su token, una imagen de RTE propia, o ningún RTE

Para pasar a una release más reciente, consulta [Actualizar en Kubernetes](../upgrading/kubernetes.html).
