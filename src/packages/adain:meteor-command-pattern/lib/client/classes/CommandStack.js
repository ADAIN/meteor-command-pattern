/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command stack
 */

import CommandCollection from '../../collections/CommandCollection';
import CommandFactory from './CommandFactory';

export const CommandStackEventType = {
  BEFORE_UNDO: "beforeUndo",
  AFTER_UNDO: "afterUndo",
  BEFORE_REDO: "beforeRedo",
  AFTER_REDO: "afterRedo"
}

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
   * @param {Boolean} [usePage] If use paging set true [Warning] If you want to use redoToCommand or undoToCommand, you should this option to false.
   */
  constructor(stackName, callback, isSkip = false, isGlobal = false, usePage = false) {
    const self = this;
    self.stackName = stackName;
    self.isGlobal = isGlobal;
    self.const = {
      EXEC: 'EXEC',
      UNDO: 'UNDO',
      REDO: 'REDO'
    };
    self.usePage = usePage;
    self.loadedCount = 0;
    self.totalCount = 0;
    self.isSkip = usePage ? true : isSkip;
    self._stack = {};
    self.subscription = [];
    self.canUndo = new ReactiveVar(false);
    self.canRedo = new ReactiveVar(false);
    self.isLoading = false;
    self.eventListeners = {};
    
    self.commandCursor = CommandCollection.find({stackName}, {sort: {createdAt: 1}});
    if(!usePage){
      self.isLoading = true;
      self.subscription.push(Meteor.subscribe('command', stackName, function(){
        self.isLoading = false;
        self.totalCount = CommandCollection.find({stackName}).count();

        self.observer = self.commandCursor.observe({
          added: function(doc){
            if(isSkip && self.loadedCount < self.totalCount){
              self.loadedCount++;
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

        self.checkUndoRedo();
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
      self.subscription.push(Meteor.subscribe('command:old', stackName, self.currentDateTime));
      self.subscription.push(Meteor.subscribe('command:latestUndo', self.stackName, ()=>{
        self.checkUndo();
      }));
      self.subscription.push(Meteor.subscribe('command:latestRedo', self.stackName, ()=>{
        self.checkRedo();
      }));

      if(callback) {
        callback(self);
      }
    }
  }

  /**
   * add event listener for stack event
   * @param eventType [beforeUndo, afterUndo, beforeRedo, afterUndo]
   * @param callback
   */
  addEventListener(eventType, callback){
    if(!this.eventListeners[eventType]){
      this.eventListeners[eventType] = [];
    }

    this.eventListeners[eventType].push(callback);

    return eventType + "_" + this.eventListeners[eventType].length - 1;
  }

  /**
   * remove event listener
   * @param id
   */
  removeEventListener(id){
    const idData = id.split('_');
    if(idData.length === 2){
      this.eventListeners[idData[0]].splice(parseInt(idData[1], 10), 1);

      if(this.eventListeners[idData[0]].length === 0){
        delete this.eventListeners[idData[0]];
      }
    }else{
      throw new Meteor.Error("CommandStack.removeEventListener [id] string is not correct." + id);
    }
  }
  
  /**
   * check user can undo or redo
   */
  checkUndoRedo(){
    this.checkUndo();
    this.checkRedo();
  }
  
  checkUndo(){
    if(this.isGlobal){
      this.canUndo.set(CommandCollection.find({stackName: this.stackName, isRemoved: false}).count() > 0);
    }else{
      this.canUndo.set(CommandCollection.find({stackName: this.stackName, _userId: Meteor.userId(), isRemoved: false}).count() > 0);
    }
  }
  
  checkRedo(){
    if(this.isGlobal){
      this.canRedo.set(CommandCollection.find({stackName: this.stackName, isRemoved: true}).count() > 0);
    }else{
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
    this.eventListeners = null;
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
    const commandData = this.getUndoData();
    if(
      this.eventListeners[CommandStackEventType.BEFORE_UNDO] &&
      this.eventListeners[CommandStackEventType.BEFORE_UNDO].length > 0
    ){
      const length = this.eventListeners[CommandStackEventType.BEFORE_UNDO].length;
      for (let i = 0; i < length; i++) {
        this.eventListeners[CommandStackEventType.BEFORE_UNDO][i](commandData);
      }
    }
    const result = this.undoCommand(commandData);
    if(
      this.eventListeners[CommandStackEventType.AFTER_UNDO] &&
      this.eventListeners[CommandStackEventType.AFTER_UNDO].length > 0
    ){
      const length = this.eventListeners[CommandStackEventType.AFTER_UNDO].length;
      for (let i = 0; i < length; i++) {
        this.eventListeners[CommandStackEventType.AFTER_UNDO][i](commandData);
      }
    }
    return result;
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
    const commandData = this.getRedoData();
    if(
      this.eventListeners[CommandStackEventType.BEFORE_REDO] &&
      this.eventListeners[CommandStackEventType.BEFORE_REDO].length > 0
    ){
      const length = this.eventListeners[CommandStackEventType.BEFORE_REDO].length;
      for (let i = 0; i < length; i++) {
        this.eventListeners[CommandStackEventType.BEFORE_REDO][i](commandData);
      }
    }
    const result = this.redoCommand(commandData);
    if(
      this.eventListeners[CommandStackEventType.AFTER_REDO] &&
      this.eventListeners[CommandStackEventType.AFTER_REDO].length > 0
    ){
      const length = this.eventListeners[CommandStackEventType.AFTER_REDO].length;
      for (let i = 0; i < length; i++) {
        this.eventListeners[CommandStackEventType.AFTER_REDO][i](commandData);
      }
    }
    return result;
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
  
  /**
   * undo to command point
   * @param targetCommands
   * @param callback
   */
  undoToCommand(targetCommands, callback){
    Meteor.call('CommandCollection.methods.updateCommands', {stackName: this.stackName, targetCommands, isRemoved: true}, (err)=>{
      if(!err){
        this.checkUndoRedo();
        if(callback){
          callback();
        }
      }else{
        throw err;
      }
    });
  }
  
  /**
   * redo to command point
   * @param targetCommands
   * @param callback
   */
  redoToCommand(targetCommands, callback){
    Meteor.call('CommandCollection.methods.updateCommands', {stackName: this.stackName, targetCommands, isRemoved: false}, (err)=>{
      if(!err){
        this.checkUndoRedo();
        if(callback){
          callback();
        }
      }else{
        throw err;
      }
    });
  }
}