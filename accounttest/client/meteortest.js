//Configure the accounts-password package to use only username and password 
//in login/register dialogs
Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

//subscribe to userStatus (handle for all users), published on server
Meteor.subscribe("userStatus");
//subscribe to unit collections, as published on server 
Meteor.subscribe("ownedUnits");
Meteor.subscribe("unitsNearMe");

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
  return helper.stringToColor(this._id);
};

//add eventhandlers to vector layer
event = {
  'click .del' : function(event){ //remove unit when clicking on del link
    id = event.currentTarget.getAttribute('id');
    Units.findById(id).delete();
  }
};
Template.myUnits.events(event); 
Template.unitsNearMe.events(event);



