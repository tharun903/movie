const express = require('express')

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initilizationAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initilizationAndServer()

const convertMovieObj = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorObj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
app.get('/movies/', async (request, response) => {
  const getquery = `
SELECT 
movie_name
FROM
movie;`
  const movieArray = await db.all(getquery)
  response.send(
    movieArray.map(each => {
      movieName: each.movie_name
    }),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getquery = `
    SELECT 
      * 
    FROM
      movie
    WHERE
      movie_id = ${movieId};`
  const movie = await db.get(getquery)
  response.send(convertMovieObj(movie))
})

app.post('/movies/', async (request, response) => {
  const details = request.body
  const {directorId, movieName, leadActor} = details
  const getquery = `
    INSERT INTO
      movie(director_id,movie_name,lead_actor)
    VALUES
      (${director_id},'${movieName}','${lead_actor}');`
  const moviepost = await db.run(getquery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
      movie_id = ${movieId};`
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletequery = `
    DELETE FROM
      movie
    where 
      movie_id = ${movieId};`
  await db.run(deletequery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const directorquery = `
    SELECT 
      *
    FROM
     director;`
  const directorArray = await db.all(directorquery)
  response.send(
    directorArray.map(each => {
      convertDirectorObj(each)
    }),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorquery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = '${directorId}';`
  const directorA = await db.all(directorquery)
  response.send(directorA.map(each => ({movieName: each.movie_name})))
})

module.exports = app
