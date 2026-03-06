const form = document.getElementById('upload-form');
const fileInput = document.getElementById('blob');
const fileLabelText = document.getElementById('file-label-text');

// show the selected filename in the file label
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileLabelText.textContent = fileInput.files[0].name;
    } else {
        fileLabelText.textContent = 'attach an image (optional)';
    }
});

form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const data = new FormData(form);

    const res = await fetch('/upload', { method: 'POST', body: data });
    const json = await res.json();

    if (!res.ok) {
        alert(json.error || 'upload failed');
        return;
    }

    // reset form on success
    form.reset();
    fileLabelText.textContent = 'attach an image (optional)';
});