//it shows a alert when the page opens
alert("javascript page has been successfully linked!!");
//write to the inspector console
console.log("this is a console message!!");

window.onload = async() => {
    console.log("window has loaded")
        // retrieves a specfic element by its id from the html page
    document.getElementById("important");
    //manipulate the text of the selected element
    document.getElementById("important").innerHTML = "I have <span> changed </span>the text by javascript!!";
    //store the long document element in a variable
    //we can manipulate the style and grab any css attribute,but
    //any style changes that happen in js will supersede any styling via the.css file
    let importantParagraph = document.getElementById("important");
    importantParagraph.style.color = "#840032";

    importantParagraph.classList.add("hide");
    importantParagraph.classList.remove("hide");
    //adding elements of
    //4 steps

    //1. getting the element that we will add a child to
    let c = document.getElementById("container");
    //2.what type of tag will we create
    let i = document.createElement("img");
    i.src = "pexels-claudia-seidensticker-111222-345162.jpg"

    i.width = 300;
    i.height = 300;
    //4.add the new child to the parent
    c.appendChild(i);
    //add an event listener to my parent div
    // document.getElementById("container");
    //event listener is a fuction that waits for an event to happen only happens when the click happens
    //1.name of the event
    //2.callback function
    c.addEventListener("click", () => {
            alert("you clicked the container");
            if (importantParagraph.classList.contains("hide")) {
                importantParagraph.classList.remove("hide");
            } else {
                importantParagraph.classList.add("hide");
            }
        })
        //use class as the selector to select all the elements with the same class name
    let blues = document.getElementsByClassName("blue");
    console.log(blues);
    blues[1].style.backgroundColor = "Skyblue";
    for (let b of blues) {
        b.style.border = "navy solid 4px"

    }
    //making an api requiest to get data from a server
    //1. creaye url params (everything that goes after the ?)

    let params = new URLSearchParams({
        apikey: "d31e611c",
        s: "one battle after another",
        type: "movie",
    });
    console.log(params);
    //2. create the url
    let url = "http://www.omdbapi.com/?" + params.toString();
    //3. make the request to the url using fetch
    let response = await fetch(url);
    console.log(response);

    let movieData = await response.json();
    console.log(movieData);
    //retrieving the specfic structure of the response via the Search
    //this only exists because of the way the omdb api works
    let movies = movieData.Search;
    console.log(movies);
    //dynamically adding 
    for (let m of movies) {
        let div = document.createElement("div");
        div.textContent = m.Title;
        let poster = document.createElement("img");
        poster.src = m.Poster;
        poster.width = 200;
        div.appendChild(poster);
        c.appendChild(div);

    };
};