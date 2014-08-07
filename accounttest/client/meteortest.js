//Configure the accounts-password package to use only username and password 
//in login/register dialogs
Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

//subscribe to userStatus (handle for all users), published on server
Meteor.subscribe("userStatus");
//subscribe to unit collection, as published on server
Meteor.subscribe("units"); 

//make users reactive for template to see
Template.userList.users = function(){
    return Meteor.users.find({},{fields: { status: 1, username: 1}});
};

//change the class of span according to online-status of user
Template.userPill.labelClass = function() {
  if(this.status === undefined)
	  return "label-default";
  if (this.status.idle)
    return "label-warning";
  else if (this.status.online)
    return "label-success";
  else
    return "label-default";
};

Template.userPill.userColor = function(){
	return stringToColor(this._id);
}

//add eventhandlers to vector layer
Template.vectorlayer.events({
	'click .del' : function(event){ //remove unit when clicking on del link
		id = event.currentTarget.getAttribute('id');
		Meteor.call('removeUnit',id); //call serverside delete method
	} 
});

//helper function converting a string to a hex color code
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

