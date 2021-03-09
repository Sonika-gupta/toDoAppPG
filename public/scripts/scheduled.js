import { createItem, removeItem, removeTask, expandPanel, getDate, isDeadlineToday, properties, priorityColor } from './util.js'
import { getScheduledTasks, addTask, updateTask, clearCompletedTasks } from './fetch.js'

function moveTask (form, task) {
  form.parentNode.removeChild(form)
  if (isDeadlineToday(task)) {
    today.appendChild(document.createElement('li').appendChild(form))
  } else if (task.deadline) {
    scheduled.appendChild(document.createElement('li').appendChild(form))
  }
}

function setDeadline (day, task) {
  const date = getDate(day)
  day.form.deadline.value = task.deadline = date
  renderTask(day.form.deadline, task)
}

function renderTask (changedItem, task) {
  const value = changedItem[properties[changedItem.name]]
  task[changedItem.name] = value
  updateTask(task.id, changedItem.name, value).then(res => {
    console.log(res.message)
    fillData(changedItem.form, task)
    moveTask(changedItem.form, task)
  })
}

function fillData (form, task) {
  Object.entries(properties).forEach(([key, value]) => (form[key][value] = task[key]))
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
}

function createTask (task, list) {
  const checkbox = createItem('input', {
    className: 'icon',
    type: 'checkbox',
    name: 'isComplete',
    onclick: (e) => e.stopPropagation()
  })
  const title = createItem('input', { className: 'text', name: 'title' })
  const listName = createItem('span', { className: 'detail light', name: 'list' }, list.name)
  const expand = createItem('div', { className: 'icon expand', name: 'expand' }, createItem('i', { className: 'fa fa-sort-down' }))

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
        onclick: (e) => setDeadline(e.target, task)
      }),
      createItem('input', { type: 'button', value: 'tomorrow', onclick: (e) => setDeadline(e.target, task) }),
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
    className: 'deleteButton bordered',
    onclick: () => removeTask(task.id, `Task "${task.title}" from "${list.name}" Deleted`)
  }, 'Delete')
  const form = createItem('form', {
    id: `task${task.id}`,
    className: 'spaced bordered task-container',
    onchange: (e) => renderTask(e.target, task),
    onsubmit: (e) => e.preventDefault()
  },
  createItem('div', { className: 'title-bar spaced', onclick: expandPanel }, checkbox, title, listName, expand),
  createItem('div', { className: 'panel' }, notes, deadline, priority, deleteButton))

  fillData(form, task)
  return form
}

function clearCompleted () {
  if (confirm('Clear Completed Tasks all lists?')) {
    const tasks = document.querySelectorAll('form.complete')
    clearCompletedTasks().then(res => {
      console.log(res.message)
      tasks.forEach(task => removeItem(task.parentNode.id))
    })
    completedCount = 0
    completedVisible = false
    toggleFooterVisibility()
    alert('All Completed Tasks deleted!')
  }
}

function toggleFooterVisibility () {
  completedCountToday = document.querySelectorAll('#today form.complete').length
  completedCountScheduled = completedCountToday + document.querySelectorAll('#scheduled form.complete').length
  completedCountScheduled ? scheduledFooter.classList.remove('hidden') : scheduledFooter.classList.add('hidden')
  completedCountToday ? todayFooter.classList.remove('hidden') : todayFooter.classList.add('hidden')
  document.getElementById('completedCountScheduled').innerHTML = completedCountScheduled
  document.getElementById('completedCountToday').innerHTML = completedCountToday
}

function listOptions (lists) {
  return Object.values(lists).map(list => {
    return createItem('option', { style: `background-color: ${list.color}`, value: list.id }, list.name)
  })
}

function updateCount () {
  todayCount = document.querySelectorAll('#today form').length
  console.log(todayCount)
  if (todayCount) {
    document.querySelector('span.scheduled').classList.remove('hidden')
    document.getElementById('todayCount').innerHTML = `(${todayCount})`
  } else {
    document.querySelector('span.scheduled').classList.add('hidden')
  }

  scheduledCount = todayCount + document.querySelectorAll('#scheduled form').length

  if (scheduledCount) document.getElementById('scheduledCount').innerHTML = `(${scheduledCount})`
  if (scheduledCount === todayCount) {
    document.querySelector('span.scheduled:last-of-type').classList.add('hidden')
  } else {
    document.querySelector('span.scheduled:last-of-type').classList.remove('hidden')
  }
  console.log(scheduledCount)
}
const scheduled = document.getElementById('scheduled')
const today = document.getElementById('today')
const scheduledFooter = document.getElementById('scheduledFooter')
const todayFooter = document.getElementById('todayFooter')
let scheduledCount = 0; let todayCount = 0; let completedCountScheduled = 0; let completedCountToday = 0; let completedVisible = false

function loadOtherTabs (lists) {
  document.getElementById('clearCompletedButton').addEventListener('click', () => clearCompleted())
  getScheduledTasks().then(tasks => {
    tasks.forEach(task => {
      console.log(task.deadline)
      const list = lists.find(list => list.id === task.listid)
      if (task.isComplete) {
        completedCountScheduled++
        if (isDeadlineToday(task)) completedCountToday++
      }
      if (isDeadlineToday(task)) {
        today.appendChild(document.createElement('li').appendChild(createTask(task, list)))
      } else {
        scheduled.appendChild(document.createElement('li').appendChild(createTask(task, list)))
      }
    })
    updateCount()
    toggleFooterVisibility()
    document.body.onkeyup = function (e) {
      if (e.key == 'Enter') {
        const input = document.getElementById('input-text')
        const listId = document.getElementById('listId')
        console.log(listId)
        if (input.value) {
          const task = createTask(addTask(input.value, listId.value, getDate('today')), { name: listId.options[listId.selectedIndex].text })
          scheduled.appendChild(document.createElement('li').appendChild(task))
          today.appendChild(document.createElement('li').appendChild(task))
          updateCount()
        }
        input.value = ''
      }
    }
  })
  const newTask = createItem('div', { className: 'bordered', id: 'new-task' },
    createItem('div', { className: 'icon' },
      createItem('img', { src: './images/plus.svg' })),
    createItem('input', { id: 'input-text', className: 'text', placeholder: 'New Task...' }),
    createItem('select', { id: 'listId', className: 'detail' }, ...listOptions(lists)))
  document.querySelector('#otherTab > main').appendChild(newTask)

  document.querySelectorAll('.doneButton')
    .forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('form.complete').forEach(form => form.classList.toggle('hidden'))
      completedVisible = true
    }))
}

export { loadOtherTabs }
