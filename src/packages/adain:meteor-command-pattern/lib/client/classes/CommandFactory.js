/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 17.
 * description : command factory
 */

CommandFactory = {
  commandList: {},

  /**
   * add command to list
   * @param commandName
   * @param commandClass
   */
  add(commandName, commandClass){
    this.commandList[commandName] = commandClass;
  }

};