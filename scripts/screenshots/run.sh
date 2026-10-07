#!/usr/bin/env bash
# Retakes the GUI screenshots of the website : starts a throwaway AnsibleForms instance from a
# copy of ./data, fills it (seed.mjs), takes the screenshots into source/assets/screenshots
# (capture.mjs) and removes the instance again, its database included.
#
# Usage : ./run.sh [version] [screenshot ...]
#   version     the image tag to take them from (default: latest)
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
  # the instance writes its files as root : remove them from inside a container
  docker run --rm -v "$AF_DATA:/data" alpine sh -c 'rm -rf /data/* /data/.[!.]*' >/dev/null 2>&1 || true
  rmdir "$AF_DATA" 2>/dev/null || true
}
trap cleanup EXIT

cp -r "$here/data/." "$AF_DATA/"
echo "starting AnsibleForms ${AF_VERSION} on ${base}"
docker compose -f "$here/docker-compose.yml" pull -q app
docker compose -f "$here/docker-compose.yml" up -d
until curl -sk "$base/api/v2/version" | grep -q '"version"'; do sleep 3; done
curl -sk "$base/api/v2/version"; echo

cd "$here"
[ -d node_modules ] || npm install --no-audit --no-fund
npx playwright install chromium >/dev/null
node seed.mjs "$base"
node capture.mjs "$base" "$@"
