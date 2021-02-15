require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
const Person = require('./models/person')
app.use(cors())
app.use(express.static('build'))

morgan.token('details', function getDetails(req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :details'))
app.use(express.json())


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)
app.use(express.json())

const PORT = process.env.PORT || 3001

const randomValue = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    const peopleCount = persons.length
    const line1 = `<p>Phonebook has info for ${peopleCount} people</p>`
    const line2 = `${Date(Date.now())}`
    console.log(line1)
    res.send(line1.concat(line2))
})


app.get('/api/persons', (req, res, next) => {
    Person.find().then(persons => {
        res.json(persons)
    })
        .catch(error => {
            next(error)
            console.log(error)
            response.status(400).send({ error: 'could not get persons list from api' })
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => {
            next(error)
            console.log(error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

const generateId = () => {
    // const maxId = persons.length > 0
    //     ? Math.max(...persons.map(n => n.id))
    //     : 0
    // return maxId + 1
    return randomValue(0, 99999999)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => {
            next(error)
            console.log(error)
            if (!body.name) {
                response.status(400).send({ error: 'missing name' })
            }
            if (!body.number) {
                response.status(400).send({ error: 'missing number' })
            }
            if (persons.find(person => person.name === body.name)) {
                response.status(400).send({ error: 'name must be unique' })
            }
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    console.log("hei ", request.params.id)
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true }, next)
        .then(updatedPerson => {
            console.log('body', body)
            console.log('updatedPerson ', updatedPerson)
            response.json(updatedPerson)
        })
        .catch(error => {
            next(error)
            console.log(error)
            response.status(400).send({ error: 'failed to update person' })
        })
})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            next(error)
            console.log(error)
            response.status(400).send({ error: 'failed to delete person' })
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})