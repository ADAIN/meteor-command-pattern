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
   * @param {string} type
   * @param {string} [_userId]
   * @param {object} [property]
   * @param {string} [guid]
   */
  constructor(stack, _userId, property, guid){
    this.type = this.constructor.name;

    if(!guid) {
      this.guid = Guid.raw();
    }else{
      this.guid = guid;
    }
    this.stack = stack;
    this._userId = _userId;
    this.property = property;
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
      property: this.property
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

    this.stack.push(this, true);
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
};
