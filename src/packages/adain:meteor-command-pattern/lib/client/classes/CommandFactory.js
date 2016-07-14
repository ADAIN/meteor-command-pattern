/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 17.
 * description : command factory
 */

export default CommandFactory = {

  /**
   * command list
   */
  commandList: {},
  
  /**
   * add command to list
   * @param {String} commandName
   * @param {String} commandClass
   */
  add(commandName, commandClass){
    this.commandList[commandName] = commandClass;
  }

};