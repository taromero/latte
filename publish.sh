#!/bin/bash

# Only if not on a PR build => only master builds
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
  printf $LI | meteor login && meteor publish
fi
