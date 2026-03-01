//1.LIBRARY IMPORTS
const express = require('express')
    //2.APP INITILLIZATION
const app = express()
    //3.middleware,any app settings
app.use(express.static('client'))

app.post('/upload', upload.single(req, res) => {

            app.listen(5003, () => {
                console.log("server is running on port 5003");
            });