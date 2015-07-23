/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : Command
 */

/**
 * @class Command Command
 * @constructor
 */
Command = new Class({

  /**
   * type
   */
  type: 'Command',

  /**
   * initialize command
   *
   * @method
   * @param {CommandStack} stack
   * @param {string} type
   * @param {string} [_userId]
   * @param {object} [property]
   * @param {string} [guid]
   */
  initialize: function(stack, _userId, property, guid){
    if(!guid) {
      this.guid = Guid.raw();
    }else{
      this.guid = guid;
    }
    this.stack = stack;
    this._userId = _userId;
    this.property = property;
  },

  /**
   * get command data
   * @returns {{guid: *, stackName: *, type: *, _userId: *, property: *}}
   */
  getData: function(){
    return {
      guid: this.guid,
      stackName: this.stack.stackName,
      type: this.type,
      _userId: this._userId,
      property: this.property
    };
  },

  /**
   * execute command
   */
  execute: function(){
    this.stack.push(this, true);
  },

  /**
   * exec command
   * @method
   * @param {boolean} [isPush]
   */
  exec: function(){

  },

  /**
   * undo command
   * @method
   */
  undo: function(){

  }
});
