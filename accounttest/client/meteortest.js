//Configure the accounts-password package to use only username and password 
//in login/register dialogs
Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

//make users reactive for template to see
Template.userList.users = function(){
    return Meteor.users.find();
};

//change the class of span according to online-status of user
Template.userPill.labelClass = function() {
  if (this.status.idle)
    return "label-warning"
  else if (this.status.online)
    return "label-success"
  else
    return "label-default"
};
