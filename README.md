# Geoman and Leaflet serialization and deserialization

This project shows how to serialize geoman shapes and custom data stored against shapes. Leaflet already has built in methods to serialize layers to geojson, 
but things like circles are not supported in geojson, and also you might want to store your own data against each shape.

The project lets you draw geoman shapes and associate custom data with them by entering it into a form. 

To serialize the shape data it uses the geojson methods supplied by leaflet and then crams the extra geoman info and custom data into the geojson. Our resulting serialized data is not valid geojson. 
Once the data is serialized it is put into a textarea on the screen. The layers can then be deleted from the map, and then the information in the text area can be deserialized and displayed on the screen.


https://leaflet-geoman-serialization.vercel.app/demo/editor.html
