#!/bin/bash
set -e

npm version minor -m "$@"
npm run build
git symbolic-ref HEAD refs/heads/gh-pages
git --work-tree "dist" reset --mixed --quiet
git --work-tree "dist" add --all
git --work-tree "dist" commit -m "$@"
git push origin gh-pages
git symbolic-ref HEAD refs/heads/master
git reset --mixed
git push origin master
git push --tags
