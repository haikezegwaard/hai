Template.hai.settlers = function(){
    return Settlers.find();
}

Template.playerlist.players = function() {
    return Players.find();
}

Template.lobby.me = function(){
    return Session.get('current_player_id');
}

Template.loginform.events({
    'click input.loginbutton' : function () {        
        var name = $('#myname').val();        
        var result = Players.find({name: name});
	if(result.count() === 0){        
	    Players.insert({name: name}, function(err, docsInserted){
		if(err) return;		
		Session.set('current_player_id', docsInserted );
	    });
	}else{
	    Session.set('current_player_id', result._id );
	}	
    }
});

var map = null;

Template.map.rendered = function(){
    if(map){
	return; //don't do this function twice
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

    map.setCenter(position, zoom );
}


