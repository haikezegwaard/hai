//Collections to be published should go here.
Units = new Meteor.Collection("units"); //abstract unit collection, each unit has an owner (a user);

//create new unit
Units.addUnit = function(userId, unitName){
    Units.insert({userId: userId, unitName: unitName});
};

//return all units with given userId 
Units.findByOwner = function(userId) {
  return Units.find({userId: userId});
};


