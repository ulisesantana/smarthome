#!/bin/bash

function update() {
  export $(egrep -v '^#' .env | xargs)
  pwd
  date
  git pull

  PACKAGE_NAME="$(grep -m1 name package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')"
  VERSION="$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')"
  DOCKER_IMAGE=$PACKAGE_NAME:$VERSION
  echo $DOCKER_IMAGE
  echo $LIFX_TOKEN

  docker build -t $DOCKER_IMAGE .
  docker rm -f smarthome
  docker run -d --name smarthome -e PORT=3010 -e LIFX_TOKEN=$($LIFX_TOKEN) --network host --restart=unless-stopped $DOCKER_IMAGE
}

update &>update-output.txt
