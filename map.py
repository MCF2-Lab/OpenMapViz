import folium
import pandas as pd

#long beach, ca scoordinates
map = folium.Map(location= (33.82, -118.15), zoom_start=11)


#reference to add markers to the map
# for index, row in LA_DF.iterrows():
#   folium.Marker(
#       location=[row['latitude'], row['longitude']],
#       popup=row['station_id']
#   ).add_to(map)

map.save('map.html')