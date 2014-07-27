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
  if (this.status.idle)
    return "label-warning"
  else if (this.status.online)
    return "label-success"
  else
    return "label-default"
};
//
//A quick test with abstract "units" (only containing a name and owner (userid)
//

//handle button click: create new unit for current user
Template.newUnitButton.events({
  'click input': function () {
    Units.addUnit(Meteor.userId(),"unitname "+Math.floor((Math.random() * 10) + 1));
    console.log('inserted unit, new count '+Units.find().count());
      
  }
});

//retrieve all units and bind to template
Template.unitList.units = function(){
    return Units.find();
};

//bind units of logged in user to template
Template.unitList.myUnits = function(){
    return Units.findByOwner(Meteor.userId());
};

