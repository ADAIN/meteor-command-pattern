/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command stack
 */

/**
 * @class CommandStack command stack
 */
CommandStack = new Class({

  /**
   * initialize
   * @constructor
   * @param {string} stackName
   */
  initialize: function(stackName) {
    var self = this;
    this.stackName = stackName;
    this.clear();

    Meteor.subscribe('command', stackName, function(){
      var command;
      self.commandCursor = CommandCollection.find({stackName: stackName}, {sort: {createdAt: 1}});
      self.commandCursor.observe({
        added: function(doc){
          var index = self._stack.indexOf(_.findWhere(self._stack, {guid: doc.guid}));
          if(index === -1){
            command = new window[doc.type](self, doc._userId, doc.property, doc.guid);
            command.execute(false);
            self.push(command, false);
          }
        },
        removed: function(doc){

        }
      });
    });
  },

  /**
   * clear
   * @method
   */
  clear: function() {
    this._stack = [];
    this.length = this.pointer = 0;
  },

  /**
   * push command
   * @method
   * @param {Command} command
   * @param {boolean} [isApplyCollection]
   */
  push: function(command, isApplyCollection) {

    if(isApplyCollection === undefined){
      for(var i = this.pointer;i < this.length;i++){
        CommandCollection.remove({_id: this._stack[i]._id});
      }
    }

    this._stack.splice(this.pointer, this.length);
    this._stack.push(command);
    this.length = this.pointer = this._stack.length;

    // apply database collection
    if(isApplyCollection === undefined){
      command._id = CommandCollection.insert(command.getData());
    }
  },

  /**
   * step to
   * @method
   * @param position
   */
  stepTo: function(position) {
    if (position < 0 || position > this.length) return;
    var i, n;

    switch (true) {
      case position > this.pointer :
        for (i = this.pointer, n = position; i < n; i++)
          this._stack[i].execute(false);
        break;

      case position < this.pointer :
        if (this._redo && this._redo.execute) {
          this._redo.execute();
          for (i = 0, n = position; i < n; i++)
            this._stack[i].execute(false);
        } else {
          for (i = 0, n = this.pointer - position; i < n; i++)
            this._stack[this.pointer - i - 1].undo();
        }
        break;
    }
    this.pointer = position;
  },

  /**
   * undo
   */
  undo: function() {
    this.stepTo(this.pointer - 1);
  },

  /**
   * redo
   */
  redo: function() {
    this.stepTo(this.pointer + 1);
  }

});