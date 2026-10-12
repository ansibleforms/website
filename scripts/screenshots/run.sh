#!/usr/bin/env bash
# Retakes the GUI screenshots of the website : starts a throwaway AnsibleForms instance (the
# app, its database and an RTE that runs the playbooks) from a copy of ./data, fills it
# (seed.mjs), takes the screenshots into source/assets/screenshots (capture.mjs) and removes
# the instance again, its database included.
#
# Usage : ./run.sh [version] [screenshot ...]
#   version     the image tag of the app and the RTE (default: latest), e.g. 7.0.0 or latest-rc
#   screenshot  only these (e.g. dashboard designer) ; all of them when none is given
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
export AF_VERSION="${1:-latest}"
shift || true
export AF_PORT="${AF_PORT:-8444}"
export AF_DATA="$(mktemp -d)"
base="https://127.0.0.1:${AF_PORT}"

cleanup() {
  docker compose -f "$here/docker-compose.yml" down -v >/dev/null 2>&1 || true
  # the instance writes its files as uid 1000, which need not be this user : remove them
  # from inside a container
  docker run --rm -v "$AF_DATA:/data" alpine sh -c 'rm -rf /data/* /data/.[!.]*' >/dev/null 2>&1 || true
  rmdir "$AF_DATA" 2>/dev/null || true
}
trap cleanup EXIT

cp -r "$here/data/." "$AF_DATA/"
# the app and the RTE run as uid 1000 and write into it (logs, backups, repositories)
chmod -R a+rwX "$AF_DATA"
echo "starting AnsibleForms ${AF_VERSION} on ${base}"
docker compose -f "$here/docker-compose.yml" pull -q app rte
# --wait : until the app and the RTE are healthy
docker compose -f "$here/docker-compose.yml" up -d --wait
curl -sk "$base/api/v2/version"; echo

cd "$here"
[ -d node_modules ] || npm install --no-audit --no-fund
npx playwright install chromium >/dev/null
node seed.mjs "$base"
node capture.mjs "$base" "$@"
