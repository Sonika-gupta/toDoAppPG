/* eslint eqeqeq: "off" */

async function fetch (route, data, method = 'GET') {
  console.log('requesting', route, data, method)
  const res = await window
    .fetch('http://localhost:3000/' + route, {
      method,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  console.log(res)
  const value = await res.json()
  console.log(value)
  if (value.error) throw Error(value.error)
  return value
}

function getLists () {
  return fetch('lists')
}
function getList (id) {
  return fetch(`list${id}`)
}
function newList (name) {
  return fetch('list', { name }, 'POST')
}
function updateList (id, key, value) {
  return fetch('list', { id, key, value }, 'PUT')
}
function deleteLists (ids) {
  return fetch('lists', { ids }, 'DELETE')
}
function getTasks (listId) {
  return fetch(`tasks${listId}`)
}
function getScheduledTasks () {
  return fetch('scheduled')
}
function addTask (title, listId, deadline = null) {
  return fetch('task', { title, listId, deadline }, 'POST')
}
function updateTask (id, key, value) {
  return fetch('task', { id, key, value }, 'PUT')
}
function deleteTask (id) {
  return fetch('task', { id }, 'DELETE')
}
function clearCompletedTasks (listId) {
  return fetch('/clear', { listId }, 'DELETE')
}

export {
  getLists,
  getList,
  newList,
  updateList,
  deleteLists,
  getTasks,
  getScheduledTasks,
  addTask,
  deleteTask,
  updateTask,
  clearCompletedTasks
}
