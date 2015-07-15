/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command publication
 */

Meteor.publish('command', function (stackName) {
  return CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
});

Meteor.publish('commandStack', function(stackName){
  return CommandCollection.find({stackName: stackName});
});