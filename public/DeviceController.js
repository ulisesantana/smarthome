const apiPrefix = '/api/lights'
function getDevices () {
  return fetch(apiPrefix, {
    method: 'GET'
  }).then(response => response.json())
}

function toggleBedroom () {
  return fetch(apiPrefix + '/toggle/bedroom', {
    method: 'PATCH'
  }).then(response => response.json())
}

function toggleDayScene () {
  return fetch(apiPrefix + '/toggle/scene/day', {
    method: 'PATCH'
  }).then(response => response.json())
}

function toggleNightScene () {
  return fetch(apiPrefix + '/toggle/scene/night', {
    method: 'PATCH'
  }).then(response => response.json())
}

function toggleMovieScene () {
  return fetch(apiPrefix + '/toggle/scene/movie', {
    method: 'PATCH'
  }).then(response => response.json())
}

function toggleRelaxScene () {
  return fetch(apiPrefix + '/toggle/scene/relax', {
    method: 'PATCH'
  }).then(response => response.json())
}

function toggleOffice () {
  return fetch(apiPrefix + '/toggle/office', {
    method: 'PATCH'
  }).then(response => response.json())
}

function toggleDeviceById (id) {
  return fetch(apiPrefix + '/toggle/' + id, {
    method: 'PATCH'
  }).then(response => response.json())
}

export const DeviceController = {
  getDevices,
  toggleDayScene,
  toggleBedroom,
  toggleOffice,
  toggleRelaxScene,
  toggleDeviceById,
  toggleMovieScene,
  toggleNightScene
}
