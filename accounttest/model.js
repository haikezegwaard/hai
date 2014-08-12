//Collections to be published should go here.
Units = new Meteor.Collection("units");
//abstract unit collection, each unit has an owner (a user);
// Units._ensureIndex( { loc: "2d" } );

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

  range = [];   // a list of [long, lat] Arrays

  // create the polygon range
  // TODO: sort? include the item's hai factor (or range)
  units.forEach(function(o){
    if(o.loc){
      range.push([
        o.loc[1],
        o.loc[0]
      ]);
    }
  });

  //if(range.length < 3) return Units.find({_id:-1}); //empty
/* does not work in minimongo (clientside)?*/
  if(Meteor.isServer){
  return Units.find({
    userId: {$ne: userId},
    loc: {
      $within: {
        $polygon: range
      }
    }
  });
  }else{
	  return Units.find({userId: {$ne: userId}});
  }
  
  //return Units.find({userId: {$ne: userId}});
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
  doc.type = doc.type || 'Unit';
  return new HAI[doc.type](doc);
};
