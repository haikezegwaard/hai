//remove the popup
function hidePopup() {
	hideHaiFactor();
	$(element).popover('destroy');
}

// show a popup with unit info, and draw the hai factor
function showPopupForFeature(feature) {
	// create a popup container
	element = document.getElementById('popup');
	popup = new ol.Overlay({
		element : element,
		positioning : 'bottom-center',
		stopEvent : false
	});
	clientMap.getMap().addOverlay(popup);

	popup.setPosition(feature.getGeometry().getCoordinates());
	$(element).popover({
		'placement' : 'bottom',
		'html' : true,
		'content' : getPopupContent(feature)
	});
	$(element).popover('show');
	drawHaiFactor(feature);
	Session.set('popupShow', 'true');
}

var haiFeature; // global so we can remove it later

// remove the hai factor circle
function hideHaiFactor() {
	if (haiFeature !== null) {
		clientMap.removeFeature('Units', haiFeature);
	}
}

// draw semi transparant circle around feature to represent the hai factor
function drawHaiFactor(feature) {
	unit = Units.findOne({
		_id : feature.get('name')
	});
	haiFeature = new ol.Feature({
		geometry : new ol.geom.Point([ unit.X, unit.Y ]),
		labelPoint : new ol.geom.Point([ unit.X, unit.Y ]),
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
		image : new ol.style.Circle({ // draw semi transparant circle to
			// represent the hai factor
			radius : unit.hai,
			fill : new ol.style.Fill({
				color : 'rgba(255, 255, 255, 0.2)'
			})
		})
	});
	haiFeature.setStyle(style);
	clientMap.addFeature('Units', haiFeature);
}

// Helper function to get content shown in feature popup
function getPopupContent(feature) {
	unit = Units.findOne({
		_id : feature.get('name')
	}); // what unit is the
	// feature referring to?
	user = Meteor.users.findOne({
		_id : unit.userId
	}); // who is the owner of
	// the unit?
	result = 'owner: ' + user.username + '<br />';
	result += 'id: ' + unit._id + '<br />';
	result += 'hai: ' + unit.hai;
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

// select (change style) of features on mouse hover
function addHoverSelect() {
	selectMouseMove = new ol.interaction.Select({
		condition : ol.events.condition.mouseMove,
	});
	clientMap.getMap().addInteraction(selectMouseMove);
}

//handle feature selections on mouse click, 
//attach listeners to selected feactures collection
function addClickSelect() {
	selectMouseClick = new ol.interaction.Select({
		condition : ol.events.condition.singleClick,
	});
	clientMap.getMap().addInteraction(selectMouseClick);
	var collection = selectMouseClick.getFeatures();
	collection.on('add', addListener);
	collection.on('remove', removeListener);
}

//listen to new items in the selected feature collection
//show popup for selected item
function addListener(collectionEvent) {
	feature = collectionEvent.element;
	Session.set('selectionState', true);
	showPopupForFeature(feature);
}

//listen to deselection (removal out of selected features collection)
//remove existing popup
function removeListener(bla) {
	Session.set('selectionstate', false);
	hidePopup();
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

// ///

// Template for rendering the map
Template.map.rendered = function() {
	createClientMap();
};

// Template for observing changes in the Unit collection
// these changes have an effect on the vectorlayer.
Template.vectorlayer.coordinates = function() {
	return Units.find({}, {
		sort : {
			time : -1
		}
	});
};

// OpenLayers 3
var clientMap = null;
function createClientMap() {

	if (clientMap) // if already created leave
		return;

	clientMap = new ClientMap('map'); // create instance, with div id
	clientMap.defaultSettings(); // default settings for the hai game

	// observe the Unit collection
	Meteor.autosubscribe(function() {
		Units.find().observe({
			added : function(item) {
				clientMap.add('Units', item);
			},
			removed : function(item) {
				clientMap.remove('Units', item);
			}
		});
	});

	// attach click handler to add item in the Unit collection, never directly
	// on the map!
	// The collection is already being observed  
	clientMap.on('click', function(evt) {
		if (Session.get('selectionState') !== true) {
			var coor = evt.coordinate;
			var feature = clientMap.getMap().forEachFeatureAtPixel(evt.pixel, function(feature,layer){
				return feature;
			});
			if(!feature){
				Units.insert({
					X : coor[0],
					Y : coor[1],
					EPSG : 'EPSG:3857',
					time : Date.now(),
					hai : Math.round(Math.random() * 100),
					userId : Meteor.userId()
				});
			}
		}
		Session.set('selectionState',false); //switch to insertion state
	});

	addHoverSelect();
	addClickSelect();
}
