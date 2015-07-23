/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : MyCommand
 */

/**
 * add div command
 * @class
 */
AddDivCommand = new Class(Command);
AddDivCommand.extend({

  /**
   * class type
   */
  type: "AddDivCommand",

  /**
   * exec
   * @method
   * @override
   */
  exec: function(){
    $("body").append("<div id='" + this.guid + "'>" + this.property.text + "</div>");
  },

  /**
   * undo
   * @override
   * @method
   */
  undo: function(){
    $("#" + this.guid).remove();
  }
});

/**
 * add to command factory
 */
CommandFactory.add('AddDivCommand', AddDivCommand);