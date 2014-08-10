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

haiFeature = undefined; // global so we can remove it later

// remove the hai factor circle
function hideHaiFactor() {
  if (haiFeature !== null) {
    clientMap.removeFeature('Units', haiFeature);
  }
}

// draw semi transparant circle around feature to represent the hai factor
function drawHaiFactor(feature) {
  unit = Units.findById(feature.get('name'));
  haiFeature = new ol.Feature({
    geometry : new ol.geom.Point([ unit.X, unit.Y ]),
    labelPoint : new ol.geom.Point([ unit.X, unit.Y ]),
    name : "haicircle"
  });
  style = helper.semiTransparentCircleStyle(unit.hai); //draw semi-trans circle to represent hai factor
  haiFeature.setStyle(style);
  clientMap.addFeature('Units', haiFeature);
}

// Helper function to get content shown in feature popup
function getPopupContent(feature) {
  //unit = Units.findOne({_id : feature.get('name')}); // what unit is the
  unit = Units.findById(feature.get('name')); //lookup this unit and typecast it
  return unit.popupContent();
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
  mySource.removeFeature(unit);
  //coor = [ unit.X, unit.Y ];
  //mySource.removeFeature(mySource.getClosestFeatureToCoordinate(coor));
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

// ///

// Template for rendering the map
Template.map.rendered = function() {
  createClientMap();
};

// Template for observing changes in the Unit collection
// these changes have an effect on the vectorlayer.
Template.myUnits.units = function() {
  return Units.owned(Meteor.userId());
};

Template.unitsNearMe.units = function(){
  return Units.inRange(Meteor.userId());
};

// OpenLayers 3
var clientMap = null;
function createClientMap() {

  if (clientMap) // if already created leave
    return;

  clientMap = new ClientMap('map'); // create instance, with div id
  clientMap.defaultSettings(); // default settings for the hai game

  // observe the Unit collections
  observations = {
    added : function(item) {
      HAI.debug('Adding', item);
      clientMap.add('Units', item);
    },
    removed : function(item) {
      HAI.debug('Removing', item);
      clientMap.remove('Units', item);
    }
  };
  Meteor.autosubscribe(function() {
    Units.owned(Meteor.userId()).observe(observations);
    Units.inRange(Meteor.userId()).observe(observations);
  });

  // attach click handler to add item in the Unit collection, never directly
  // on the map!
  // The collection is already being observed
  clientMap.on('click', function(evt) {
    if (Session.get('selectionState') !== true) { //not in selectionstate => unit placement state
      var coor = evt.coordinate;
      //check whether there is a feature on the event location
      var feature = clientMap.getMap().forEachFeatureAtPixel(evt.pixel, function(feature,layer){
	return feature;
      });
      if(!feature){ //no feature on the spot, create a unit
	//unit = new Unit(coor[0], coor[1], Meteor.userId());
	//unit.hai = hai
	hai = Math.round(Math.random() * 100);
	settler = new HAI.Settler(
          coor[0], coor[1], Meteor.userId(), hai);
	Units.addUnit(settler); //add settler to 'my' collection
      }
    }
    Session.set('selectionState',false); //switch to insertion state
  });

  addHoverSelect();
  addClickSelect();
}
