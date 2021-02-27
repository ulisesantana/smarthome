#!/bin/bash

function update() {
  whoami
  pwd
  date
  git pull

  VERSION=$(/home/ulises/.nvm/versions/node/v14.15.3/bin/node -pe "require('./package.json').name.concat(':').concat(require('./package.json').version)")
  echo $VERSION

  /home/ulises/.nvm/versions/node/v14.15.3/bin/npm run docker:generate
  docker rm -f smarthome
  docker run -d --name smarthome -e PORT=3010 -e LIFX_TOKEN=$LIFX_TOKEN --network host --restart=unless-stopped $VERSION
}

update &>update-output.txt
