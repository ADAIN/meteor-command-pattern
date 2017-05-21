/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command collection
 */

import CommandWritePermission from '../CommandWritePermission';
import CommandPublishPermission from '../CommandPublishPermission';

const CommandCollection = new Mongo.Collection('Command');

if(Meteor.isServer){
  CommandCollection._ensureIndex({'stackName': 1, 'createdAt': 1});
}

CommandCollection.LOAD_COUNT = 20;

CommandCollection.allow({
  insert: function (userId, doc) {
    this.userId = userId;
    return CommandWritePermission.check.call(this, doc.stackName);
  },
  update: function (userId, doc, fields, modifier) {
    return doc._userId === userId;
  },
  remove: function (userId, doc) {
    return doc._userId === userId;
  },
  fetch: ['stackName', '_userId']
});

if(Meteor.isServer){
  Meteor.methods({
    'CommandCollection.methods.insert': function(data){
      check(data, Object);

      this.unblock();
      
      CommandWritePermission.check.call(this, data.stackName);
      return CommandCollection.insert(data);
    },

    'CommandCollection.methods.update': function(query, data){
      check(query, Object);
      check(data, Object);

      this.unblock();

      CommandWritePermission.check.call(this, query.stackName);
      return CommandCollection.update(query, data);
    },
    
    'CommandCollection.methods.updateCommands': function(data){
      check(data, Object);
      
      this.unblock();
      CommandWritePermission.check.call(this, data.stackName);
      
      _.each(data.targetCommands, (command)=>{
        CommandCollection.update(command._id, {$set: {isRemoved: data.isRemoved}});
      });
    },

    'CommandCollection.methods.remove': function(query){
      check(query, Object);

      this.unblock();

      CommandWritePermission.check.call(this, query.stackName);
      return CommandCollection.remove(query);
    },
    
    'CommandCollection.methods.getTotalAndLast': function(data){
      check(data, Object);

      this.unblock();

      CommandPublishPermission.check.call(this, data.stackName);
      
      let query = {stackName: data.stackName};
      if(!data.isGlobal){
        query._userId = Meteor.userId();
      }
      
      let last = CommandCollection.findOne(query, {sort: {createdAt: 1}, fields: {createdAt: 1}});
      return {
        total: CommandCollection.find(query).count(),
        last: last ? last.createdAt.getTime() : false
      };
    },
    
    'CommandCollection.methods.getUndoToCommandData': function(commandData){
      check(commandData, Object);

      this.unblock();

      CommandPublishPermission.check.call(this, data.stackName);
      
      let query = {stackName: commandData.stackName, isRemoved: false, createdAt: {$gte: commandData.createdAt}};
      return CommandCollection.find(query, {sort: {createdAt: -1}}).fetch();
    },

    'CommandCollection.methods.getRedoToCommandData': function(commandData){
      check(commandData, Object);
      
      this.unblock();

      CommandPublishPermission.check.call(this, data.stackName);

      let query = {stackName: commandData.stackName, isRemoved: true, createdAt: {$lte: commandData.createdAt}};
      return CommandCollection.find(query, {sort: {createdAt: 1}}).fetch();
    }
  });
}

export default CommandCollection;