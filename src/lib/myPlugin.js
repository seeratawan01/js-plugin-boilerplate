// import dependencies
import { concat } from '../util/string';


export var myPlugin = (function () {

    'use strict';

    // Constructor
    var MyPlugin = function (elem, options) {
        this.elem = elem;
        // Default settings
        this.defaults = {
            message: 'Hello, world!',
            selector: '#app'
        };


        // Merge user options into defaults
        var settings = Object.assign({}, this.defaults, options);

        console.log(settings, this.defaults)
        somePrivateMethod();

    };

    // Methods
    //

	/**
	 * A private method
	 */
    var somePrivateMethod = function () {
        // Code goes here...
        console.log("private")
    };

	/**
	 * A public method
	 */
    MyPlugin.prototype.doSomething = function () {
        // somePrivateMethod();
        console.log("Public")
        // Code goes here...
    };

    return MyPlugin;

})();
