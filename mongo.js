const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
    `mongodb+srv://fullstack:${password}@fullstack.fn8qh.mongodb.net/person-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name === undefined || number === undefined) {
    Person.find().then(persons => {
        console.log('phonebook:')
        persons.forEach(element => {
            console.log(element['name'], element['number'])
        })
    })
} else {
    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(response => {
        const msg = `added ${person.name} number ${person.number} to phonebook`
        console.log(msg)

    })
}

mongoose.connection.close()
process.exit()