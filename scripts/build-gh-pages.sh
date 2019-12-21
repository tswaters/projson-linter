#!/bin/bash
set -e

git --work-tree "dist" checkout --orphan gh-pages
git --work-tree "dist" add --all
git --work-tree "dist" commit -m "Creating deploy"
git push origin gh-pages
