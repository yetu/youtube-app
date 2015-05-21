/* global module */
/*
 * Filter to convert new lines to br tags
 */
module.exports = (function() {
    return function(text){
        return text ? text.replace(/\n/g, '<br/>') : '';
    };
});