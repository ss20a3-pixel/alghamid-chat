// compat.js — Safe getter for older browsers that don't support ?.
function _g(obj, path) {
  if (!obj) return undefined;
  var parts = path.split('.');
  var current = obj;
  for (var i = 0; i < parts.length; i++) {
    if (current == null) return undefined;
    current = current[parts[i]];
  }
  return current;
}
function _el(id) { return document.getElementById(id) || {value:'',textContent:'',classList:{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false}},style:{},remove:function(){},focus:function(){},addEventListener:function(){}}; }
