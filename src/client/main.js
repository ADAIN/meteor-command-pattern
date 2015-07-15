/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : main
 */

var stack = null;
var isReady = false;

Template.main.onCreated(function () {
  stack = new CommandStack('inc', function(){
    isReady = true;
  });
});

Template.main.onRendered(function () {
});

Template.main.onDestroyed(function () {
});

Template.main.helpers({});

Template.main.events({
  'click .add': function(e, t){

    var myCommand = new AddDivCommand(stack, Meteor.userId(), {
      text: t.$('#userInput').val()
    });
    myCommand.execute();
  },

  'click .undo': function(){
    stack.undo();
  },

  'click .redo': function(){
    stack.redo();
  }
});
