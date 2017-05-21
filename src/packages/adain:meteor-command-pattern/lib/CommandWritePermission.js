/**
 * Author : SungYong Jang, jsy@adain.kr
 * Date : 2/3/17
 * Description : CommandWritePermission class
 */

const CommandWritePermission = {};

/**
 * check write permission
 * @param stackName
 * @returns {boolean}
 */
CommandWritePermission.check = function(stackName){
  return true;
};

export default CommandWritePermission;