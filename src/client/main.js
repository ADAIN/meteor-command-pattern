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

Template.main.helpers({
  canUndo: function(){
    return stack.canUndo.get();
  },

  canRedo: function(){
    return stack.canRedo.get();
  }
});

Template.main.events({
  'click .add': function(e, t){
    if(!Meteor.userId()){
      alert('You have to login first.');
      return;
    }
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
