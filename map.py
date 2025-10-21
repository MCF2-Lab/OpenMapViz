import folium
import pandas as pd

#long beach coordinates
map = folium.Map(location= (33.82, -118.15), zoom_start=11)

map.save('map.html')