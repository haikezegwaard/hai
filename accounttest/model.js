//Collections to be published should go here.
Units = new Meteor.Collection("units"); //abstract unit collection, each unit has an owner (a user);
//Subset containing 'my units'
ownedUnits = function(userId){
	return Units.find({userId: userId});
};
//Subset containing opponents' units near me
unitsNearMe = function(userId){
	return Units.find({userId: {$ne: userId}});
};

//create new unit
ownedUnits.addUnit = function(unit){
    Units.insert({
		X : unit.X,
		Y : unit.Y,
		EPSG : 'EPSG:3857',
		time : Date.now(),
		hai : unit.hai,
		userId : unit.userId
	});
};

//return all units with given userId 
Units.findByOwner = function(userId) {
  return Units.find({userId: userId});
};

//helper lookupfunction
lookupOwnerByUnit = function(unit){
	return Meteor.users.findOne({_id: unit.userId});
};


