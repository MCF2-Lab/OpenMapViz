
const fileInput = document.getElementById('fileInput');
const fileContent = document.getElementById('fileContent');
const messageDisplay = document.getElementById('message');


const file = fileInput.files[0];
//reading the file
const read = new FileReader();
read.onload = function(e) {
    const content = e.target.result;
    messageDisplay.textContent = "File received successfully";
    fileContent.textContent = content;   
}


