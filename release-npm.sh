#!/bin/bash

# Bash is really not meant to parse JSON files
# so this uses the next best thing
# Python! - which should be install on most people's computers

if [ $# -ne 1 ];
then
    echo "Usage: ./release-npm.sh <version-number>"
    exit 1
fi


NEW_VERSION=$1

git checkout master


# Call python to the JSON parsing for us - it helps to have Python installed on your system
CURR_VERSION=`cat package.json |python -c "import json; import sys; data=json.load(sys.stdin); print data['version']"`

echo "Updating from $CURR_VERSION to $NEW_VERSION"

SEARCH='"version": "'
SEARCH+=$CURR_VERSION
SEARCH+='",'

# This is painful - if anyone has a better way, please implement it
REPLACE='"version": "'
REPLACE+=$NEW_VERSION
REPLACE+='",'


# perform the replace
sed -i .bk "s/$SEARCH/$REPLACE/g" package.json
rm *.bk

COMMIT="v$NEW_VERSION"
git commit -a -m $COMMIT
git push
npm publish
