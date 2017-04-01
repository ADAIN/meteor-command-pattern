/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command publication
 */

import CommandCollection from '../collections/CommandCollection';
import CommandPublishPermission from '../CommandPublishPermission';

Meteor.publish('command', function (stackName, isGlobal) {
  check(stackName, String);
  check(isGlobal, Boolean);

  let query = {stackName: stackName};
  if(!isGlobal){
    query._userId = this.userId;
  }
  
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find(query, {sort: {createdAt: 1}});
    }else{
      this.ready();
    }  
  }catch(e){
    this.ready();
  }
});

Meteor.publish('command:old', function (stackName, datetime, isGlobal) {
  check(stackName, String);
  check(datetime, Number);
  check(isGlobal, Boolean);
  
  let query = {stackName: stackName, createdAt: {$lt: new Date(datetime)}};
  if(!isGlobal){
    query._userId = this.userId;
  }
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find(query, {sort: {createdAt: -1}, limit: CommandCollection.LOAD_COUNT});
    }else{
      this.ready();
    }
  }catch(e){
    this.ready();
  }
});

Meteor.publish('command:latestUndo', function (stackName) {
  check(stackName, String);

  let query = {stackName: stackName, isRemoved: false};
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find(query, {sort: {createdAt: -1}, limit: 5});
    }else{
      this.ready();
    }
  }catch(e){
    this.ready();
  }
});

Meteor.publish('command:latestRedo', function (stackName) {
  check(stackName, String);

  let query = {stackName: stackName, isRemoved: true};
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find(query, {sort: {createdAt: 1}, limit: 5});
    }else{
      this.ready();
    }
  }catch(e){
    this.ready();
  }
});

Meteor.publish('command:new', function (stackName, datetime, isGlobal){
  check(stackName, String);
  check(datetime, Number);
  check(isGlobal, Boolean);

  let query = {stackName: stackName, createdAt: {$gte: new Date(datetime)}};
  if(!isGlobal){
    query._userId = this.userId;
  }
  try{
    if(CommandPublishPermission.check.call(this, stackName)){
      return CommandCollection.find(query, {sort: {createdAt: 1}});
    }else{
      this.ready();
    }
  }catch(e){
    this.ready();
  }
});