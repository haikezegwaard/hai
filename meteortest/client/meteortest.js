//bind settler collection to handlebar template
Template.hai.settlers = function(){
    return Settlers.find();
}

//bind playerlist to template
Template.playerlist.players = function() {
    return Players.find();
}

//bind session var to template
Template.lobby.me = function(){
    return Session.get('current_player_id');
}

//handle events from template 'loginform'
Template.loginform.events({
    'click input.loginbutton' : function () {        
        var name = $('#myname').val();   //get text from input field     
        var result = Players.find({name: name}); //lookup player with this name
	if(result.count() === 0){        
	    Players.insert({name: name}, function(err, docsInserted){ //if not found, create player (register)
		if(err) return;		
		Session.set('current_player_id', docsInserted ); //set current player in session to id of newly created player
	    });
	}else{
	    Session.set('current_player_id', result._id ); //set current player in session to existing player id
	}	
    }
});

//
//Openlayer piece
//
var map = null;
var markers = null;
Template.map.rendered = function(){
    if(map){
	return; //don't do this function twice
    }
    if (! self.handle) {
	self.handle = Deps.autorun(function () {
	    // draw party markers on live OpenLayers map
	    updateMarkers();
	});
    }
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
	defaultHandlerOptions: {
	    'single': true,
	    'double': true,
	    'pixelTolerance': 0,
	    'stopSingle': true,
	    'stopDouble': true
	},

	initialize: function(options) {
	    this.handlerOptions = OpenLayers.Util.extend(
		{}, this.defaultHandlerOptions
	    );
	    OpenLayers.Control.prototype.initialize.apply(
		this, arguments
	    ); 
	    this.handler = new OpenLayers.Handler.Click(
		this, {
		    'click': this.onClick,
		    'dblclick': this.onDblclick 
		}, this.handlerOptions
	    );
	}, 

	onClick: function(evt) {
	    var msg = "click " + evt.xy;
	    console.log(msg);
	},
	
	onDblclick: function(evt) {  
	    var msg = "dblclick " + evt.xy;
	    var lonlat = map.getLonLatFromPixel(evt.xy);
	    var xlonlat = lonlat.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
	    Settlers.insert({player: Session.get('current_player_id'), lat: xlonlat.lat, lon: xlonlat.lon});
	    console.log(msg + "transformed: "+ xlonlat.lat+","+ xlonlat.lon);
	}
	
    });
    map = new OpenLayers.Map('map');
    var mapnik         = new OpenLayers.Layer.OSM();
    var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
    var position       = new OpenLayers.LonLat(-122.40146, 37.78212).transform( fromProjection, toProjection);
    var zoom           = 15; 
 
    map.addLayer(mapnik);

    control = new OpenLayers.Control.Click();
    map.addControl(control);
    control.activate();

    markers = new OpenLayers.Layer.Markers( "Markers" );
    map.addLayer(markers);

    map.setCenter(position, zoom );
}


function updateMarkers(){//selected, selectedParty) {
  if (!markers) {
    return;
  }
  markers.clearMarkers();
  var size = new OpenLayers.Size(16,27);
  var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
  var iconSel = new OpenLayers.Icon('http://www.google.com/mapfiles/marker.png', size, offset);
  var icon = new OpenLayers.Icon('http://labs.google.com/ridefinder/images/mm_20_green.png', size, offset);
  var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projectiona
  var settlers = Settlers.find();
  settlers.forEach(function (settler) {
   if (!settler.marker) {
     var position = new OpenLayers.LonLat(party.lon, party.lat).transform( fromProjection, toProjection);
     var marker = new OpenLayers.Marker(position,
        (selected == settler._id) ? iconSel.clone() : icon.clone());
     marker.settler = settler;
     marker.events.register("click", marker, function(e) {
       console.log("Marker clicked: " + marker.settler._id);
       // update details
       //Session.set("selected", e.object.party._id);
       //hidePopupOSM()
     });
     //marker.events.register('mouseover', marker, handleMarkerOSMMouseOver);
     //marker.events.register('mouseout', marker, hidePopupOSM);
     console.log('adding marker: '+marker);
     markers.addMarker(marker);
   }
  });
}


