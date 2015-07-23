#!/bin/bash

# Only on PR builds
if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
  diff <(git show master:packages/latte/package.js | grep -Po "version: \'.*?\',") <(git show HEAD:packages/latte/package.js | grep -Po "version: \'.*?\',")

  version_changed=$?; if [ $version_changed != 0 ]; then
    exit 0
  else
    echo 'Version needs to be bumped in order to merge PRs'
    exit 1
  fi
fi
