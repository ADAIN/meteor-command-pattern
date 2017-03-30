/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command collection
 */

const CommandCollection = new Mongo.Collection('Command');

if(Meteor.isServer){
  CommandCollection._ensureIndex({'stackName': 1, 'createdAt': 1});
}

CommandCollection.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    return (userId && doc._userId === userId);
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc._userId === userId;
  },
  remove: function (userId, doc) {
    return doc._userId === userId;
  },
  fetch: ['_userId']
});

if(Meteor.isServer){
  Meteor.methods({
    'CommandCollection.methods.insert': function(data){
      check(data, Object);

      if(this.userId){
        return CommandCollection.insert(data);
      }

      return null;
    },

    'CommandCollection.methods.update': function(query, data){
      check(query, Object);
      check(data, Object);

      if(this.userId){
        return CommandCollection.update(query, data);
      }
    },

    'CommandCollection.methods.remove': function(query){
      check(query, Object);

      if(this.userId){
        return CommandCollection.remove(query);
      }
    }
  });
}

export default CommandCollection;