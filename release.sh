#!/bin/bash

if [ $# -ne 1 ];
then
    echo "Missing version argument"
    exit 1
fi

# Clean the working tree
git reset --hard
git checkout master

echo "-- Building distribution files"
plumber build

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
    MVERSION_PATH="mversion"
    echo "-- Current version: `$MVERSION_PATH`"
    echo "-- Updating version"
    $MVERSION_PATH $1 -m "v%s

[ci skip]"
    echo "-- Check the commit worked and then push (dist branch and new tag)"
else
    echo "-- No updates to be committed"
fi

git checkout master
