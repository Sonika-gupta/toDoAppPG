const express = require('express')
const app = express()
const path = require('path')
const db = require('./model.js')
const route = path.join(__dirname, '/public')
app.use(express.static(route))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(route, '/lists.html'))
})

app.get('/lists', db.getLists)
app.get('/list:id', db.getListById)
app.post('/list', db.createList)
app.put('/list', db.updateList)
app.delete('/lists', db.deleteLists)

app.get('/tasks:listId', db.getTasks)
app.post('/task', db.createTask)
app.put('/task', db.updateTask)
app.delete('/task', db.deleteTask)

app.get('/scheduled', db.getScheduledTasks)
app.delete('/clear', db.clearCompleted)

app.get('/:location', (req, res) => {
  res.sendFile(path.join(route, '/tasks.html'))
})
app.listen(3000, () => {
  console.log('Server Listening on 3000', Date.now())
})
