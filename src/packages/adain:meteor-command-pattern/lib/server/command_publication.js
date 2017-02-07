/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command publication
 */

import CommandCollection from '../collections/CommandCollection';
import CommandPublishPermission from './CommandPublishPermission';

Meteor.publish('command', function (stackName) {
  check(stackName, String);
  if(CommandPublishPermission.check.call(this, stackName)){
    return CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
  }else{
    this.ready();
  }
});