#!/bin/bash

# Only on PR builds
if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
  diff <(git show master:package.json | grep -Po "version: \'.*?\',") <(git show HEAD:package.json | grep -Po "version: \'.*?\',")

  version_changed=$?; if [ $version_changed != 0 ]; then
    exit 0
  else
    echo 'Version needs to be bumped in order to merge PRs'
    exit 1
  fi
fi
