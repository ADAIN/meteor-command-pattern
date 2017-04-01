/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command publication
 */

import CommandCollection from '../collections/CommandCollection';
import CommandPublishPermission from '../CommandPublishPermission';

Meteor.publish('command', function (stackName) {
  check(stackName, String);
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
    }else{
      this.ready();
    }  
  }catch(e){
    this.ready();
  }
});

Meteor.publish('command:old', function (stackName, datetime) {
  check(stackName, String);
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find({stackName: stackName, createdAt: {$lte: new Date(datetime)}}, {sort: {createdAt: -1}, limit: 10});
    }else{
      this.ready();
    }
  }catch(e){
    this.ready();
  }
});

Meteor.publish('command:new', function (stackName, datetime){
  check(stackName, String);
  check(datetime, Number);
  
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find({stackName: stackName, createdAt: {$gt: new Date(datetime)}}, {sort: {createdAt: 1}});
    }else{
      this.ready();
    }
  }catch(e){
    this.ready();
  }
});