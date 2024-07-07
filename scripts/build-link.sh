#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

test_node_modules_dir=./test/node_modules
if [[ ! -d $test_node_modules_dir ]]; then
	(cd test && yarn install)
fi

(
	cd $test_node_modules_dir \
	&& rm -r ./unenum || true \
	&& ln -s ../../dist unenum
)
