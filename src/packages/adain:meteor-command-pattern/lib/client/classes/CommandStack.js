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
   * @param {Function} [callback] Fire when command subscribe is ready.
   * @param {Boolean} [isSkip] If this set true the commands will skip at the first time. This is useful when you using own serialize code.
   * @param {Boolean} [isGlobal] If this set true global undo redo activate, false is user account base undo, redo
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
    self.loadedCount = 0;
    self.totalCount = 0;
    self.isSkip = isSkip;
    self._stack = {};
    self.subscription = [];
    self.canUndo = new ReactiveVar(false);
    self.canRedo = new ReactiveVar(false);

    self.commandCursor = CommandCollection.find({stackName}, {sort: {createdAt: 1}});
    
    if(!isSkip){
      self.observer = self.commandCursor.observe({
        added: function(doc){
          if(!doc.isRemoved){
            self.execCommand(doc, self.const.EXEC);
          }

          self.checkUndoRedo();

        },
        changed: function(doc){
          self.execCommand(doc, (doc.isRemoved) ? self.const.UNDO : self.const.REDO);
          self.checkUndoRedo();
        },
        removed: function(doc){
          self._stack[doc._id] = undefined;
          self.checkUndoRedo();
        }
      });
      self.subscription.push(Meteor.subscribe('command', stackName, function(){
        self.totalCount = CommandCollection.find({stackName}).count();
        if(callback) {
          callback(self);
        }
      }));
    }else{
      self.currentDateTime = (new Date()).getTime();
      self.startDateTime = self.currentDateTime;
      
      self.observer = self.commandCursor.observe({
        added: function(doc){
          if(doc.createdAt.getTime() < self.startDateTime){
            return;
          }
          if(!doc.isRemoved){
            self.execCommand(doc, self.const.EXEC);
          }

          self.checkUndoRedo();

        },
        changed: function(doc){
          self.execCommand(doc, (doc.isRemoved) ? self.const.UNDO : self.const.REDO);
          self.checkUndoRedo();
        },
        removed: function(doc){
          self._stack[doc._id] = undefined;
          self.checkUndoRedo();
        }
      });
      self.subscription.push(Meteor.subscribe('command:new', stackName, self.currentDateTime));
      Meteor.call('CommandCollection.methods.getTotalAndLast', {stackName}, (err, res)=>{
        if(!err && res){
          self.totalCount = res.total;
          self.last = res.last;
          self.loadMore(callback);
        }
      });
    }
  }

  /**
   * this function for isSkip === true, paging load
   * @param [callback]
   */
  loadMore(callback){
    const self = this;
    if(!self.last || self.currentDateTime === self.last){
      return;
    }

    self.subscription.push(Meteor.subscribe('command:old', self.stackName, self.currentDateTime, function(){
      let lastLoaded = CommandCollection.findOne({stackName: self.stackName}, {sort: {createdAt: 1}});
      if(lastLoaded){
        self.currentDateTime = lastLoaded.createdAt.getTime();
      }
      
      self.checkUndoRedo();
      if(callback) {
        callback(self);
      }
    }));
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
    if(this.observer){
      this.observer.stop();
    }
    if(this.subscription && this.subscription.length > 0){
      _.each(this.subscription, (subs)=>{
        if(subs){
          subs.stop();  
        }
      });
    }
    
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
    if(!self._stack[commandData._id]){

      if(CommandFactory.commandList[commandData.type]){
        command = new CommandFactory.commandList[commandData.type](self, commandData._userId, commandData.property, commandData.oldProperty, commandData._id);
      }else if(window[commandData.type]){
        command = new window[commandData.type](self, commandData._userId, commandData.property, commandData.oldProperty, commandData._id);
      }

      if(!command){
        console.error(`
        ${commandData.type} is not found.
        Add your command to CommandFactory using CommandFactory.add("' + commandData.type + '", ' + commandData + ');
        `);
      }
    }else{
      command = self._stack[commandData._id];
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

    this._stack[command._id] = command;

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
    return this.undoCommand(commandData);
  }

  /**
   * undo command with command data
   * @param commandData
   * @returns {*}
   */
  undoCommand(commandData){
    if(commandData){
      if(this.isGlobal || commandData._userId !== Meteor.userId()){
        Meteor.call('CommandCollection.methods.update', {_id: commandData._id}, {$set: {isRemoved: true}}, function(err){
          if(err){
            console.error(err);
          }
        });
      }else{
        CommandCollection.update({_id: commandData._id}, {$set: {isRemoved: true}});
      }
    }
    
    if(this.isSkip){
      this.loadMore();
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
    return this.redoCommand(commandData);
  }

  /**
   * redo command with command data
   * @param commandData
   * @returns {*}
   */
  redoCommand(commandData){
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