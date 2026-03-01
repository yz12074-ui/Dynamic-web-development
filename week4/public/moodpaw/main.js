alert("Are you a dog person?");

let currentSelectedMood = null;

window.onload = async() => {
    let c = document.getElementById("dog-display");
    if (c) {
        let url = "https://dog.ceo/api/breeds/image/random";
        try {
            let response = await fetch(url);
            let dogData = await response.json();
            let dogImage = dogData.message;

            c.innerHTML = "";
            let photo = document.createElement("img");
            photo.src = dogImage;
            photo.style.width = "100%";
            photo.style.height = "100%";
            photo.style.objectFit = "cover";
            photo.style.borderRadius = "15px";
            c.appendChild(photo);
        } catch (error) {
            console.log(error);
        }
    }

    const bone = document.getElementById("bone");
    const bowl = document.getElementById("dog-bowl");

    if (bone && bowl) {
        dragElement(bone, bowl);
    }
};

function selectMood(element, moodName) {
    let allItems = document.querySelectorAll('.mood-item');
    allItems.forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    currentSelectedMood = moodName;
    document.getElementById('interaction-text').innerText = "Ready! Now tap the paw!";
}

function confirmAndGo() {
    if (currentSelectedMood) {
        window.location.href = "page2.html?mood=" + currentSelectedMood;
    } else {
        alert("Please select a mood first! 🐾");
    }
}

function dragElement(elmnt, target) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elmnt.style.position = "absolute";
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        if (isColliding(elmnt, target)) {
            playEatingSound();
            closeDragElement();
            elmnt.style.display = "none";
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function isColliding(a, b) {
    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();
    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.right < rect2.left ||
        rect1.left > rect2.right
    );
}

function playEatingSound() {
    let audio = new Audio('dog.mp3');
    audio.play().catch(e => {});
    alert("Yummy! You fed the dog! 🦴");
}

const addBtn = document.getElementById("addNameBtn");

if (addBtn) {
    addBtn.addEventListener("click", submitName);
}

async function submitName() {
    const input = document.getElementById("dogNameInput");
    const name = input.value.trim();

    if (!name) return;

    await fetch("/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    input.value = "";
    loadTicker();
}


async function loadTicker() {
    const ticker = document.getElementById("ticker-content");
    if (!ticker) return;

    const res = await fetch("/ticker");
    const data = await res.json();

    const names = data.names.map(n => ` 🐾 ${n.name} `).join("");

    ticker.innerHTML = names + names; // duplicate for seamless scrolling
}