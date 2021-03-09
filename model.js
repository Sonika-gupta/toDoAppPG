const { Pool } = require('pg')
const config = require('./config')

const pool = new Pool(config.dbConnectionObj)
pool.connect()

async function poolQuery (query, values = []) {
  try {
    const result = await pool.query(query, values)
    return [null, result.rows]
  } catch (error) {
    console.log(query, values, error)
    return [error, null]
  }
}

const getLists = async (request, response) => {
  const query = 'SELECT * FROM lists ORDER BY id ASC'
  const [error, result] = await poolQuery(query)
  return result ? response.send(result) : response.send({ error })
}

const getListById = async (request, response) => {
  const query = 'SELECT * FROM lists WHERE id = $1'
  const [error, result] = await poolQuery(query, [request.params.id])
  if (error) console.log(error)

  return result ? response.send(result[0]) : response.send({ error })
}

const createList = async (request, response) => {
  const query = 'INSERT INTO lists (name) VALUES ($1) RETURNING *'
  const [error, result] = await poolQuery(query, [request.body])
  return result ? response.send(result) : response.send({ error })
}

const updateList = async (request, response) => {
  const { id, key, value } = request.body
  const query = 'UPDATE lists SET $1 = $2 where id = $3'
  const [error, result] = await poolQuery(query, [key, value, id])
  return result ? response.send(result[0]) : response.send({ error })
}

const deleteLists = async (request, response) => {
  const query = 'DELETE FROM lists WHERE id IN ($1)'
  const [error, result] = await poolQuery(query, [request.body.ids])
  return result ? response.send(result) : response.send({ error })
}

const getTasks = async (request, response) => {
  const query = 'SELECT * FROM tasks WHERE listId = $1 ORDER BY isComplete, priority DESC, deadline ASC'
  const [error, result] = await poolQuery(query, [request.params.listId])
  return result ? response.send(result) : response.send({ error })
}

const getScheduledTasks = async (request, response) => {
  const query =
    'SELECT * FROM tasks WHERE deadline IS NOT NULL ORDER BY isComplete, priority DESC, deadline ASC'
  const [error, result] = await poolQuery(query)
  return result ? response.send(result) : response.send({ error })
}

const createTask = async (request, response) => {
  const { title, listId, deadline } = request.body
  const query = 'INSERT INTO tasks (title, listId, deadline) VALUES ($1, $2, to_date($3, \'dd-mm-yyyy\')) RETURNING *'
  const [error, result] = await poolQuery(query, [title, listId, deadline])
  return result ? response.send(result[0]) : response.send({ error })
}

const updateTask = async (request, response) => {
  const { id, key, value } = request.body
  const query = `UPDATE tasks SET ${key} = $1 where id = $2 RETURNING *`
  const [error, result] = await poolQuery(query, [value, id])
  return result ? response.send(result[0]) : response.send({ error })
}

const deleteTask = async (request, response) => {
  const query = 'DELETE FROM tasks WHERE id = $1'
  const [error, result] = await poolQuery(query, [request.params.id])
  return result ? response.send(result) : response.send({ error })
}

const clearCompleted = async (request, response) => {
  let query = 'DELETE FROM tasks WHERE isComplete = true'
  if (request.body.listId) query += ' AND listId = $1'
  const [error, result] = await poolQuery(query, [request.body.listId])
  return result ? response.send(result) : response.send({ error })
}

module.exports = {
  getLists,
  getListById,
  createList,
  updateList,
  deleteLists,
  getTasks,
  getScheduledTasks,
  createTask,
  updateTask,
  deleteTask,
  clearCompleted
}
