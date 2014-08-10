//Collections to be published should go here.
Units = new Meteor.Collection("units"); //abstract unit collection, each unit has an owner (a user);
Users = Meteor.users;

//Subset containing 'my units'
Units.owned = function(userId){
  return Units.findByOwner(userId);
};

// Subset containing opponents' units near `units` argument
//   If `units` argument is not supplied, the userId's owned
//   units are used.
Units.inRange = function(userId, units){
  units = units || Units.owned(userId);
  return Units.find({userId: {$ne: userId}});
};

//create new unit
Units.addUnit = function(unit){
    Units.insert(unit);
};

//return all units with given userId
Units.findByOwner = function(userId) {
  return Units.find({userId: userId});
};

//helper lookupfunction
Users.findByUnit = function(unit){
	return Users.findOne({_id: unit.userId});
};








//lookup a unit by Id and return the document converted to "type"
//@todo: catch exceptions / undefined checks
Units.findById = function(id){
	doc = Units.findOne({_id: id});
	return convertDocumentToUnit(doc);
};

//'classcast' the unit document to the according unit type
convertDocumentToUnit = function(doc){
	type = "Unit"; //default unit type
	if(undefined !== doc.type) type = doc.type;
	unit = new window[type]; //create instance of 'type'
	//fill properties with content from doc
	for(var propertyName in unit) {
		unit[propertyName] = doc[propertyName];
	}
	return unit;
};
