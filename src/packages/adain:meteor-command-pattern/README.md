# meteor-command-pattern
- Implement command pattern using meteor collection with user account system.
- Every commands need user id to execute.
- Undo & Redo is working with user account.
- try sample project [http://meteor-command.meteor.com] [https://github.com/ADAIN/meteor-command-pattern]
- use ecmascript

# Usage

## Add packages
```bash
$ meteor add adain:meteor-command-pattern
```
## Make custom command
```javascript

import { Command, CommandFactory } from 'meteor/adain:meteor-command-pattern';

/**
 * add div command
 * @class
 */
export default class CustomCommand extends Command{

  /**
   * init command
   * @param {CommandStack} stack
   * @param {string} [_userId]
   * @param {object} [property]
   * @param {string} [oldProperty]
   */
  constructor(stack, _userId, property, oldProperty){
    super(stack, _userId, property, oldProperty);
    this.type = 'CustomCommand';
  }
  
  /**
   * exec
   * @method
   * @override
   */
  exec(){
    // you can access property using this.property or this.oldProperty
    // every command has this.guid for identify
    doSomething();
  }

  /**
   * undo
   * @override
   * @method
   */
  undo(){
    undoSomething();
  }
};

// add to command factory
CommandFactory.add("CustomCommand", CustomCommand);
```
## Make stack
```javascript
import { CommandStack } from 'meteor/adain:meteor-command-pattern';

let isReady = false;
// if this set true the commands will skip at the first time. This is useful when you using own serialize code.
let isSkip = false;
// if this set true global undo redo activate, false is user account base undo, redo
let isGlobal = true;
let stack = new CommandStack('myStack', function(){
  isReady = true;
}, isSkip, isGlobal);
```
## Execute command
```javascript
let myCommand = new CustomCommand(stack, Meteor.userId(), {
  myData: data
});
myCommand.execute();
```
## Undo & Redo
```javascript
stack.undo();
stack.redo();
```
## canUndo, canRedo
```javascript
Template.main.helpers({
  canUndo: function(){
    return stack.canUndo.get();
  },

  canRedo: function(){
    return stack.canRedo.get();
  }
});
```
## Clear stack
stop subscription and observe
```javascript
stack.clear();
```

## Remove stack
remove all commands in stack
```javascript
stack.remove();
```

## Add publish permission (read permission)
```javascript
import {CommandPublishPermission} from 'meteor/adain:meteor-command-pattern';

CommandPublishPermission.check = function(stackName){
  // check permission logic
  // if Meteor.userId() has permission return true
  // if Meteor.userId() hasn't permission return false
  return true;
};
```

## Add Command write permission
```javascript
import {CommandWritePermission} from 'meteor/adain:meteor-command-pattern';

CommandWritePermission.check = function(stackName){
  // check permission logic
  // if Meteor.userId() has permission return true
  // if Meteor.userId() hasn't permission return false
  return true;
};
```
