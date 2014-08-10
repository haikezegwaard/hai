if(this['HAI']===undefined)
  HAI = {};

// debug function, NOP when not developing
HAI.debug = function(){
  if(console !== undefined)
    console.log.apply(console, arguments);
};
