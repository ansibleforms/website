---
layout: default
title: Kubernetes
parent: Actualizar
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Actualiza una instalación hecha con el chart de Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cada versión del chart despliega una release de AnsibleForms. Una actualización instala una versión más reciente del chart con tus valores existentes;
los datos de los volúmenes persistentes se conservan. Una actualización que no cambia nada deja los pods intactos.

---

## Antes de actualizar

Prepara la actualización para poder volver atrás si algo sale mal:

* **Haz una copia de seguridad** en **Configuración → Copias de seguridad**. La nueva release actualiza el esquema de la base de datos en su primer arranque.
* **Lee el [registro de cambios](../changelog)** de las releases entre tu versión y la nueva.
* **¿Pasas a una nueva versión mayor?** Sigue primero [Actualizar a la v7](../upgrade-7.html).
* **Lee el [registro de cambios](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) del chart** para ver los cambios en los valores.
* **Con credenciales generadas** (`secrets.generate`), haz una copia de seguridad del Secret `<release>-secrets`: `ENCRYPTION_SECRET` no se puede recuperar.
* **¿Vienes de la 7.2?** El RTE del pod del servidor cambia de modo: consulta [De la 7.2 a la 7.3](#from-72-to-73).

---

## De la 7.2 a la 7.3

El chart 7.3.0 saca del modo database al RTE que está junto a la aplicación, modo obsoleto en la 7.3.0 y eliminado en la 8.0.0. La aplicación lo llama en
`127.0.0.1` y mantiene abierto un WebSocket (`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)):

* El contenedor del RTE ya no recibe `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` ni `RTE_URL`, y toma los archivos del trabajo del
  volumen compartido (`RTE_FILES=local`)
* La semilla de configuración del chart declara una credencial de RTE con el token y la dirección, y el runner, `rte_mode: inbound`, que inicia
  sesión con ella. Con la semilla del chart, no hay nada que hacer
* Con `containers.rte.seedRunner: false`, o con una semilla de configuración propia (`CONFIG_SEED_PATH`), el RTE ya no se añade a sí mismo como runner.
  Decláralo tú, en tu semilla o en **Conexiones → Runners**: una credencial de RTE con `http://127.0.0.1:<port>` y el token,
  y un runner de tipo RTE con `rte_mode: inbound` que la nombre. Las notas que Helm muestra tras la actualización indican cómo

Desde la 7.3.0, el chart también instala un Runner por sí solo, con `runner.enabled` (consulta
[Un Runner en Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Busca la nueva versión del chart

Actualiza el repositorio de charts y lista las versiones disponibles del chart:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Actualiza la release

Ejecuta el mismo comando `helm upgrade` que en la instalación, con tu archivo de valores y la nueva versión del chart:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Con el registro OCI, usa `oci://ghcr.io/ansibleforms/charts/ansibleforms` como chart.

---

## 3. Comprueba la actualización

Espera a los nuevos pods y después ejecuta la prueba del chart, que comprueba tanto el servidor web como la conexión con la base de datos:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

En AnsibleForms, **Ayuda → Acerca de** muestra la versión que se está ejecutando, y **Configuración → Estado** muestra el estado de la
base de datos, del esquema y de los demás sistemas de los que depende AnsibleForms.

---

## Volver atrás

Helm guarda el historial de la release. Para volver a la revisión anterior:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Si no arranca sobre la base de datos actualizada, restaura tu copia de seguridad (consulta el [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart).
