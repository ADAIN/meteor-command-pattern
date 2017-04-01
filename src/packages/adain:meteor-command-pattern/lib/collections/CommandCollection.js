/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command collection
 */

import CommandPublishPermission from '../CommandPublishPermission';  

const CommandCollection = new Mongo.Collection('Command');

if(Meteor.isServer){
  CommandCollection._ensureIndex({'stackName': 1, 'createdAt': 1});
}

CommandCollection.LOAD_COUNT = 20;

CommandCollection.allow({
  insert: function (userId, doc) {
    this.userId = userId;
    return CommandPublishPermission.check.call(this, doc.stackName);
  },
  update: function (userId, doc, fields, modifier) {
    this.userId = userId;
    return CommandPublishPermission.check.call(this, doc.stackName);
  },
  remove: function (userId, doc) {
    this.userId = userId;
    return CommandPublishPermission.check.call(this, doc.stackName);
  },
  fetch: ['stackName', '_userId']
});

if(Meteor.isServer){
  Meteor.methods({
    'CommandCollection.methods.insert': function(data){
      check(data, Object);

      CommandPublishPermission.check.call(this, data.stackName);
      return CommandCollection.insert(data);
    },

    'CommandCollection.methods.update': function(query, data){
      check(query, Object);
      check(data, Object);

      CommandPublishPermission.check.call(this, query.stackName);
      return CommandCollection.update(query, data);
    },

    'CommandCollection.methods.remove': function(query){
      check(query, Object);

      CommandPublishPermission.check.call(this, query.stackName);
      return CommandCollection.remove(query);
    },
    
    'CommandCollection.methods.getTotalAndLast': function(data){
      check(data, Object);

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
    }
  });
}

export default CommandCollection;