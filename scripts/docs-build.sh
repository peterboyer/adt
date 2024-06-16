#!/usr/bin/env bash

cat ./README.ts \
| sed "s|\t|  |g" \
| sed "s|//>|\`\`\`ts|g" \
| sed "s|//<|\`\`\`|g" \
| sed "s|//hr|---|g" \
| sed "s|//+||g" \
| grep -v '/\*!' \
| grep -v '!\*/' \
| grep -v '//-' \
> README.md
