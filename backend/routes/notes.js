const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator"); // express-validator is use for validate incomming string
const nodemon = require("nodemon");

//ROUTE 1 : get all the notes using : GET "api/notes/fetchallnotes" Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 2 : add a new note using : POST "api/notes/addnote" Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 charachter").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    try {
      // If there are errors return bad request and the errors
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // creating a new note
      let note = await Note.create({
        title,
        description,
        tag,
        user: req.user.id,
      });
      res.send(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 3 : Update an existing note using : PUT "api/notes/updatenote" Login Required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    // Create a newnote
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find a note to be updated and update it
    let note = await Note.findById(req.params.id);
    //  If note is not exists
    if (!note) {
      return res.status(404).send("not Found");
    }
    // If Note is not of logged in user
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 4 : Delete an existing note using : DELETE "api/notes/deletenote" Login Required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // find the note
    let note = await Note.findById(req.params.id);

    // if note is note their
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // if note is not of the logged in user
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({
      Success: "Note has been deleted",
      note: note,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
