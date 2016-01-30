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
/**
 * add div command
 * @class
 */
CustomCommand = class CustomCommand extends Command{
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
// if this set true the commands will skip at the first time. This is useful when you using own serialize code.
var isSkip = false;
// if this set true global undo redo activate, false is user account base undo, redo
var isGlobal = true;
var stack = new CommandStack('myStack', function(){
  isReady = true;
}, isSkip, isGlobal);
```
## Execute command
```javascript
var myCommand = new CustomCommand(stack, Meteor.userId(), {
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