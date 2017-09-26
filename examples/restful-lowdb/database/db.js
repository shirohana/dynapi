import { existsSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import low from 'lowdb/lib/fp'
import FileSync from 'lowdb/adapters/FileSync'

const dbFile = join(__dirname, '../db.json')
const defaultValue = {
  posts: [],
  comments: [],
  albums: [],
  photos: [],
  users: [],
  todos: []
}

const dbFileExists = existsSync(dbFile)

const adapter = new FileSync(dbFile, { defaultValue })
const db = low(adapter)

// Fetch fake data from https://jsonplaceholder.typicode.com/
if (!dbFileExists) {
  console.log('> Fetching fake data from https://jsonplaceholder.typicode.com...')

  axios.get('https://jsonplaceholder.typicode.com/db')
  .then(({ data }) => {
    db.setState(data).write()
    console.log('> Fetch succeed')
  })
  .catch(err => {
    console.error(err.stack)
  })
}

export default db
