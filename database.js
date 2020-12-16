const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  database: 'todo',
  password: '1234'
})
pool.connect()
function requestDb (text, response, responseValue) {
  console.log(text)
  return new Promise((resolve, reject) => {
    pool.query(text,
      (error, result) => {
        if (error) {
          response.status(500)
          throw error
        } else {
          /* if(responseValue === 'result.rows')
            data = result.rows
          else if(responseValue === 'result.rows[0]')
            data = result.rows[0]
          else
            data = responseValue */
          const data = typeof responseValue === 'string' ? eval(responseValue) : responseValue
          response.status(200).send(data)
        }
      })
  })
}

const getLists = (request, response) => {
  const query = 'SELECT * FROM lists ORDER BY id ASC'
  return requestDb(query, response, 'result.rows')
}

const getListById = (request, response) => {
  const id = request.params.id
  const query = `SELECT * FROM lists WHERE id =${id}`
  requestDb(query, response, 'result.rows[0]')
}

const createList = (request, response) => {
  const { name } = request.body
  const query = `INSERT INTO lists (name) VALUES ('${name}') RETURNING *`
  requestDb(query, response, 'result.rows[0]')
}

const updateList = (request, response) => {
  const { id, key, value } = request.body
  const query = `UPDATE lists SET ${key} = '${value}' where id = ${id}`
  requestDb(query, response, { message: `List ${id} modified` })
}

/* const deleteList = (request, response) => {
  const id = request.body.id
  const query = `DELETE FROM lists WHERE id = ${id}`
  requestDb(query, response, { message: `List ${id} Deleted` })
} */
const deleteLists = (request, response) => {
  const ids = request.body.ids
  const query = `DELETE FROM lists WHERE id IN (${ids.join(', ')})`
  requestDb(query, response, { message: `Lists ${ids} Deleted` })
}
const getTasks = (request, response) => {
  const listId = request.params.listId
  const query = `SELECT * FROM tasks WHERE listId = ${listId} ORDER BY isComplete, priority DESC, deadline ASC`
  requestDb(query, response, 'result.rows')
}

const createTask = (request, response) => {
  const { title, listId } = request.body
  const query = `INSERT INTO tasks (title, listId) VALUES ('${title}', ${listId}) RETURNING *`
  requestDb(query, response, 'result.rows[0]')
}

const updateTask = (request, response) => {
  const { id, key, value } = request.body
  const query = `UPDATE tasks SET ${key} = '${value}' where id = ${id}`
  requestDb(query, response, { message: `Task ${id} modified` })
}

const deleteTask = (request, response) => {
  const id = request.body.id
  const query = `DELETE FROM tasks WHERE id = ${id}`
  requestDb(query, response, { message: `Task ${id} deleted` })
}

const clearCompleted = (request, response) => {
  const listId = request.body.listId
  let query = `DELETE FROM tasks WHERE isComplete = true`
  if(listId) query+= ` AND listId = ${listId}`
  requestDb(query, response, { message: `Completed Tasks Cleared` })
}

/*
const getTodayTasks = (request, response) => {
  try {
    pool.query(
      'SELECT * FROM tasks WHERE deadline != false ORDER BY isComplete, priority DESC, deadline ASC',
      (error, results) => {
        if (error) throw error
        response.status(200).send(results.rows)
      }
    )
  } catch (e) {
    response.status(500).send(['unable to fetch tasks'])
  }
}

const getScheduledTasks = (request, response) => {
  try {
    pool.query(
      'SELECT * FROM tasks WHERE deadline!=\'false\' ORDER BY isComplete, priority DESC, deadline ASC',
      (error, results) => {
        if (error) throw error
        response.status(200).send(results.rows)
      }
    )
  } catch (e) {
    response.status(500).send(['unable to fetch tasks'])
  }
} */

module.exports = {
  getLists,
  getListById,
  createList,
  updateList,
  // deleteList,
  deleteLists,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  clearCompleted
  // getTodayTasks,
  // getScheduledTasks,
}
