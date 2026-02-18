import prisma from '../config/db.js';

export const getBooks = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword
            ? {
                OR: [
                    { title: { contains: req.query.keyword, mode: 'insensitive' } },
                    { author: { contains: req.query.keyword, mode: 'insensitive' } },
                ],
            }
            : {};

        const categoryFilter = req.query.category
            ? { category: { name: req.query.category } }
            : {};

        const count = await prisma.book.count({
            where: { ...keyword, ...categoryFilter },
        });

        const books = await prisma.book.findMany({
            where: { ...keyword, ...categoryFilter },
            skip: pageSize * (page - 1),
            take: pageSize,
            include: { category: true },
        });

        res.json({ books, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { category: true },
        });

        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (book) {
            await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
            res.json({ message: 'Book removed' });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createBook = async (req, res) => {
    try {
        const { title, author, description, price, stock, image_url, category_id } = req.body;
        const book = await prisma.book.create({
            data: {
                title,
                author,
                description,
                price,
                stock,
                image_url,
                category_id,
            },
        });
        res.status(201).json(book);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const updateBook = async (req, res) => {
    try {
        const { title, author, description, price, stock, image_url, category_id } = req.body;
        const book = await prisma.book.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (book) {
            const updatedBook = await prisma.book.update({
                where: { id: parseInt(req.params.id) },
                data: {
                    title,
                    author,
                    description,
                    price,
                    stock,
                    image_url,
                    category_id,
                },
            });
            res.json(updatedBook);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
