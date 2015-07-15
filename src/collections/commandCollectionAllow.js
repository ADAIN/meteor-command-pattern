/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : command collection allow setting
 */

CommandCollection.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  },
  fetch: ['_userId']
});