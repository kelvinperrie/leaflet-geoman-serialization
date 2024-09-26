
// take a map and turn this info into geojson
// * the layers, along with any 'extended' information used by geoman that doesn't fit into the geojson format
// * the map meta data, i.e. the zoom level and the current x,y of where the map is centered on screen
var GeoJsonExtendedSerializeMap = function(map) {
    let geoJsonLayers = [];
        
    // turn each of our layers into geojson but also include any extra information in the 'extended' prop of the layer
    map.eachLayer(function(layer){
        // we only care about these drawing layers i.e. not the tile layer
        if(layer instanceof L.Path || layer instanceof L.Marker){
            let geoJsonLayer = layer.toGeoJSON();
            // set the radius - after a circle is edited the radius isn't set right??????
            layer.options.radius = layer._mRadius;
            // cram the layer options into the geoJson layer. The options hold information that isn't supported by the 
            // geojson format that we can use to reconstruct the layer later
            geoJsonLayer.properties = layer.options;
            // copy our extra stuff into the geojsonlayer
            geoJsonLayer.extended = layer.extended;
            geoJsonLayers.push(geoJsonLayer);
        }
    });

    // serialize some information about the map
    let mapConfigJson = {
        center : map.getCenter(),
        zoom : map.getZoom()
    }

    // stick layer info and map meta data into an object
    let serializedMapData = JSON.stringify({ 'data' : geoJsonLayers, 'config' : mapConfigJson});

    return serializedMapData;
}

// given some geojson, create some layer objects that can be put on map
var GeoJsonExtendedDeserializeMap = function(serializedMap) {

    let deserializedLayers = [];

    let allDataParsed = JSON.parse(serializedMap);
    let geoLayers = allDataParsed.data;
    if(geoLayers) {
        for (let geoLayer of geoLayers){
            // we have to treat point layers differently - circles and markers are built from points, but are not supported in
            // the geojson format, so we need to reconstruct them using the options we crammed in the geojson layers when no one was looking
            if(geoLayer.geometry.type === "Point") {
                let newLayer = L.geoJSON(geoLayer, {
                    onEachFeature: function (feature, layer) {
                        layer.extended = geoLayer.extended;
                    },
                    pointToLayer: function (feature, latlng) {
                        // it's a marker - so it could be a circle or a marker (a marker can also be a text marker! yay!)
                        // if its got a radius then it must be a circle right?!?
                        if(feature.properties && feature.properties.radius) {
                            return L.circle(latlng, feature.properties);
                        } else {
                            // it's a marker! If it's a text marker then that is determined by the properties
                            // if we just throw the feature properies at the new marker as its options then it messes up some stuff internally on 
                            // the marker (icon property) and I can't be bothered figuring out why,
                            // so just copy the ones we care about to maintain our marker state
                            let featureOptions = {};
                            if(feature.properties && feature.properties.textMarker == true) {
                                featureOptions.textMarker = true;
                                featureOptions.text = feature.properties.text;
                            }
                            return L.marker(latlng, featureOptions);
                        }
                    }
                });
                newLayer.extended = geoLayer.extended;
                deserializedLayers.push(newLayer);
            } else {
                // this is a non point layer, just copy the extended property over
                let newLayer = L.geoJSON(geoLayer, {
                    onEachFeature: function (feature, layer) {
                        layer.extended = geoLayer.extended;
                    }
                });
                deserializedLayers.push(newLayer);
            }
        }
    }
    allDataParsed.data = deserializedLayers;
    return allDataParsed;
}