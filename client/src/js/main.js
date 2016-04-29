var main = (function(){

    function cacheDOMSelectors(){

    }

    return {
        init: function init(){
            console.log("main init");
            cacheDOMSelectors();
        }
    };

})();

$(function(){
    main.init();
});