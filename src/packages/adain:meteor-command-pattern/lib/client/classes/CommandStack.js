/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command stack
 */

import CommandCollection from '../../collections/CommandCollection';
import CommandFactory from './CommandFactory';

/**
 * @class CommandStack command stack
 */
export default class CommandStack{

  /**
   * initialize
   * @constructor
   * @param {String} stackName
   * @param {Function} callback Fire when command subscribe is ready.
   * @param {Boolean} isSkip If this set true the commands will skip at the first time. This is useful when you using own serialize code.
   * @param {Boolean} isGlobal If this set true global undo redo activate, false is user account base undo, redo
   */
  constructor(stackName, callback, isSkip, isGlobal) {
    const self = this;
    self.stackName = stackName;
    self.isGlobal = !!isGlobal;
    self.const = {
      EXEC: 'EXEC',
      UNDO: 'UNDO',
      REDO: 'REDO'
    };
    isSkip = !!isSkip;
    self.clear();

    self.subscription = Meteor.subscribe('command', stackName, function(){
      self.commandCursor = CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
      self.totalCount = self.commandCursor.count();
      self.observer = self.commandCursor.observe({
        added: function(doc){
          if(isSkip && self.loadedCount < self.totalCount){
            self.loadedCount++;
            return;
          }

          if(!doc.isRemoved){
            self.execCommand(doc, self.const.EXEC);
          }

          self.checkUndoRedo(stackName);

        },
        changed: function(doc){
          self.execCommand(doc, (doc.isRemoved) ? self.const.UNDO : self.const.REDO);
          self.checkUndoRedo(stackName);
        },
        removed: function(doc){
          self._stack[doc.guid] = undefined;
          self.checkUndoRedo(stackName);
        }
      });

      self.checkUndoRedo(stackName);

      if(callback) {
        callback(self);
      }
    });
  }

  /**
   * check user can undo or redo
   */
  checkUndoRedo(){
    if(this.isGlobal){
      this.canUndo.set(CommandCollection.find({stackName: this.stackName, isRemoved: false}).count() > 0);
      this.canRedo.set(CommandCollection.find({stackName: this.stackName, isRemoved: true}).count() > 0);
    }else{
      this.canUndo.set(CommandCollection.find({stackName: this.stackName, _userId: Meteor.userId(), isRemoved: false}).count() > 0);
      this.canRedo.set(CommandCollection.find({stackName: this.stackName, _userId: Meteor.userId(), isRemoved: true}).count() > 0);
    }
  }

  /**
   * clear
   * @method
   */
  clear() {
    this._stack = {};
    this.canUndo = new ReactiveVar(false);
    this.canRedo = new ReactiveVar(false);
    if(this.observer){
      this.observer.stop();
    }
    if(this.subscription){
      this.subscription.stop();
    }
    this.loadedCount = 0;
    this.totalCount = 0;
    this.observer = null;
    this.subscription = null;
  }

  /**
   * remove command from database
   */
  remove() {
    Meteor.call('CommandCollection.methods.remove', {stackName: this.stackName}, function(err){
      if(err){
        console.error(err);
      }
    });
  }

  /**
   * execute command
   * @param {String} commandData
   * @param {String} type
   */
  execCommand(commandData, type){
    let command;
    const self = this;
    if(!self._stack[commandData.guid]){

      if(CommandFactory.commandList[commandData.type]){
        command = new CommandFactory.commandList[commandData.type](self, commandData._userId, commandData.property, commandData.oldProperty, commandData.guid);
      }else if(window[commandData.type]){
        command = new window[commandData.type](self, commandData._userId, commandData.property, commandData.oldProperty, commandData.guid);
      }

      if(!command){
        console.error(`
        ${commandData.type} is not found.
        Add your command to CommandFactory using CommandFactory.add("' + commandData.type + '", ' + commandData + ');
        `);
      }
    }else{
      command = self._stack[commandData.guid];
    }

    switch (type){
      case self.const.EXEC:
        _.delay(()=>{
          command.exec();
        }, 0);
        break;

      case self.const.UNDO:
        _.delay(()=>{
          command.undo();
        }, 0);
        break;

      case self.const.REDO:
        _.delay(()=>{
          command.redo();
        }, 0);
        break;
      
      default:
        console.error(`Undefined Command Type : ${type}`);
        break;
    }
  }

  /**
   * push command
   * @method
   * @param {Command} command
   */
  push(command) {
    let commandData = command.getData();
    commandData.isRemoved = false;
    commandData.createdAt = new Date();

    let query = {stackName: this.stackName, isRemoved: true};
    query._userId = Meteor.userId();

    if(this.isGlobal){
      Meteor.call('CommandCollection.methods.remove', query, function(err){
        if(err){
          console.error(err);
        }
      });
    }else{
      let removedCommands = CommandCollection.find(query, {fields: {_id: 1}}).fetch();
      _.each(removedCommands, function(data){
        CommandCollection.remove(data._id);
      });
    }

    this._stack[command.guid] = command;

    CommandCollection.insert(commandData);
  }

  /**
   * get undo data
   * @returns {any}
   */
  getUndoData(){
    let query = {stackName: this.stackName, isRemoved: false};
    if(!this.isGlobal){
      query._userId = Meteor.userId();
    }

    return CommandCollection.findOne(query, {sort: {createdAt: -1}});
  }

  /**
   * undo
   * @returns {Command}
   */
  undo(){
    let commandData = this.getUndoData();
    if(commandData){
      if(this.isGlobal && commandData._userId !== Meteor.userId()){
        Meteor.call('CommandCollection.methods.update', {_id: commandData._id}, {$set: {isRemoved: true}}, function(err){
          if(err){
            console.error(err);
          }
        });
      }else{
        CommandCollection.update({_id: commandData._id}, {$set: {isRemoved: true}});
      }
    }

    return commandData;
  }

  /**
   * get redo data
   */
  getRedoData(){
    let query = {stackName: this.stackName, isRemoved: true};
    if(!this.isGlobal){
      query._userId = Meteor.userId();
    }

    return CommandCollection.findOne(query, {sort: {createdAt: 1}});
  }

  /**
   * redo
   * @returns {Command}
   */
  redo(){
    let commandData = this.getRedoData();
    if(commandData){
      if(this.isGlobal && commandData._userId !== Meteor.userId()){
        Meteor.call('CommandCollection.methods.update', {_id: commandData._id}, {$set: {isRemoved: false}}, function(err){
          if(err){
            console.error(err);
          }
        });
      }else{
        CommandCollection.update({_id: commandData._id}, {$set: {isRemoved: false}});
      }
    }

    return commandData;
  }

}