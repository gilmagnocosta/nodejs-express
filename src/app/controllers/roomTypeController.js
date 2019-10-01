const express = require('express');

const authMiddleware = require('../middleware/auth');

const RoomType = require('../models/roomType');
const User = require('../models/user');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    const roomTypes = await RoomType.find().populate('createdBy');
    
    res.send({ roomTypes });
});

router.get('/:id', async (req, res) => {
    const roomType = await RoomType.findById(req.params.id).populate('createdBy');
    
    if (!roomType)
        return res.status(400).send({ error: 'Room type not found'});

    res.send({ roomType });
});

router.post('/', async (req, res) => {
    try {
        
        const roomType = await RoomType.create({ ...req.body, createdBy: req.userId });

        return res.send({ roomType });
    } catch (err) {
        return res.status(400).send({ error: 'Error on creating request'})
    }
});

router.put('/:id', async (req, res) => {
    try {
        
        const { name, description } = req.body;

        const roomType = await RoomType.findByIdAndUpdate(req.params.id, 
            { name, description }, 
            { new: true });

        return res.send({ roomType });
    } catch (err) {
        return res.status(400).send({ error: 'Error on creating request'})
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const roomType = await RoomType.findByIdAndRemove(req.params.id);
        
        if (!roomType)
            return res.status(400).send({ error: 'Room type not found'});

        res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Error on deleting'});
    }
});


module.exports = app => app.use('/roomType', router);