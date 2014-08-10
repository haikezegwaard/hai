//class for misc helper functions / creating mock data
helper = new function() {

	// helper function converting a string to a hex color code
	this.stringToColor = function(str) {

		// str to hash
		for ( var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++)
				+ ((hash << 5) - hash))
			;

		// int/hash to hex
		for ( var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF)
				.toString(16)).slice(-2))
			;

		return colour;
	};
};

//helper function generating a style for semi transparent circle
helper.semiTransparentCircleStyle = function(radius) {
	return new ol.style.Style({
		fill : new ol.style.Fill({
			color : 'rgba(255, 255, 255, 0.2)'
		}),
		stroke : new ol.style.Stroke({
			color : 'rgba(0, 0, 0, 0.2)',
			width : 2
		}),
		image : new ol.style.Circle({ // draw semi transparant circle to			
			radius : radius,
			fill : new ol.style.Fill({
				color : 'rgba(255, 255, 255, 0.2)'
			})
		})
	});
};
//get a readable user online status
userStatusToString = function(user) {
	if (user.status === undefined)
		return "offline";
	if (user.status.idle)
		return "idle";
	else if (user.status.online)
		return "online";
	else
		return "offline";
};

//timestamp to string formatted date
timeToDateString = function(time){
	var a = new Date(time);
	var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    result = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec ;
    return result;
};

