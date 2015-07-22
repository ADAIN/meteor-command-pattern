/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command stack
 */

/**
 * @class CommandStack command stack
 */
CommandStack = new Class({

  /**
   * initialize
   * @constructor
   * @param {string} stackName
   * @param {function} callback Fire when command subscribe is ready.
   */
  initialize: function(stackName, callback) {
    var self = this;
    this.stackName = stackName;
    this.clear();

    Meteor.subscribe('command', stackName, function(){
      self.commandCursor = CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
      self.commandCursor.observe({
        added: function(doc){
          if(!doc.isRemoved){
            self.execCommand(doc, true);
          }

          self.checkUndoRedo(stackName);
        },
        changed: function(doc){
          self.execCommand(doc, !doc.isRemoved);
          self.checkUndoRedo(stackName);
        },
        removed: function(doc){
          self._stack[doc.guid] = undefined;
          self.checkUndoRedo(stackName);
        }
      });

      if(callback) {
        callback(self);
      }
    });
  },

  /**
   * check user can undo or redo
   * @param stackName
   */
  checkUndoRedo: function(stackName){
    this.canUndo.set(CommandCollection.find({stackName: stackName, _userId: Meteor.userId(), isRemoved: false}).count() > 0);
    this.canRedo.set(CommandCollection.find({stackName: stackName, _userId: Meteor.userId(), isRemoved: true}).count() > 0);
  },

  /**
   * clear
   * @method
   */
  clear: function() {
    this._stack = {};
    this.canUndo = new ReactiveVar(false);
    this.canRedo = new ReactiveVar(false);
  },

  /**
   * execute command
   * @param commandData
   * @param isDo
   */
  execCommand: function(commandData, isDo){
    var command;
    var self = this;
    if(!self._stack[commandData.guid]){

      if(CommandFactory.commandList[commandData.type]){
        command = new CommandFactory.commandList[commandData.type](self, commandData._userId, commandData.property, commandData.guid);
      }else if(window[commandData.type]){
        command = new window[commandData.type](self, commandData._userId, commandData.property, commandData.guid);
      }

      if(!command){
        console.error(commandData.type + ' is not found.\nAdd your command to CommandFactory using CommandFactory.add("' + commandData.type + '", ' + commandData + ');');
      }

      self.push(command, false);
    }else{
      command = self._stack[commandData.guid];
    }

    if(isDo){
      command.do();
    }else{
      command.undo();
    }
  },

  /**
   * push command
   * @method
   * @param {Command} command
   * @param {boolean} isAddToCollection
   */
  push: function(command, isAddToCollection) {
    if(isAddToCollection){
      var commandData = command.getData();
      commandData.isRemoved = false;
      commandData.createdAt = new Date();

      var removedCommands = CommandCollection.find({stackName: this.stackName, _userId: Meteor.userId(), isRemoved: true}, {fields: {_id: 1}}).fetch();
      _.each(removedCommands, function(data){
        CommandCollection.remove(data._id);
      });

      CommandCollection.insert(commandData);

      this._stack[command.guid] = command;
    }
  },

  /**
   * undo
   */
  undo: function(){
    var commandData = CommandCollection.findOne({stackName: this.stackName, _userId: Meteor.userId(), isRemoved: false}, {sort: {createdAt: -1}});
    if(commandData){
      CommandCollection.update({_id: commandData._id}, {$set: {isRemoved: true}});
    }
  },

  /**
   * redo
   */
  redo: function(){
    var commandData = CommandCollection.findOne({stackName: this.stackName, _userId: Meteor.userId(), isRemoved: true}, {sort: {createdAt: 1}});
    if(commandData){
      CommandCollection.update({_id: commandData._id}, {$set: {isRemoved: false}});
    }
  }

});