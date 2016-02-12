/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : Command
 */

/**
 * @class Command Command
 * @constructor
 */
Command = class Command {

  /**
   * init command
   * @param {CommandStack} stack
   * @param {string} [_userId]
   * @param {object} [property]
   * @param {string} [oldProperty]
   * @param {string} [guid]
   */
  constructor(stack, _userId, property, oldProperty, guid){
    this.type = 'Command';

    if(!guid) {
      this.guid = Guid.raw();
    }else{
      this.guid = guid;
    }
    this.stack = stack;
    this._userId = _userId;
    this.property = property || {};
    this.oldProperty = oldProperty || {};
  }

  /**
   * get command data
   * @returns {{guid: *, stackName: *, type: *, _userId: *, property: *}}
   */
  getData(){
    return {
      guid: this.guid,
      stackName: this.stack.stackName,
      type: this.type,
      _userId: this._userId,
      property: this.property,
      oldProperty: this.oldProperty
    };
  }

  /**
   * execute command
   */
  execute(){
    if(this.stack === undefined){
      console.error("Stack is undefined. You have to set the stack.");
      return;
    }

    this.stack.push(this);
  }

  /**
   * exec command
   * @method
   */
  exec(){

  }

  /**
   * undo command
   * @method
   */
  undo(){

  }

  /**
   * redo command
   */
  redo(){
    this.exec();
  }
};
