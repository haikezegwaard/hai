Template.hai.settlers = function(){
    return Settlers.find();
}

Template.playerlist.players = function() {
    return Players.find();
}

Template.lobby.me = function(){
    return Session.get('current_player_id');
}

Template.loginform.events({
    'click input.loginbutton' : function () {
        console.log('login/register');
        var name = $('myname').val();
        var curid;
        var result = Players.find({name: name});
	if(result.count() === 0){
	    Players.insert({name: name}, function(err, docsInserted){
		if(err) return;
		console.log(docsInserted);
	    });
	}else{
	    Session.set('current_player_id', result.id );
	}
	
    }
});


