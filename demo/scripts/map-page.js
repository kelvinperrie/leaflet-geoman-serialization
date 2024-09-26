

class MapPage {

    map = L.map('map').setView([-39.19340, 173.98926], 15);
    self = null;
    layerWithDetailsBeingEdited = null; // keeps track of what layer the extended details are intended for (i.e. the last clicked layer)

    constructor() {
        
        self = this;

        // create a map
        var OpenStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
        this.map.addLayer(OpenStreetMap);

        this.map.pm.addControls({ position: 'topleft', drawCircleMarker: false, rotateMode: false, });
        this.map.pm.setPathOptions({snapDistance:5});

        this.map.on("pm:create", (e) => {
            this.LayerCreate_handler(e);
        });

        // put some handlers on our buttons
        document.getElementById("save-layer-details").onclick = function(e) { self.SaveLayerDetailsButton_handler(e); return false; };
        document.getElementById("serialize-all").onclick = function(e) { self.SerializeLayersButton_handler(e); return false; };
        document.getElementById("clear-all").onclick = function(e) { self.ClearAllLayersButton_handler(e); return false; };
        document.getElementById("load-serialized").onclick = function(e) { self.LoadSerializedButton_handler(e); return false; };
        
    }
    
    SetupHandlersForLayer(layer) {
        layer.on('click',function(e){
            self.LayerClicked_handler(e);
        });
    }

    SerializeLayersButton_handler(e) {
        console.log("do serialization");

        let postData = GeoJsonExtendedSerializeMap(this.map);

        $("#serialized-data").val(postData);
    }

    ClearAllLayersButton_handler(e) {
        this.ClearAllDrawingLayers()
    }

    LoadSerializedButton_handler(e) {
        var self = this;
        let serializedData = $("#serialized-data").val();
        let deserializedData = GeoJsonExtendedDeserializeMap(serializedData);

        // add layers to the map
        let deserializedLayers = deserializedData.data;
        for(let newLayer of deserializedLayers) {
            // setup handlers for layers just added
            self.SetupHandlersForLayer(newLayer);
            // put the layer on the map
            newLayer.addTo(this.map);
        }

        // recenter and set the zoom based on the saved data
        this.map.setView(new L.LatLng(deserializedData.config.center.lat, deserializedData.config.center.lng), deserializedData.config.zoom);
    }

    SaveLayerDetailsButton_handler(e) {
        console.log("saving the layer details")
        this.SaveLayerDetails();
    }

    LayerCreate_handler(e) {
        console.log("layer create called!")
        // when a layer is created add some event handlers to it
        this.SetupHandlersForLayer(e.layer);
    }

    LayerClicked_handler(e) {
        // when a layer is clicked display its' extended properties and set a variable to keep track of what layer is being edited
        this.layerWithDetailsBeingEdited = e.sourceTarget;
        this.DisplayLayerDetails(e.sourceTarget);
    }

    DisplayLayerDetails(layer) {
        $("#locationId").val("");
        $("#locationName").val("");
        $("#locationLevel").val("");

        if(this.layerWithDetailsBeingEdited.extended) {
            $("#locationId").val(this.layerWithDetailsBeingEdited.extended.id);
            $("#locationName").val(this.layerWithDetailsBeingEdited.extended.name);
            $("#locationLevel").val(this.layerWithDetailsBeingEdited.extended.level);
        } else {
            console.log("this layer has no 'extended' property, so can't display details") 
        } 
    }

    SaveLayerDetails() {
        if(this.layerWithDetailsBeingEdited) {
            if(this.layerWithDetailsBeingEdited.extended) {

            } else {
                this.layerWithDetailsBeingEdited.extended = {};
            }
            let layerName = $("#locationName").val();
            let layerId = $("#locationId").val();
            let layerLevel = $("#locationLevel").val();
            this.layerWithDetailsBeingEdited.extended.id = layerId;
            this.layerWithDetailsBeingEdited.extended.name = layerName;
            this.layerWithDetailsBeingEdited.extended.level = layerLevel;
        }
    }

    // removes all geoman/annotation layers
    ClearAllDrawingLayers() {
        this.map.eachLayer(function(layer){
            if(layer instanceof L.Path || layer instanceof L.Marker){
                layer.remove();
            }
        });
    }
    
  }
