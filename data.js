
//Leaflet Map Loading
var map = L.map('map').setView([33.82, -118.15], 13);

//Tile Layer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    // attribution: '&copy; <a href= "http://www.openstreetmap.org/copyright"> OpenStreetMap</a',
}).addTo(map);

L.circle([33.818, -118.152], {radius: 500}).addTo(map)

// var legend = L.control({position: 'bottomright'});
// legend.onAdd = function(e) {
//     const div = L.DomUtil.create("div", "legend");
//     div.innerHTML = "Legend Testing";
//     return div;
// };

// legend.addTo(map);



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
       // fileContent.textContent = content;  
        messageDisplay.textContent = "File received successfully";
        //parsing file
        const parsedData = parseFile(content);
        visual(parsedData);
        
        
}
read.readAsText(file);
}


function parseFile(readfile) {
    //splitting text by lines w newline characters
    const lines = readfile.trim().split(/\r?\n/)
    
    //first line of the file
    const headers = lines[0].split(",")

    //creating the row objects into a list
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const val = lines[i].split(",");
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = val[j].trim();
        }
        data.push(obj);
    }
    //testing for parsing data
    fileContent.textContent = JSON.stringify(data, null, 2);
    return data;

    // //adding markers based on file location data
    // data.forEach(location => {
    //     var latitude = parseFloat(location.Latitude);
    //     var longitude = parseFloat(location.Longitude);
    //     L.marker([latitude, longitude]).addTo(map).bindPopup(`Population: ${location.Population}`);
    // })


}

function visual(data) {
        //adding markers based on file location data
        data.forEach(location => {
            var latitude = parseFloat(location.Latitude);
            var longitude = parseFloat(location.Longitude);
            L.circle([latitude, longitude], {color: legendColor(location.Population), radius: location.Population}).addTo(map).bindPopup(`Population: ${location.Population}`);
        });

        //finding the min and max
        const numericalArray = data.map(data => data.Population);
        const min = Math.min(numericalArray);
        const max = Math.max(numericalArray);

        
        //adding a legend
        var legend = L.control({position: 'bottomright'});
        legend.onAdd = function(e) {
            const div = L.DomUtil.create("div", "legend");
            div.innerHTML = "Legend Testing";
            // div.innerHTML = min;
            // div.innerHTML = max;
            return div;
};

legend.addTo(map);


        
};

function legendColor(c){
    return c > 800 ? '#FF0000':
        c > 600 ? '#FF5349':
        c > 300 ? '#FFAE42':
        c > 100 ? '#FFFF00':
        '#000000';

}



