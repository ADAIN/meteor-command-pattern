/**
 * Author : SungYong Jang, jsy@adain.kr
 * Date : 2/3/17
 * Description : CommandPublishPermission class
 */

const CommandPublishPermission = {};

/**
 * check read permission
 * @param stackName
 * @returns {boolean}
 */
CommandPublishPermission.check = function(stackName){
  return true;
};

export default CommandPublishPermission;