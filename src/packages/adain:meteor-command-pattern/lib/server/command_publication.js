/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command publication
 */

Meteor.publish('command', function (stackName) {
  check(stackName, String);
  if(this.userId){
    return CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
  }else{
    this.ready();
  }
});