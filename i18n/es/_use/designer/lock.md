---
layout: default
title: El bloqueo del diseñador
parent: Diseñador
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# El bloqueo del diseñador
{: .no_toc }

Una persona edita a la vez
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tomar el bloqueo

El diseñador está desactivado hasta que lo activas, con el interruptor de la parte superior derecha del diseñador. Activarlo toma el
bloqueo: a partir de ese momento eres el único que puede guardar, hasta que lo vuelvas a desactivar.

Sin el bloqueo, el diseñador muestra **El diseñador no está activo** y no se puede editar nada.

Los guardados nunca se solapan: desde 7.3.0, mientras se ejecuta un guardado, un push o una carga, un segundo **Guardar** (un doble clic, o Ctrl+S mantenido) se
ignora, de modo que no puede escribir una segunda copia de seguridad ni un segundo commit compitiendo con el primero.

---

## Cuando lo tiene otra persona

Mientras otro usuario tiene el bloqueo, el diseñador muestra el nombre de ese usuario seguido de **está usando el diseñador**, y nada más: ni secciones,
ni archivos.

El interruptor aparece activado pero en gris, con **Bloqueado por** y el nombre del usuario al lado. Puedes tomar el bloqueo en cuanto
desactive el diseñador. Todos los diseñadores abiertos lo ven al instante cuando el bloqueo se toma o se libera, sin recargar.

Cuando dos usuarios activan el diseñador en el mismo momento, uno de ellos obtiene el bloqueo. Desde 7.3.0 el otro ve quién lo tiene
y todos los editores siguen en solo lectura, para que no se pueda escribir nada que luego no se pueda guardar.

---

## Liberar el bloqueo de otra persona

Un administrador puede liberar un bloqueo que tiene otra persona, por ejemplo cuando se fue a casa con el diseñador abierto.

**Liberar**, junto a **Bloqueado por**, solo se muestra a los administradores. Pide confirmación antes: los cambios del usuario que no se guardaron se pierden.

Desde 7.3.0 se avisa al usuario cuyo bloqueo se liberó, y de quién lo hizo: el nombre del administrador seguido de **ha liberado tu bloqueo del diseñador.**,
y de **Los cambios sin guardar ya no se pueden guardar.** Su diseñador no vuelve a tomar el bloqueo por sí solo; lo activa de nuevo
cuando quiere seguir.

---

## Un bloqueo olvidado

Un bloqueo que nadie usa se libera solo, para que nadie espere a un diseñador que nadie tiene abierto.

El diseñador abierto de quien tiene el bloqueo sigue diciéndole al servidor que todavía está ahí. Cuando el servidor no sabe nada de él durante
5 minutos, porque se cerró el navegador, se apagó el ordenador o se cayó la red, el bloqueo vuelve a estar libre. Cuando
quien lo tenía vuelve al diseñador, toma el bloqueo de nuevo si nadie más lo ha tomado. La liberación por un administrador es la excepción: el
bloqueo no se vuelve a tomar después de ella.
