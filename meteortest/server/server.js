// On server startup, create some players if the database is empty.
Meteor.startup(function () {  
  //startup logic
});


// server code: heartbeat method
Meteor.methods({
  keepalive: function (user_id) {
    console.log('keepalive!');
    if (!Connections.findOne(user_id)){
	Connections.insert({user_id: user_id});
    }
    Connections.update({user_id: user_id}, {$set: {last_seen: (new Date()).getTime()}});
  }
});

// server code: clean up dead clients after 60 seconds
Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  console.log('looking for idle connections');
  Connections.find({last_seen: {$lt: (now - 60 * 1000)}}).forEach(function (user) {
    console.log('user was idle too long, dropping!');
  });
}, 5000);
