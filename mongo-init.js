db.createUser({
  user: 'smarthome',
  pwd: 'smarthome',
  roles: [{ role: 'readWrite', db: 'smarthome' }]
})
db.createCollection('devices')
db.createCollection('rooms')
db.createCollection('scenes')
db.createCollection('automations')
