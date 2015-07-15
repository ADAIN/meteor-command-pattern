/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command collection
 */

CommandCollection = new Mongo.Collection('Command');

if(Meteor.isServer){
  CommandCollection._ensureIndex('stackName');
  CommandCollection._ensureIndex('_userId');
}