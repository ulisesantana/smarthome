db.createUser({
  user: 'smarthome',
  pwd: 'smarthome',
  roles: [{ role: 'readWrite', db: 'smarthome-test' }]
})
db.createCollection('lights')
db.createCollection('rooms')
db.createCollection('scenes')
db.createCollection('automations')