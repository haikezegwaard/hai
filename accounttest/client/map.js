// Template for rendering the map
Template.map.rendered = function() {
	map_init();
};

// Template for observing changes in the Unit collection
// these changes have an effect on the vectorlayer.
// map_observe(), will bind these.
Template.vectorlayer.coordinates = function() {
	return Units.find({}, {
		sort : {
			time : -1
		}
	});
};

// OpenLayers 3
var myMap = null;
var myProjection = null;
var mySource = null;

// store the OpenLayer context,
// the is otherwise lost inside the template context.
var myOL = null;
var vector = null; // vector layer

// initialize the map
function map_init() {

	if (myMap)
		return;

	myProjection = proj = ol.proj.get('EPSG:3857');

	myMap = new ol.Map({
		target : 'map',
		layers : [ new ol.layer.Tile({
			source : new ol.source.MapQuest({
				layer : 'sat'
			})
		}) ],
		view : new ol.View({
			center : ol.proj.transform([ 37.41, 8.82 ], 'EPSG:4326',
					'EPSG:3857'),
			zoom : 4
		})
	});

	myOL = ol; // save the Open Layers context
	map_addVectorLayer();
	mapSingleClick();
	map_observe();
	addHoverSelect();
}

// Bind Unit collection with the vector layer.
// At the moment only inserts are handled
function map_observe() {
	Meteor.autosubscribe(function() {
		Units.find().observe({
			added : function(item) {
				map_addCoordinate(item);
				myMap.render();
			},
			removed : function(item) {
				map_removeCoordinate(item);
				myMap.render();
			}

		});
	});
}

// Binds a mouse click to the map
// insert a unit, select a unit, or undo the selection
function mapSingleClick() {
	map = myMap;	 

	myMap.on('click', function(evt) {
		//check if there is a feature on the spot
		var coor = evt.coordinate;
		
		//undo the current selection
		if (Session.get('popupShow') === 'true'){
			hideHaiFactor();
			$(element).popover('destroy');	
		}
		
		var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature,
				layer) {
			return feature; //we have a feature
		});
		
		if (feature) { //show a popup with unit info, and draw the hai factor
			//create a popup container
			element = document.getElementById('popup');
			popup = new ol.Overlay({
				element : element,
				positioning : 'bottom-center',
				stopEvent : false
			});
			map.addOverlay(popup);
			popup.setPosition(coor);
			$(element).popover({
				'placement' : 'bottom',
				'html' : true,
				'content' : getPopupContent(feature)
			});
			$(element).popover('show');
			drawHaiFactor(feature);
			Session.set('popupShow', 'true');
		} else {
			if (Session.get('popupShow') !== 'true') { //no feature selected, insert a new unit on the spot
				Units.insert({
					X : coor[0],
					Y : coor[1],
					EPSG : 'EPSG:3857',
					time : Date.now(),
					userId : Meteor.userId(),
					hai: Math.round(Math.random()*100)
				});
			}
			Session.set('popupShow', 'false');
		}
	});
}

var haiFeature; //global so we can remove it later

//remove the hai factor circle
function hideHaiFactor() {	
	if(haiFeature !== null){
		mySource.removeFeature(haiFeature);
	}	
}

//draw semi transparant circle around feature to represent the hai factor
function drawHaiFactor(feature) {
	unit = Units.findOne({
		_id : feature.get('name')
	});	
	haiFeature = new myOL.Feature({
		geometry : new myOL.geom.Point([unit.X,unit.Y]),
		labelPoint : new myOL.geom.Point([unit.X,unit.Y]),
		name : "haicircle"
	});
	style = new ol.style.Style({
		fill : new ol.style.Fill({
			color : 'rgba(255, 255, 255, 0.2)'
		}),
		stroke : new ol.style.Stroke({
			color : 'rgba(0, 0, 0, 0.2)',
			width : 2
		}),
		image : new ol.style.Circle({ //draw semi transparant circle to represent the hai factor
			radius : unit.hai,
			fill : new ol.style.Fill({
				color : 'rgba(255, 255, 255, 0.2)'
			})
		})
	});
	haiFeature.setStyle(style);
	mySource.addFeature(haiFeature);
}

// Helper function to get content shown in feature popup
function getPopupContent(feature) {
	unit = Units.findOne({_id : feature.get('name')	}); //what unit is the feature referring to?
	user = Meteor.users.findOne({_id : unit.userId}); //who is the owner of the unit?
	result = 'owner: ' + user.username + '<br />';
	result+= 'id: ' + unit._id + '<br />';
	result+= 'hai: ' + unit.hai;
	return result; 
}

// Add an object/records from the Unit Collection
// to the vector layer
function map_addCoordinate(units_obj) {
	var polyCoords = new Array();

	polyCoords.push(units_obj.X);
	polyCoords.push(units_obj.Y);

	var feature = new myOL.Feature({
		geometry : new myOL.geom.Point(polyCoords),
		labelPoint : new myOL.geom.Point(polyCoords),
		name : units_obj._id
	});
	style = new ol.style.Style({
		fill : new ol.style.Fill({
			color : 'rgba(255, 255, 255, 0.2)'
		}),
		stroke : new ol.style.Stroke({
			color : stringToColor(units_obj.userId),
			width : 2
		}),
		image : new ol.style.Circle({
			radius : 7,
			fill : new ol.style.Fill({
				color : stringToColor(units_obj.userId)
			})
		})
	});
	feature.setStyle(style);
	mySource.addFeature(feature);
}

// remove a feature (representing a unit) from the map
// this is probably not the best way to get the right feature
function map_removeCoordinate(unit) {
	coor = [ unit.X, unit.Y ];
	mySource.removeFeature(mySource.getClosestFeatureToCoordinate(coor));
}

// add the vector layer to the map
function map_addVectorLayer() {
	if (myMap) {
		mySource = source = new ol.source.Vector();
		vector = new ol.layer.Vector({
			source : source
		});
		myMap.addLayer(vector);
	}
}

// select (change style) of features on mouse hover
function addHoverSelect() {
	selectMouseMove = new ol.interaction.Select({
		condition : ol.events.condition.mouseMove,
	});
	myMap.addInteraction(selectMouseMove);
}

// helper function converting a string to a hex color code
function stringToColor(str) {

	// str to hash
	for ( var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++)
			+ ((hash << 5) - hash))
		;

	// int/hash to hex
	for ( var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF)
			.toString(16)).slice(-2))
		;

	return colour;
}
