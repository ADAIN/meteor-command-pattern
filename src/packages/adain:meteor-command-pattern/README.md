# meteor-command-pattern
- Implement command pattern using meteor collection with user account system.
- Every commands need user id to execute.
- Undo & Redo is working with user account.
- try sample project [http://meteor-command.meteor.com] [https://github.com/ADAIN/meteor-command-pattern]

# Usage

## Make custom command        
    /**
     * add div command
     * @class
     */
    CustomCommand = new Class(Command); 
    CustomCommand.extend({
    
      /**
       * class type
       */
      type: "CustomCommand",
    
      /**
       * do
       * @method
       * @override
       */
      do: function(){
        // you can access property using this.property
        // every command has this.guid
        doSomething();
      },
    
      /**
       * undo
       * @override
       * @method
       */
      undo: function(){
        undoSomething();
      }
    });

    // add to command factory
    CommandFactory.add("CustomCommand", CustomCommand);

## Make stack
    var stack = new CommandStack('myStack', function(){
      isReady = true;
    });

## Execute command
    var myCommand = new CustomCommand(stack, Meteor.userId(), {
      myData: data
    });
    myCommand.execute();

## Undo & Redo
    stack.undo();
    stack.redo();
    