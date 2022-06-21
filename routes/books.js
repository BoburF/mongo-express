const express = require('express')
const router = express.Router()
const Joi = require('joi')
const authMiddleware = require('../middleware/auth')
const Books = require('../model/Books')
const Book_Model = require('../model/Book_Mongo')

// View all books
router.get('/', async (req, res) => {
    // const books = await Books.getAll()

    const books = await Book_Model.find()

    res.render('books', {
        title: 'All books',
        books,
        isBooks: true
    })
})

router.get('/add', (req, res) => {
    res.render('formBooks', {
        title: 'Add new book',
        isBooks: true
    })
})

// Get book by id
router.get('/:id', async (req, res) => {
     const book = await Book_Model.findById(req.params.id)
            res.render('book', {
                book,
                title: book.name
            })
})

// POST request
router.post('/add', authMiddleware, async (req, res) => {
    // Baza chaqiramiz
    // let allBooks = books  // []

    // Validatsiya // hiyalaymiz
    let bookSchema = Joi.object({
        name: Joi.string().min(3).required(),
        img: Joi.string(),
        price: Joi.number().integer().required()
    })

    const result = bookSchema.validate(req.body)
    // console.log(!!result.error);  // error bor bo'lsa true yo'q bo'lsa false deydi

    if (result.error) {
        res.status(400).send(result.error.message);
        return
    }

    // const book = new Books(
    //     req.body.name,
    //     req.body.year,
    //     req.body.img
    // )

    const book = new Book_Model({
        name: req.body.name,
        price: req.body.price,
        img: req.body.img
    })

    await book.save()
    res.status(201).redirect('/api/books')
})

router.get('/update/:id', authMiddleware, async (req, res) => {
    const oldBook = await Book_Model.findById(req.params.id)

    res.render('updateBook', {
        oldBook,
        title: oldBook.name
    })
})

// Update book
router.post('/update/', authMiddleware, async (req, res) => {
    // Validatsiya // hiyalaymiz
    let bookSchema = Joi.object({
        name: Joi.string().min(3).required(),
        img: Joi.string(),
        id: Joi.string(),
        price: Joi.number().integer().required()
    })

    validateBody(req.body, bookSchema, res)

    const book = {
        name: req.body.name,
        price: req.body.price,
        img: req.body.img
    }

    await Book_Model.findByIdAndUpdate(req.body.id, book)
    res.redirect('/api/books')
})

// Remove book
router.get('/remove/:id', authMiddleware, async (req, res) => {
    const id = req.params.id
    await Book_Model.findByIdAndDelete(id)
    res.redirect('/api/books')
    
})

function validateBody(body, bookSchema, res) {
    const result = bookSchema.validate(body)
    // console.log(!!result.error);  // error bor bo'lsa true yo'q bo'lsa false deydi

    if (result.error) {
        res.status(400).send(result.error.message);
        return
    }
}

module.exports = router