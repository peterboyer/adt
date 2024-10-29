#!/usr/bin/env bash

cat ./README.ts \
| sed "s|\t|  |g" \
| sed "s|//>\$|\n\`\`\`ts|g" \
| sed "s|//<\$|\`\`\`\n|g" \
| sed "s|//hr|---|g" \
| sed "s|//+ ||g" \
| sed "s|//backtotop|<div align="right"><a href="\#api">Back to top ⤴</a></div>|g" \
| sed "s|\([a-zA-Z]\+\)_\+|\1|g" \
| sed "s|//>>> \(.\+\)|<details><summary>(<strong>Example</strong>) \1</summary>|g" \
| sed "s|//>>>+ \(.\+\)|<details open><summary>(<strong>Example</strong>) \1</summary>|g" \
| sed "s|//<<<|</details>|g" \
| grep -v '/\*!' \
| grep -v '!\*/' \
| grep -v '//-' \
| grep -v '// prettier-ignore' \
> README.md
