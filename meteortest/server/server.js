// On server startup, create some players if the database is empty.
Meteor.startup(function () {  
  if (Settlers.find().count() === 0) {
    
    var players = ["Haike","Auke","Ivan"];
    var coors = [103,102,132];
    for (var i = 0; i < players.length; i++)
      Settlers.insert({player: players[i], coors: coors[i]});
  }
});

