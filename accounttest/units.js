// meteor puts global variable inside its own object hence `this`
if(this['HAI']===undefined)
  HAI = {};

//
// Model: class definition
//

// class descriptor of the Unit type: base class used for extending
// this elementary unit has only coordinates, userId for owning user,
// timestamp for creation
// When only a single argument is provided, this argument is
// considered to be a document object describing this unit.

HAI.Unit = function(X, Y, userId) {

  var doc = {
    UPSG: 'EPSG:3857',
    time: Date.now(),
    type: 'Unit'
  };

  // if exactly 1 argument provided
  if(Y === undefined){
    _.extend(doc, X);
  } else {
    _.extend(doc, {
      X: X,
      Y: Y,
      userId: userId
    });
  }

  // holds this Unit's owner
  this._user = undefined;

  // holds this Unit's OL feature
  this.olFeature = undefined;

  HAI.debug('Creating Unit instance', doc);

  // extend this instance with doc's properties
  _.extend(this, doc);

};

HAI.Unit.prototype.getUser = function(){
  if(this._user !== undefined)
    return this._user;
  this._user = Users.findByUnit(this);
  return this._user;
};

HAI.Unit.prototype.popupContent = function(){
  return [
    'id: ' + this._id,
    'owner: ' + this.getUser().username,
    'date: ' + this.time,
    'type: ' + this.type
  ].join('<br />');
};

HAI.Unit.prototype.delete = function(){
  Units.remove(this._id);
};


// Settler extends Unit
HAI.Settler = function(X, Y, userId, hai) {
  HAI.Unit.apply(this, arguments);

  this.type = "Settler";
  if(hai !== undefined)
    this.hai = hai; //set the hai factor

};

HAI.Settler.prototype = Object.create(HAI.Unit.prototype);

HAI.Settler.prototype.popupContent = function(){
  return [
    // super.popuContent(args)
    HAI.Unit.prototype.popupContent.apply(this, arguments),
    'hai: '+ this.hai
  ].join('<br />');
};
