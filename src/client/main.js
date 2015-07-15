/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : main
 */

var stack;

Template.main.onCreated(function () {
  stack = new CommandStack('inc');
});

Template.main.onRendered(function () {
});

Template.main.onDestroyed(function () {
});

Template.main.helpers({});

Template.main.events({
  'click .add': function(){

    var myCommand = new AddDivCommand(stack, null, {
      text: 'hi'
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
