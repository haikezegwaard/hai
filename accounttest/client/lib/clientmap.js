// The client map represents the clients map view,
// and its layermanager.
// It can draw geometries and markers displaying
// positions of cities, units etc. 
// The ClientMap should be intialized with an DOM id, its location.
window.ClientMap = ClientMap;
function ClientMap(targetId) {
	this._projection = null; // current projection of the map
	this._ol = ol; // reference to ol3, OpenLayers 3
	this._map = new this._ol.Map({
		target : targetId, // id of the DOM id to populate
		view : new ol.View({ // setup view, if done later the map will not
								// show
			center : ol.proj.transform([ 37.41, 8.82 ], 'EPSG:4326',
					'EPSG:3857'),
			zoom : 4
		})
	}); // the openlayers map
};

// public accessor of private var
ClientMap.prototype.getProjection = function() {
	return this._projection;
};

// public accessor of private var
ClientMap.prototype.getMap = function() {
	return this._map;
};

// public accessor of private var
ClientMap.prototype.getOL = function() {
	return this._ol;
};

// Create a default map setting,
ClientMap.prototype.defaultSettings = function() {
	this.epsg('EPSG:3857'); // Spherical Mercator projection coordinate system

	var layer = new this._ol.layer.Tile({
		source : new this._ol.source.MapQuest({
			layer : 'sat'
		})
	});

	this.addLayer(layer, true);
	this.createVectorLayer("Units"); // adds a layer for our units
};

// Adds a layer to the Map, the isBase variable determines
// wheter or not this layer is the base.
// todo: implement isBaseLayer
ClientMap.prototype.addLayer = function(layer, isBaseLayer) {
	this._map.addLayer(layer); // add layer to the map
};

// Adds a vector source and vector layer to the map.
// Source: http://ol3js.org/en/master/apidoc/ol.source.Vector.html
// Layer: http://ol3js.org/en/master/apidoc/ol.layer.Vector.html
ClientMap.prototype.createVectorLayer = function(name) {
	style = this.defaultStyle();
	source = new this._ol.source.Vector(); // create the feature source
	vector = new this._ol.layer.Vector({ // create a named layer
		source : source, // add the feature source
		style : style, // provide a default style
		isBaseLayer : false
	// regared as the baselayer
	});
	vector.set("name", name);
	this.addLayer(vector, false);
};

// Sets the current projection of the current selected baselayer
// The format is not the SRID, "4326", but the full EPSG name: "EPSG:4326"
ClientMap.prototype.epsg = function(epsg) {
	this._projection = this._ol.proj.get(epsg);
};

// Adds an item to the specic layer/source
ClientMap.prototype.add = function(layername, item) {
	feature = this.featureTransform(item); // transform to ol feature
	this.addFeature(layername, feature);
};

// Remove an item from a specific layer/source
ClientMap.prototype.remove = function(layername, item) {
	feature = this.featureTransform(item); // transform to ol feature
	this.removeFeature(layername, feature);
};

// add a feature to the vector layer
ClientMap.prototype.addFeature = function(layername, feature) {
	this._map.getLayers().forEach(function(layer) { // iterate layers
		if (layer.get('name') == layername) { // if layer is the 'one'
			layer.getSource().addFeature(feature); // add feature to the layer
		}
	});
};

// remove a feature from a specific layer/source
ClientMap.prototype.removeFeature = function(layername, feature) {
	this._map.getLayers().forEach(function(layer) { // iterate layers
		if (layer.get('name') == layername) { // if layer is the 'one'
			console.log(layername);
			layer.getSource().removeFeature(feature); // add feature to the
														// layer
		}
	});
};

// Ataches the func to the event name on the map
// e.g. clientMap.on('click', function(evt) { alert(evt); });
ClientMap.prototype.on = function(name, func) {
	this._map.on(name, func);
};

// !! Should be refactored to a feature-transform-factory
// Transforms an incoming class --e.g. from mongodb-- to an
// OpenLayers Feature.
// Feature: http://ol3js.org/en/master/apidoc/ol.Feature.html
ClientMap.prototype.featureTransform = function(item) {
	feat = new this._ol.Feature({ // transform to Feature
		geometry : new this._ol.geom.Point(item.loc),
		labelPoint : new this._ol.geom.Point(item.loc),
		name : item._id
	// store the mongodb id as name.
	});
	feat.setStyle(new this._ol.style.Style({
		fill : new this._ol.style.Fill({
			color : 'rgba(255, 255, 255, 0.2)'
		}),
		stroke : new this._ol.style.Stroke({
			color : helper.stringToColor(item.userId),
			width : 2
		}),
		image : new this._ol.style.Circle({
			radius : 7,
			fill : new this._ol.style.Fill({
				color : helper.stringToColor(item.userId)
			})
		})
	}));
	return feat;
};

// !! Should be refactored to a style-provider-factory.
// Returns a default style.

ClientMap.prototype.defaultStyle = function() {
	return new this._ol.style.Style({
		fill : new this._ol.style.Fill({
			color : 'rgba(255, 255, 255, 0.2)'
		}),
		stroke : new this._ol.style.Stroke({
			color : '#ffcc33',
			width : 2
		}),
		image : new this._ol.style.Circle({
			radius : 7,
			fill : new this._ol.style.Fill({
				color : '#ffcc33'
			})
		})
	});
};

