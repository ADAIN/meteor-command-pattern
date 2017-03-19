/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : Command
 */

/**
 * @class Command
 * @constructor
 */
export default class Command {

  /**
   * init command
   * @param {CommandStack} stack
   * @param {string} [_userId]
   * @param {object} [property]
   * @param {string} [oldProperty]
   * @param {string} [message]
   */
  constructor(stack, _userId, property, oldProperty, message){
    this.type = 'Command';
    this.stack = stack;
    this._userId = _userId;
    this.property = property || {};
    this.oldProperty = oldProperty || {};
    this.message = message || '';
  }

  /**
   * get command data
   * @returns {{stackName: *, type: *, _userId: *, property: *}}
   */
  getData(){
    return {
      stackName: this.stack.stackName,
      type: this.type,
      _userId: this._userId,
      property: this.property,
      oldProperty: this.oldProperty,
      message: this.message
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
}
