#!/bin/bash
set -e

avaArgs=()

if [ -n "$TEST_ONLY" ]; then
  avaArgs+=("packages/*$TEST_ONLY*/test")
fi

node_modules/.bin/ava "${avaArgs[@]}"
