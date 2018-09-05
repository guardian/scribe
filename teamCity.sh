#!/usr/bin/env bash

NODE_VERSION="5"

# check if nvm is available or not
nvm_available() {
  type -t nvm > /dev/null
}

# source NVM from known locations (it's not a binary so not on the path)
source_nvm() {
  if ! nvm_available; then
    [ -e "/usr/local/opt/nvm/nvm.sh" ] && source /usr/local/opt/nvm/nvm.sh
  fi
  if ! nvm_available; then
    [ -e "$HOME/.nvm/nvm.sh" ] && source $HOME/.nvm/nvm.sh
  fi
}

# do the client side build
source_nvm
nvm_available && nvm install ${NODE_VERSION} && nvm use ${NODE_VERSION}

npm install -g bower
bower install
./setup.sh

npm install
npm test
