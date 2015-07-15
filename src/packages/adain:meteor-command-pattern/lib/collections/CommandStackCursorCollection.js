/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command stack cursor
 */

CommandStackCursorCollection = new Mongo.Collection('CommandStackCursor');

if(Meteor.isServer){
  CommandStackCursorCollection._ensureIndex('stackName');
}