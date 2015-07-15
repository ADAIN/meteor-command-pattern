/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : MyCommand
 */

/**
 * add div command
 * @class
 */
AddDivCommand = Command.extend({

  /**
   * class type
   */
  type: "AddDivCommand",

  /**
   * execute
   * @method
   * @override
   * @param isPush
   */
  execute: function(isPush){
    this.parent(isPush);
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