# meteor-command-pattern
- Implement command pattern using meteor collection with user account system.
- Every commands need user id to execute.
- Undo & Redo is working with user account.
- try sample project [http://meteor-command.meteor.com] [https://github.com/ADAIN/meteor-command-pattern]
- use ecmascript

# Usage

## Add packages
    meteor add adain:meteor-command-pattern

## Make custom command        
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
        // you can access property using this.property
        // every command has this.guid for identify
        doSomething();
      },
    
      /**
       * undo
       * @override
       * @method
       */
      undo(){
        undoSomething();
      }
    });

    // add to command factory
    CommandFactory.add("CustomCommand", CustomCommand);

## Make stack
    // if this set true the commands will skip at the first time. This is useful when you using own serialize code.
    var isSkip = false;
    // if this set true global undo redo activate, false is user account base undo, redo
    var isGlobal = true;
    var stack = new CommandStack('myStack', function(){
      isReady = true;
    }, isSkip, isGlobal);

## Execute command
    var myCommand = new CustomCommand(stack, Meteor.userId(), {
      myData: data
    });
    myCommand.execute();

## Undo & Redo
    stack.undo();
    stack.redo();
    