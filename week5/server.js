//importd the experss library
const express = require("express");
//import our db library
const nedb = require("@seald-io/nedb");

//2.SET up our variable to be use
const app = express();
const database = new nedb({ filename: 'database.txt', autoload: true });

//3.middleware -- in between steps for our apps
app.use(express.static("assets"));
// use this
app.use(express.urlencoded({ extended: true }));


//4. set up our routes
app.get("/create", (request, response) => {
    response.sendFile(__dirname + "/assets/create.html");
});

app.post('/post', (request, response) => {
    console.log(request.body);
    response.send("thank you for posting!");
});
app.post("/post", (request, response) => {
    console.log(request.body);
    let dataToBeAdded = {
        Username: request.body.name,
        content: request.body.content,
    };
    //2. params;
    //1. obj toBeAdded2.action( callback

    database.insert(dataToBeAdded, (err, newDoc) => {
        //err is populated by nedb if there is error
        if (err) {
            console.log(err);
            console.log(dbData);
        }
        response.send("thank you for posting!");
    })
})
app.get('all-posts', (req, res) => {

    //passing in an empty obj to the search param returns everything inside the db
    let query = {};

    database.find(query, (err, dbData) => {
        console.log(dbData);
        res.json({ posts: dbData });
    });
});


//ALWAYS END LAST
app.listen(80, () => {
    console.log("server is running");
});