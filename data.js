//reference to the document elements
const fileInput = document.getElementById("fileInput");
const fileContent = document.getElementById("fileContent");
const messageDisplay = document.getElementById("message");

//runs handleFile function when user selects a file
fileInput.addEventListener("change", handleFile); 

function handleFile(event) {
    const file = fileInput.files[0];
    //reading the file
    const read = new FileReader();
    read.onload = function(e) {
        const content = e.target.result;
        fileContent.textContent = content;  
        messageDisplay.textContent = "File received successfully";
        
}
read.readAsText(file);
}

