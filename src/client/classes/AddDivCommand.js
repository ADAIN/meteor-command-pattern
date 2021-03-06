/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : MyCommand
 */

import { Command, CommandFactory } from 'meteor/adain:meteor-command-pattern';


/**
 * add div command
 * @class
 */
export default class AddDivCommand extends Command{

  /**
   * init command
   * @param {CommandStack} stack
   * @param {string} [_userId]
   * @param {object} [property]
   * @param {string} [oldProperty]
   */
  constructor(stack, _userId, property, oldProperty){
    super(stack, _userId, property, oldProperty);
    this.type = 'AddDivCommand';
  }

  /**
   * exec
   * @method
   * @override
   */
  exec(){
    $("body").append("<div id='" + this.guid + "'>" + this.property.text + "</div>");
  }

  /**
   * undo
   * @override
   * @method
   */
  undo(){
    $("#" + this.guid).remove();
  }
}

/**
 * add to command factory
 */
CommandFactory.add('AddDivCommand', AddDivCommand);