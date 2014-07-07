#!/bin/bash

BASE_DIR=$(dirname $0)

if [ $# -ne 1 ];
then
    echo "Usage: ./release.sh <version-number | major | minor | patch | build>"
    exit 1
fi

# Clean the working tree
git reset --hard
git checkout master

echo "-- Building distribution files"
$BASE_DIR/node_modules/.bin/plumber build

echo "-- Copying distribution files to dist branch"
git checkout dist
git fetch
git reset --hard origin/dist
yes | cp ./build/* .

git diff --name-only  | if (grep "\.js$" | grep -v "\.min\.js$")
then
    echo "-- Commiting update to distribution files"
    git add --update .
    git commit --message "Update distribution files"
    MVERSION_PATH="$BASE_DIR/node_modules/.bin/mversion"
    echo "-- Current version: `$MVERSION_PATH`"
    echo "-- Updating version"
    $MVERSION_PATH $1 -m "v%s

[ci skip]"
    echo "-- Check the commit worked and then push (dist branch and new tag)"
else
    echo "-- No updates to be committed"
    # Clean the working tree
    git reset --hard
fi

git checkout master
