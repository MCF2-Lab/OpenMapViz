import folium
import pandas as pd

#long beach, ca scoordinates
map = folium.Map(location= (33.82, -118.15), zoom_start=11)

map.save('map.html')