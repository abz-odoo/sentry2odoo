#!/usr/bin/env bash
set -e
BASEDIR=$(dirname $(readlink -f "$0"))

pushd "$BASEDIR"
git fetch
git reset --hard origin/master

node index.js
popd
