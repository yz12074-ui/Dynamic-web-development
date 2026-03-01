// library import
const express = require("express");

// setting up our express application
// instance of our express class
const app = express();

// allow the use of my static files (front-end code)
// html, css, js (interaction)
app.use(express.static("public"));
//send Content-Type: application/json
app.use(express.json());
// FIX -- does not need body parser library or using enctype in form
// allows us to process the body of request data (eg. request.body)
app.use(express.urlencoded({ extended: true }));

let messages = [];

// setting up my first handler for a route
// http://localhost:8000/test
app.get("/test", (request, response) => {
    response.send("<h1>my server is live!</h1>");
});

// this is not a route we access through our own url, we access it from the form when we make a request
// specifically, we need the guestbook html
// http://localhost:8000/guestbook.html contains the form that uses the POST method
app.post("/sign", (request, response) => {
    console.log(request.body);

    messages.push({
        guest: request.body.guestname,
        post: request.body.message,
    });
    // we always need to send data at the end of every request (app.post, app.get)
    response.send("thank you for signing!");
});

// http://localhost:8000/all-messages
app.get("/all-messages", (req, res) => {
    //   response.send(messages);
    // if i want to send data back in json format
    res.json({ guests: messages });
});

// for our moodpaw application
let favorites = [];
let tickerNames = [];
let tickerId = 0;
// FAVORITES
app.get("/favorites", (req, res) => {
    res.json({ favorites });
});

app.post("/favorites", (req, res) => {
    const newFav = {
        id: Date.now(),
        image: req.body.image,
    };
    favorites.push(newFav);
    res.json({ message: "Added", favorite: newFav });
});

app.delete("/favorites/:id", (req, res) => {
    const id = parseInt(req.params.id);
    favorites = favorites.filter(f => f.id !== id);
    res.json({ message: "Deleted" });
});
// GET all names
app.get("/ticker", (req, res) => {
    res.json({ names: tickerNames });
});

// POST new name
app.post("/ticker", (req, res) => {
    const newName = {
        id: tickerId++,
        name: req.body.name
    };

    tickerNames.push(newName);
    res.json({ message: "Name added", name: newName });
});
// LAST STEP ALWAYS
// start our express application

app.listen(8000, () => {
    console.log("starter server is working");
});