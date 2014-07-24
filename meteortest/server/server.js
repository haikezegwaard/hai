// On server startup, create some players if the database is empty.
Meteor.startup(function () {  
    //startup logic
});

process.env.HTTP_FORWARDED_COUNT = 1;
Meteor.publish(null, function() {
  return [
    Meteor.users.find({
      "status.online": true
    }, {
      fields: {
	status: 1,
	username: 1
      }
    }), UserStatus.connections.find()
  ];
});


