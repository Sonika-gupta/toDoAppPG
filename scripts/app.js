/* eslint eqeqeq: "off" */

async function request (route, data, method = 'GET') {
  console.log('requesting', route, data, method)
  const value = await window.fetch('http://localhost:3000/' + route, {
    method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
  if (value.error) throw Error(value)
  return value
}

function getLists () {
  return request('lists')
}
function getList (id) {
  return request(`list${id}`)
}
function newList (name) {
  return request('list', { name }, 'POST')
}
function updateList (id, key, value) {
  return request('list', { id, key, value }, 'PUT')
}
function deleteLists (ids) {
  return request('lists', { ids }, 'DELETE')
}
function getTasks (listId) {
  return request(`tasks${listId}`)
}
function addTask (title, listId) {
  return request('task', { title, listId }, 'POST')
}
function updateTask (id, key, value) {
  return request('task', {id, key, value}, 'PUT')
}
function deleteTask (id) {
  return request('task', {id}, 'DELETE')
}
function clearCompletedTasks(id) {
  return request('/clear', {id}, 'DELETE')
}

export {
  getLists,
  getList,
  newList,
  updateList,
  deleteLists,
  getTasks,
  addTask,
  deleteTask,
  updateTask,
  clearCompletedTasks
}
