
const fileInput = document.getElementById('fileInput')
const fileContent = document.getElementById('fileContent')
const messageDisplay = document.getElementById('message')
fileInput.addEventListener('change', event);

const file = event.target.files[0];
//reading the file
const read = new FileReader();
read.onload = function(e) {
    const content = e.target.result;
    document.getElementById('message').textContent = "File received successfully"
    fileContent.textContent = content;   
}


