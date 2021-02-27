#!/bin/bash

function update() {
    git pull

  VERSION=$(node -pe "require('./package.json').name.concat(':').concat(require('./package.json').version)")
  echo $VERSION

  npm run docker:generate
  docker rm -f smarthome
  docker run -d --name smarthome -e PORT=3010 -e LIFX_TOKEN=$LIFX_TOKEN --network host --restart=unless-stopped smarthome-api:$VERSION
}

update &> update-output.txt
