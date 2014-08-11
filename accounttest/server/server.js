// On server startup, create some players if the database is empty.
Meteor.startup(function () {  
    //startup logic	

});

//make users (and status) available for client to subscribe to
Meteor.publish("userStatus", function() {
  return Meteor.users.find({}, {fields: {status: 1,username: 1 }});
});

//make unit collection available to subscribe to for client
Meteor.publish("units", function(){
  return Units.find();
});

//publish units owned by current player as a reactive collection
Meteor.publish("ownedUnits", function(){
  return Units.owned(this.userId); //use this.userId instead of Meteor.userId() in a publish function
});

//publish units of other players 'near' current player as a reactive collection
Meteor.publish("unitsNearMe", function(){
  return Units.inRange(this.userId); //use this.userId instead of Meteor.userId() in a publish function
});

//publish server-side methods to the client
Meteor.methods({
  removeUnit: function(id){
    return Units.remove(id);
  }
});
