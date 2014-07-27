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
     




