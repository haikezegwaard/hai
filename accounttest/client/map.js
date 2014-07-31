
// Template for rendering the map
Template.map.rendered = function () {
    map_init();
}

// Template for observing changes in the Unit collection
// these changes have an effect on the vectorlayer.
// map_observe(), will bind these.
Template.vectorlayer.coordinates = function(){
    return Units.find({}, { sort: { time: -1 }});
}



// OpenLayers 3 
var myMap = null;
var myProjection = null;
var mySource = null;

//store the OpenLayer context, 
//the is otherwise lost inside the template context.
var myOL = null; 


function map_init()
{
    if (myMap)
        return;

    myProjection = proj = ol.proj.get('EPSG:3857');

    myMap = map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'sat'})
            })
        ],
        view: new ol.View({
            center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
            zoom: 4
        })
    });

    myOL = ol; // save the Open Layers context
    map_addVectorLayer();
    map_singleClick();
    map_observe();

}

// Bind Unit collection with the vector layer.
// At the moment only inserts are handled
function map_observe()
{    
    Meteor.autosubscribe(function() {
        Units.find().observe({
            added: function(item){ 
                map_addCoordinate(item);
            }
        });
    });
}

//Binds a mouse click to the corresponding
//Units insert.
function map_singleClick()
{    
    myMap.on('click', function(evt) {
        var coor = evt.coordinate;
  
        Units.insert({
            X: coor[0],
            Y: coor[1],
            EPSG: 'EPSG:3857',
            time: Date.now(),
	    userId: Meteor.userId()
        });
    });
}

// Add an object/records from the Unit Collection
// to the vector layer
function map_addCoordinate(units_obj)
{
    var polyCoords = new Array();
    
    polyCoords.push(units_obj.X);
    polyCoords.push(units_obj.Y);
    
    var feature = new myOL.Feature({
        geometry: new myOL.geom.Point(polyCoords),
        labelPoint: new myOL.geom.Point(polyCoords),
        name: units_obj._id        
    });  

    mySource.addFeature(feature);
    myMap.render();
}

var vector;
// add the vector layer to the map
function map_addVectorLayer()
{
    if (myMap)
    {
        mySource = source = new ol.source.Vector();

        vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });        
        myMap.addLayer(vector);
    }
}
