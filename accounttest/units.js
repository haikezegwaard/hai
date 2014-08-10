//
//Model: class definition
//

//class descriptor of the Unit type: base class used for extending
//this elementary unit has only coordinates, userId for owning user, timestamp for creation 
Unit = function(X, Y, userId) {
	this.X = X;
	this.Y = Y;
	this.userId = userId;
	this.EPSG = 'EPSG:3857'; 
	this.time = Date.now();
	this.type = "Unit"; //used to factor classes out of json models
};

//Now declare 'Settler', an extension of 'Unit':
Settler = function(X, Y, userId, hai) { //add the 'hai factor'	
	//Unit generic props
	Unit.call(this, X, Y, userId);
	//Settler specific props
	this.type = "Settler";
	this.hai = hai; //set the hai factor
};
//let Settler inherit of Unit, by setting the prototype of Settler to Unit's
Settler.prototype = Object.create(Unit.prototype);

