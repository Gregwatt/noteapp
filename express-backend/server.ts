// packages
import express, { Express, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import mongoose, { model, Schema, Model, Document, Error } from 'mongoose';
import Note from './note.model';
import { v4 as uuid } from 'uuid';

// Server stuff
const app: Express = express();
const port = process.env.PORT;
const db_loc = process.env.DBLOC || 'localhost';
console.log(db_loc);

// Express stuff
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

// API endpoints
app.get("/api/note", async (req, res) => { // retrieve all notes
    let result = await Note.find();
    res.json(result);
});

app.post("/api/note", async (req, res) => { // add new note
    console.log(req.body.title);
    console.log(req.body.body);
    console.log(req.body.color);

    let newNote = new Note({
        id: uuid(),
        title: req.body.title,
        body: req.body.body,
        color: req.body.color,
        updated: Date.now()
    })

    try {
        await newNote.save();
        res.sendStatus(200);
    } catch (e) {
        console.log((e as Error).message);
        res.sendStatus(400);
    }
});

app.get("/api/note/:id", async (req, res) => { // get note by id
    let result = await Note.find({id: req.params.id});
    if (result.length > 0) { // found a note
        res.json(result[0]);
    } else { // no note found
        res.sendStatus(400);
    }
});

app.put("/api/note/:id", (req, res) => { // update specific note by id
    Note.updateOne(
        { id: req.params.id },
        { $set: { 
            title: req.body.title, 
            body: req.body.body, 
            color: req.body.color,
            updated: Date.now() 
        } },
    )
    .then(async (result) => {
        let updatedNote = await Note.find({ id: req.params.id });
        res.json(updatedNote[0]);
    })
    .catch((e) => {
        console.log(e);
        res.sendStatus(400);
    })
});

app.delete("/api/note/:id", (req, res) => { // delete specific note by id
    Note.deleteOne({ id: req.params.id })
        .then(() => {
            console.log(`deleted document id: ${req.params.id}`);
            res.sendStatus(200);
        })
        .catch((e) => {
            console.log(e)
            res.sendStatus(400);
        })
});

// Serve the React application
app.use(express.static(path.join(__dirname, "../pub_html")));
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../pub_html", "index.html"), err => {
        if (err) {
            console.log(err);
        }
    })
});

// Connect the database and listen on the port
const connectAndStart = () => {
    mongoose.connect(`mongodb://noteuser:notepass@${db_loc}:27017/noteapp`)
    .then(() => {
        console.log("Database connected!");
    }).then(() => {
        app.listen(port, () => {
            console.log(`Application is running at http://localhost:${port}`);
        })
    }).catch((error) => {
        console.log("Database connection error: " + error);
        console.log("Retrying connection...");
        connectAndStart(); // call function again to retry
    })
}
connectAndStart();