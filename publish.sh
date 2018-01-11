#!/bin/bash

# Only if not on a PR build => only master builds
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
  echo 'Publishing package to npm'
  printf "%s" "$LI" | npm login && npm publish
fi
