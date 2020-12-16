import { createItem, removeItem, getDate, formatDate, expandPanel, properties, priorityColor } from './util.js'
import { getList, getTasks, addTask, updateTask, deleteTask, clearCompletedTasks } from './app.js'

function setDeadline (day, task) {
  const date = getDate(day)
  day.form.deadline.value = task.deadline = date
  renderTask(day.form.deadline, task)
}
function fillData (form, task) {
  Object.entries(properties).forEach(([key, value]) => form[key][value] = task[key])
  if (task.isComplete) {
    form.isComplete.checked = true
    form.classList.add('complete')
    if (!completedVisible) form.classList.add('hidden')
    form.title.style = 'text-decoration: line-through'
  } else {
    form.classList.remove('complete')
    form.title.style.removeProperty('text-decoration')
  }
  form.style = `border-left: solid ${priorityColor[task.priority]}`
  form.querySelector('.detail').innerHTML = formatDate(task.deadline)
}
function renderTask (changedItem, task) {
  const value = changedItem[properties[changedItem.name]]
  task[changedItem.name] = value
  updateTask(task.id, changedItem.name, value).then(res => {
    console.log(res.message)
    fillData(changedItem.form, task)
  })
}
function removeTask (id) {
  deleteTask(id).then(res => {
    console.log(res.message)
    removeItem(`task${id}`)
  })
}
function createTask (task, listId) {
  const menu = createItem('div', { className: 'icon' }, createItem('img', { className: 'small', src: './images/menu.png' }))
  const checkbox = createItem('input', {
    className: 'icon',
    type: 'checkbox',
    name: 'isComplete',
    onchange: (e) => {
      completedCount += e.target.checked ? 1 : -1
      toggleFooterVisibility()
    },
    onclick: (e) => e.stopPropagation()
  })
  const title = createItem('input', { className: 'text', name: 'title' })
  const date = createItem('span', { className: 'detail light', name: 'date' })
  const expand = createItem('div', { className: 'icon expand', name: 'expand' }, createItem('img', { src: './images/down.png' }))

  const notes = createItem('fieldset', { className: 'notes' },
    createItem('legend', {}, 'Notes'),
    createItem('textarea', { className: 'spaced bordered', name: 'notes' }))
  const deadline = createItem('fieldset', { className: 'deadline' },
    createItem('legend', {}, 'Due Date'),
    createItem('div', { className: 'date-menu bordered' },
      createItem('input', {
        type: 'button',
        style: 'border-radius: 4px 0 0 4px;',
        value: 'today',
        onclick: (e) => setDeadline(e.target, task, listId)
      }),
      createItem('input', { type: 'button', value: 'tomorrow', onclick: (e) => setDeadline(e.target, task, listId) }),
      createItem('input', { type: 'date', style: 'border-radius: 0 4px 4px 0', name: 'deadline' })))
  const priority = createItem('fieldset', { className: 'priority' },
    createItem('legend', {}, 'Priority'),
    createItem('select', { className: 'bordered spaced', name: 'priority' },
      createItem('option', { value: 'none' }, 'None'),
      createItem('option', { value: 'low' }, 'Low'),
      createItem('option', { value: 'medium' }, 'Medium'),
      createItem('option', { value: 'high' }, 'High')))
  const deleteButton = createItem('button', {
    type: 'button',
    id: task.id,
    className: 'deleteButton bordered',
    onclick: (e) => {
      removeTask(task.id)
      alert(`Task "${task.title}" Deleted`)
    }
  }, 'Delete')
  const form = createItem('form', {
    id: `task${task.id}`,
    className: 'spaced bordered task-container',
    onchange: (e) => renderTask(e.target, task),
    onsubmit: (e) => e.preventDefault()
  },
  createItem('div', { className: 'title-bar spaced', onclick: expandPanel }, menu, checkbox, title, date, expand),
  createItem('div', { className: 'panel' }, notes, deadline, priority, deleteButton))

  fillData(form, task)
  return form
}
function toggleFooterVisibility () {
  completedCount ? footer.classList.remove('hidden') : footer.classList.add('hidden')
  document.getElementById('completedCount').innerHTML = completedCount
}
function clearCompleted (listId) {
  if(confirm(`Clear Completed Tasks in List "${list.name}"?`)) {
    const tasks = document.querySelectorAll('form.complete')
    clearCompletedTasks(listId).then(res => {
      console.log(res.message)
      tasks.forEach(task => removeItem(task.parentNode.id))
    })
    completedCount = 0
    completedVisible = false
    toggleFooterVisibility()
    alert("Completed Tasks in this list deleted!")
  }
}

const footer = document.querySelector('footer')
let completedCount = 0; let completedVisible = false

function loadList (list) {
  document.getElementsByTagName('title')[0].appendChild(document.createTextNode(list.name))
  document.getElementById('list-name').appendChild(document.createTextNode(list.name))
  document.getElementById('location').appendChild(document.createTextNode(list.location))
  document.getElementById('clearCompletedButton').addEventListener('click', () => clearCompleted(list.id))

  const colorPicker = document.querySelector('nav>input[type=color]')
  colorPicker.addEventListener('change', (e) => {
    document.body.style.backgroundColor = e.target.value
    updateList(list.id, 'color', e.target.value)
  })
  colorPicker.value = document.body.style.backgroundColor = list.color

  const ul = document.getElementById('list')
  getTasks(list.id).then(tasks => {
    tasks.forEach(task => {
      if (task.isComplete) completedCount++
      ul.appendChild(document.createElement('li').appendChild(createTask(task, list.id)))
    })
  })
  document.querySelector('.doneButton').addEventListener('click', () => {
    document.querySelectorAll('form.complete').forEach(form => form.classList.toggle('hidden'))
    completedVisible = true
  })
  toggleFooterVisibility()
}
document.body.onkeyup = function (e) {
  if (e.key == 'Enter') {
    const input = document.getElementById('input-text')
    if (input.value) {
      const task = createTask(addTask(input.value, currentList), currentList)
      document.getElementById('list').appendChild(document.createElement('li').appendChild(task))
    }
    input.value = ''
  }
}

const currentList = decodeURI(window.location.href.split('/')[3])
getList(currentList).then(list => {
  list ? loadList(list) : location.href = '/'
})