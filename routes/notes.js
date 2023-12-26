const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { route } = require('./auth');
const router = require('./auth');
router.get('/fetchallnotes', fetchUser, async (req, res) => {
	try {
		const notes = await Notes.find({ user: req.user.id });
		res.json(notes);
	} catch (error) {
		res.status(500).send('Internal server error');
	}
});
router.get('/fetchcompletednotes', fetchUser, async (req, res) => {
	try {
		const completeNotes =  await Notes.find({ 'isCompleted': true })
		res.json(completeNotes);
		
	} catch (error) {
		res.status(500).send('Internal server error');
	}
});
router.post('/addnote', fetchUser, [
	body('title', 'Enter a valid title').isLength({ min: 4 }),
	body('description', 'Description must be atleast 8 characters long').isLength({ min: 8 })
], async (req, res) => {
	try {
		const { title, description, tag } = req.body;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const note = new Notes({
			title, description, tag, user: req.user.id
		})
		const savedNote = await note.save()
		res.json(savedNote)
	} catch (error) {
		res.status(500).send('Internal server error');
	}
});
router.put('/updatenote/:id', fetchUser, async (req, res) => {
	try {
		const { title, description, tag } = req.body;
		const newNote = {};
		if (title) { newNote.title = title };
		if (description) { newNote.description = description };
		if (tag) { newNote.tag = tag };
		let note = await Notes.findById(req.params.id);
		if (!note) {
			return res.status(404).send("Not found");
		}
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not allowed");
		}
		note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
		res.json({ note });
	} catch (error) {
		res.status(500).send('Internal server error');
	}
});
router.post('/completenote/:id', fetchUser, async (req, res) => {
	try {
		const note = await Notes.findByIdAndUpdate({ _id: req.params.id }, [
			{
				$set: {
					isCompleted: true
				}
			}
		]);
		if (!note) {
			res.status(404).send("Not found");
		}
		if (note.user.toString() !== req.user.id) {
			res.status(401).send("Not allowed");
		}
		if (note) {
			res.send({ note });
		}
	} catch (error) {
		res.status(500).send('Internal server error');
	}

})
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
	try {
		let note = await Notes.findById(req.params.id);
		if (!note) {
			res.status(404).send("Not found");
		}
		if (note.user.toString() !== req.user.id) {
			res.status(401).send("Not allowed");
		}
		note = await Notes.findByIdAndDelete(req.params.id);
		res.send("Success! note has been deleted");
	} catch (error) {
		res.status(500).send('Internal server error');
	}
})
module.exports = router