const captionList = document.getElementById('caption-list');
const previewImg = document.getElementById('preview-img');
const noImageMsg = document.getElementById('no-image-msg');

let items = [];

async function loadMyDesk() {
    const res = await fetch('/gallery');
    items = await res.json();

    if (items.length === 0) {
        captionList.innerHTML = '<li class="my-desk__caption-item">nothing here yet.</li>';
        return;
    }

    renderCaptions();
    selectItem(0);
}

function renderCaptions() {
    captionList.innerHTML = items
        .map((item, i) => `<li class="my-desk__caption-item" data-index="${i}">${escapeHtml(item.caption)}</li>`)
        .join('');

    captionList.addEventListener('click', (e) => {
        const li = e.target.closest('.my-desk__caption-item');
        if (!li || li.dataset.index === undefined) return;
        selectItem(parseInt(li.dataset.index));
    });
}

function selectItem(index) {
    captionList.querySelectorAll('.my-desk__caption-item').forEach((el) => {
        el.classList.toggle('active', parseInt(el.dataset.index) === index);
    });

    const item = items[index];

    if (item.src) {
        previewImg.src = item.src;
        previewImg.alt = escapeHtml(item.caption);
        previewImg.style.display = 'block';
        noImageMsg.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        noImageMsg.style.display = 'block';
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

window.addEventListener("DOMContentLoaded", loadMyDesk);