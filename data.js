//Leaflet Map loading
const LONG_BEACH_COOR = [33.7701, -118.1937];
const ZOOM = 12;

const MAX_LAYERS = 3; 

//initializing the map
const map = L.map('map').setView(LONG_BEACH_COOR, ZOOM);

//Open Street Map Tile Layer
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href= "http://www.openstreetmap.org/copyright"> OpenStreetMap</a',
}).addTo(map);

//Esri Satellite Map Tile Layer
const esri = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    
    { attribution: "Copyright &copy; Esri" }
);

//TESTING
// L.circle([33.818, -118.152], {radius: 500}).addTo(map)

const baseMaps = {
    "OpenStreetMap": osm,
    "Esri World Imagery": esri
    
  };
  
//uses leaflet control layers to create the layering icon
let overlayControl = L.control.layers(baseMaps, {}, {collapsed: false}).addTo(map);


//consists of layers uploaded with its corresponding legend
const userData = {
    layers: [], // { name, type, leafletLayer, visible, bounds, legend}
  };
  

//shows the legend content for each layer
function renderLegend(){
  const legendElem = document.getElementById("legend");

  legendElem.innerHTML = "";

  //default legend message
  if (!userData.layers.length) {
    legendElem.innerHTML =`<div style="font-size: 16px;" class="legend-text">Load a numeric layer to see a legend.</div>`;
  }

  //loops through the layers and grabs their legend component
  for (const l of userData.layers) {
    legendElem.appendChild(createLegend(l.legend))
  }
}


//creates the legend for each layer
function createLegend({ min, max, palette, label }) {
  const legend = document.createElement("div");
  legend.className= "legend-item"

  //creates the stops for the color gradient scale
  const grad = chroma.scale(palette).mode("lab").domain([0, 1]);
  const stops = Array.from({ length: 10 }, (_, i) => {
    // const t = min + (i / 9) * (max-min);
    const t = i / 9;
    return `${grad(t).hex()} ${Math.round(t * 100)}%`;
  }).join(", ");

  //develops the final legend with the labels and color gradient scale
  legend.innerHTML = `
    <div><b>${escapeHtml(label)}</b></div>
    <div class="bar" style="background: linear-gradient(90deg, ${stops});"></div>
    <div class="labels">
      <span>${(min)}</span>
      <span>${(max)}</span>
    </div>
  `;
  return legend;

}

//html content from file names or content is replaced with understandable string symbol
function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
///

//reference to the document elements
const fileInput = document.getElementById("fileInput");
const fileContent = document.getElementById("fileContent");
const messageDisplay = document.getElementById("message");

//runs handleFile function when user selects a file
fileInput.addEventListener("change", (e) => handleFile(e.target.files)); 


// File handling
function handleFile(fileList) {
    //no files uploaded
    if (!fileList || fileList.length === 0) return;


    //array supports multiple files added, iterates through file list
    Array.from(fileList).forEach((file) => {
        const fileName = file.name;
        const lowerName = fileName.toLowerCase();
    
    //reading the file
    const read = new FileReader();
    read.onload = async () => {

        
        const content = read.result;

        if (lowerName.endsWith(".csv")) {
            

            const parsed = await parseCSVFile(content);
            // fileContent.textContent = content; 
        //TESTING MESSAGE (DELETE LATER) 
        // messageDisplay.textContent = "File received successfully";
        //parsing file

        //visualizes the data on map
        visual(parsed, fileName);       

        }
        //test case: when a user uploads a file that is not CSV
        else {
            alert(`Unsupported file type: ${fileName}`);
        }
       
    };
    read.readAsText(file);

    });

}


//file is passed in as an argument and Papa Parse library parses through file 
async function parseCSVFile(readfile) {
    //Promise allows for parsed data to be returned as a success or rejection
    return new Promise ((resolve, reject) => {
        Papa.parse(readfile, {
            //keeps header values
            header: true,
            //auto-converts data into numeric, boolea types
            dynamicTyping: true,
            //ignores empty lines (data pre-processing)
            skipEmptyLines:true,
            complete: function (results) {
                var csvData = results.data;

                //returns parsed data

                resolve(csvData);
               
            },
            error: reject
    });
    
    });
}

//previous code: manual parsing
    // //splitting text by lines w newline characters
    // const lines = readfile.trim().split(/\r?\n/)
    
    // //first line of the file
    // const headers = lines[0].split(",")

    // //creating the row objects into a list
    // const data = [];
    // for (let i = 1; i < lines.length; i++) {
    //     const val = lines[i].split(",");
    //     const obj = {};
    //     for (let j = 0; j < headers.length; j++) {
    //         obj[headers[j].trim()] = val[j].trim();
    //     }
    //     data.push(obj);
    // }
    // //testing for parsing data
    // fileContent.textContent = JSON.stringify(data, null, 2);
    // return data;

// }

function visual(data, fName) {
    const cols = Object.keys(data[0] || {});

    //finding the latitude and longitude columns
    const latCol = cols.find(c => c.toLowerCase() === 'lat' || c.toLowerCase() === 'latitude');
    const longCol = cols.find(c => c.toLowerCase() === 'lon' || c.toLowerCase() === 'longitude' || c.toLowerCase() === "lng");
                
    
    //checks whether file contains coordinate columns
    if (!latCol || !longCol) {
    //tested and works
    alert("CSV must include latitude and longitude columns.");
    return;}

  

    //finds first numerical column to visualize
    numericVal = cols.find(col => {
        const l = col.toLowerCase();
        //does not include latitude and longitude columns as numeric columns or column names with id or name
        if (l === latCol.toLowerCase() || l === longCol.toLowerCase() || l.endsWith("id") || l.endsWith("ID") || l.endsWith("name") || l.endsWith("NAME")) return false;

        //returns boolean value - data type: number and finite number
            return data.some(r => typeof r[col] === "number" && isFinite(r[col]));
        });
    
    if (!numericVal) {
      //works
      alert("CSV must include a numerical column.");
    return;
    }
            
        const points = [];
        const values = [];

        for (const row of data) {
            const lat = Number(row[latCol]);
            const long = Number(row[longCol]);

            //does not include lat and long values that is infinite, NAN
            if (!isFinite(lat) || !isFinite(long)) continue;

            //values from numerical column if exists
            const numValues = numericVal ? Number(row[numericVal]): NaN;

                if (isFinite(numValues)) values.push(numValues);

                points.push({lat, long, props: row, numValues})}

                if (points.length === 0) {
                    alert("No value lat/lon rows found in CSV")
                    return;
                }
            
            //finding min and max value of the values array    
            const min = values.length ? Math.min(...values):0;
            const max = values.length ? Math.max(...values):1;

        
            //const palette = ["#2b83ba", "#abdda4", "#ffffbf", "#fdae61", "#d7191c"]; // blue->red
            //blue to yellow
            const palette = ["#115f9a", "#1984c5", "#22a7f0", "#48b5c4", "#76c68f", "#a6d75b", "#c9e52f", "#d0ee11", "#d0f400"];
        
            const scale = chroma.scale(palette).mode("rgb").domain([min, max]);

            const layerGroup = L.layerGroup();
            const bounds = L.latLngBounds([]);
                    
            points.forEach(p => {

                const color = scale(p.numValues).hex();

                const minRange = 4;
                const maxRange = 30;

                //min-max scaling normalization with custom ranging
                const radiusScale = ((p.numValues - min) / (max-min)) * (maxRange -minRange ) + minRange
          
                //creates circle markers for each data point
                const marker = L.circleMarker([p.lat, p.long], {
                    radius: radiusScale,
                    color: color,
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.8 });

                    const popup = buildPopup(fName, p.props, numericVal);
                    marker.addTo(map);
                    marker.bindPopup(popup);
                    marker.addTo(layerGroup);
                    bounds.extend([p.lat, p.long]);
             
                    });

            

                    //adds markers as a layer with metadata 
                    addLayer({
                        name: fName,
                        type: "CSV",
                        leafletLayer: layerGroup,
                        bounds,
                        legend: { min, max, palette, label: `${fName}: ${numericVal}` }
                      });
    
    }

//creates the popup for each value with all its data values
function buildPopup(layerName, props, highlightProp) {
    const keys = Object.keys(props || {});
    const rows = keys
     .slice(0,30)
    .map(k => {
            const v = props[k];
            const strong = (highlightProp && k === highlightProp) ? " style='color:#6aa6ff;font-weight:800;'" : "";
            return `<tr><td${strong}>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`;
    }).join("");

    return `
    <div style="min-width:240px">
      <div style="font-weight:800;margin-bottom:6px">${escapeHtml(layerName)}</div>
      <table style="width:100%; border-collapse:collapse; font-size:12px">
        ${rows}
      </table>
    </div>
  `;
    }


//adds the reviewed and parsed dataset as a layer to the map with its corresponding metadata
function addLayer({ name, type, leafletLayer, bounds, legend }) {
  
    //tried to limit the number of layers user can add but does not work
    //still including as future work
    // if (userData.layers.length + 1 > MAX_LAYERS) {
    //   alert(`You can only add up to ${MAX_LAYERS} layers.`);
    //   return;
    // }

    leafletLayer.addTo(map);

    //adds metadata to the list userData
    userData.layers.push({
      name,
      type,
      leafletLayer,
      visible: true,
      bounds: bounds && bounds.isValid && bounds.isValid() ? bounds : null,
      legend
    });
  
    rebuildOverlayControl();
    renderLegend();
  
  }

  
  //adding the dataset layers to the layers toggle on the top right
  function rebuildOverlayControl() {
    overlayControl.remove();
    const overlays = {};
    for (const l of userData.layers) overlays[l.name] = l.leafletLayer;
    overlayControl = L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);
  }
  
  
// Initial legend - shows default message
renderLegend();


        //adding markers based on file location data
        // data.forEach(location => {
        //     var latitude = parseFloat(location.Latitude);
        //     var longitude = parseFloat(location.Longitude);
        //     L.circle([latitude, longitude], {color: legendColor(location.Population), radius: location.Population}).addTo(map).bindPopup(`Population: ${location.Population}`);
        // });

        //finding the min and max
        // const numericalArray = data.map(data => data.Population);
        // const min = Math.min(numericalArray);
        // const max = Math.max(numericalArray);

        
        //adding a legend
        // var legend = L.control({position: 'bottomright'});
        // legend.onAdd = function(e) {
        //     const div = L.DomUtil.create("div", "legend");
        //     div.innerHTML = "Legend Testing";
        //     // div.innerHTML = min;
        //     // div.innerHTML = max;
        //     return div;
// };

// legend.addTo(map);


// function legendColor(c){
//     return c > 800 ? '#FF0000':
//         c > 600 ? '#FF5349':
//         c > 300 ? '#FFAE42':
//         c > 100 ? '#FFFF00':
//         '#000000';

// }



