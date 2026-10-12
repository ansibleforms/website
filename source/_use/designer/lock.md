---
layout: default
title: The designer lock
parent: Designer
nav_order: 1
---

# The designer lock
{: .no_toc }

One person edits at a time
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Taking the lock

The designer is off until you switch it on, with the switch at the top right of the designer. Switching it on takes the
lock: from then on you are the only one who can save, until you switch it off again.

Without the lock the designer shows **Designer is not active**, and nothing can be edited.

---

## When someone else has it

While another user holds the lock, the designer shows **Designer is in use by** that user, and nothing else: no sections,
no files.

The switch shows on but greyed out, with **Locked by** and the user's name beside it. You can take the lock once they
switch the designer off. Every designer open sees it at once when the lock is taken or freed, without a reload.

---

## Releasing someone's lock

An admin can free a lock that somebody else holds, for example when they went home with the designer open.

**Release**, beside **Locked by**, shows for admins only. It asks first: the user's changes that were not saved are lost.

---

## A forgotten lock

A lock nobody uses frees itself, so nobody waits on a designer that nobody has open.

The holder's open designer keeps telling the server that it is still there. When the server has not heard from it for
5 minutes, because the browser was closed, the computer shut down or the network went away, the lock is free again. When
the holder comes back to the designer, it takes the lock again if nobody else has.
