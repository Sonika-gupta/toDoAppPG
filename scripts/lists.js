import { createItem, removeItem } from './util.js'
import { getLists, newList, deleteLists, getTasks, updateList } from './app.js'
import { loadOtherTabs } from './scheduled.js'

async function createNewList () {
  const name = window.prompt('List Name')
  if (name) {
    const list = await newList(name)
    console.log(list)
    appendListIcon(list)
  }
}
function renameList () {
  const target = document.querySelector('.tick:not(.hidden)').parentNode
  const newName = window.prompt('New List Name: ')
  if (newName) {
    updateList(target.id.slice(4), 'name', newName).then(res => {
      console.log(res.message)
      document.querySelector(`#${target.id} > .caption`).innerHTML = newName
    })
  }
  escapeEditMode()
}
function removeLists () {
  if (window.confirm('Delete Selected Lists?')) {
    const lists = document.querySelectorAll('.tick:not(.hidden)')
    deleteLists([...lists].map(node => node.parentElement.id.slice(4))).then(res => {
      console.log(res.message)
      lists.forEach(list => removeItem(list.parentNode.id))
    })
    escapeEditMode()
  }
}
function minimap (tasks) {
  let minimap = ''
  if (tasks.length) { minimap = tasks.reduce((text, e) => (text += e.isComplete ? '' : `${e.title}\n`), '') }
  return minimap.length ? createItem('span', {}, minimap) : createItem('span', { className: 'emptylist' }, 'No tasks')
}
function selectList (listId) {
  if (!editMode) enterEditMode()
  const container = document.getElementById(`list${listId}`)
  container.selected = !container.selected
  document.querySelector(`#list${listId}>.tick`).classList.toggle('hidden')
  selectedCount += container.selected ? 1 : -1
  renameListButton.disabled = selectedCount != 1
  deleteListButton.disabled = personalList.selected || !selectedCount
  deleteListButton.disabled ? deleteListButton.classList.remove('deleteButton') : deleteListButton.classList.add('deleteButton')
}
function enterEditMode () {
  editMode = true
  document.querySelector('#main').classList.add('hidden')
  document.querySelector('#edit.menu').classList.remove('hidden')
  document.querySelector('#context.menu').classList.remove('hidden')
}
function escapeEditMode () {
  editMode = false
  document.querySelector('#main').classList.remove('hidden')
  document.querySelectorAll('.tick').forEach(node => node.classList.add('hidden'))
  document.querySelector('#edit.menu').classList.add('hidden')
  document.querySelector('#context.menu').classList.add('hidden')
  document.querySelectorAll('.list-icon-container').forEach(container => (container.selected = false))
  selectedCount = 0
}
function appendListIcon (list, tasks = []) {
  // console.log(list)
  const listIcon = createItem('div', {
    id: 'list' + list.id,
    className: 'list-icon-container',
    selected: false,
    onclick: () => {
      editMode ? selectList(list.id) : window.location.href = `/${list.id}`
    },
    oncontextmenu: (event) => {
      event.preventDefault()
      selectList(list.id)
    }
  },
  createItem('div', {
    className: 'bordered list-icon',
    style: `background-color: ${list.color}`
  }, minimap(tasks)),
  createItem('img', { className: 'tick hidden', src: './images/tick.png' }),
  createItem('div', { className: 'caption' }, list.name),
  createItem('div', { className: 'caption light' }, list.location)
  )
  document.getElementById('index').appendChild(listIcon)
}
document.body.onkeydown = function (e) {
  if (e.key === 'Escape') escapeEditMode()
}

let renameListButton; let deleteListButton; let personalList; let selectedCount = 0; let editMode = false;

(function load () {
  getLists().then(lists => {
    console.log(lists)
    document.getElementById('newListButton').addEventListener('click', createNewList)
    renameListButton = document.getElementById('renameListButton')
    renameListButton.addEventListener('click', renameList)
    deleteListButton = document.getElementById('deleteListButton')
    deleteListButton.addEventListener('click', removeLists)

    Object.values(lists).forEach((list) => {
      appendListIcon(list, getTasks(list.id))
    })
    personalList = document.getElementById('list0')
    Object.assign(window, { enterEditMode, escapeEditMode })
    loadOtherTabs(lists)
  })
}())
