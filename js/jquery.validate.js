// jquery.validator.js
// 
// 0.9
// 
// Stephen Band
// 
// Parts of this plugin are inspired by jquery.validate.js (Jörn Zaefferer) -
// indeed some regex is borrowed from there.
//
// Options:
// 
// errorSelector - Selector for the closest element to a failed field where
//								 errorClass is added. By default this is the input or
//								 textarea field itself.
// errorClass		 - Class that is applied to the field (or it's closest
//								 errorSelector) when it fails validation. Default is 'error'.
// errorNode		 - A jQuery object that is cloned and used as a container
//								 for all error messages.
// autocomplete	 - Overides the form's own autocomplete attribute, which is
//								 useful when validating on keyup events.
//
// Rules are depend on a field's attributes. To define a new rule, add an
// attribute to test for:
//
// jQuery.fn.validator.attributes['data-attribute'] = function(value, attributeValue, passFn, failFn) {
//	 // Validation logic
//	 // return pass( newValue [optional] ) or fail( errorMessage [optional] )
// }

(function (module) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], module);
	} else {
		// Browser globals
		module(jQuery);
	}
})(function(jQuery, undefined){
	var options = {
				errorClass: "error",
				errorNode: jQuery('<label/>', { 'class': 'error_label' }),
				errorSelector: "input, textarea"
			},
			
			errorMessages = {
				// Types
				url: 'That doesn\'t look like a valid URL',
				email: 'Enter a valid email',
				number: 'That\'s not a number.',
				
				// Attributes
				required: 'Required',
				minlength: 'At least {{attr}} characters',
				maxlength: 'No more than {{attr}} characters',
				min: 'Minimum {{attr}}',
				max: 'Maximum {{attr}}'
			},
			
			debug = (window.console && window.console.log),
			
			// Regex
			regex = {
				//url:			/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
				url:			/^(http\:\/\/)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,6}/,
				email:		/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
				number:		/^(\d+\.?\d+?)$/,
				color:		/^#([0-9a-fA-F]{6})$/
			},
			
			// html5 input types
			types = {
				// type url reports type text in FF3.6
				url: {
					test: function( value ) { return regex.url.test(value); },
					autocomplete: function( value ) {
						var autovalue = 'http://' + value;
						return regex.url.test(autovalue) ? autovalue : undefined ;
					}
				},
				email: {
					test: function( value ) { return regex.email.test(value); }
				},
				number: {
					test: function( value ) { return regex.number.test(value); }
				},
				color: {
					test: function( value ) { return regex.number.test(value); }
				}
				//datetime: {},
				//date: {},
				//month: {},
				//week: {},
				//time: {},
				//'datetime-local': {},
				//range: {},
				//tel: {},
				//search: {},
			},

			
			attributes = {
				type: function( value, type, pass, fail, autocomplete ){
					var autovalue;
					//console.log( value, type, pass, fail, autocomplete );
					return (
						(!value || !types[type] || types[type].test(value)) ? pass() :
						autocomplete && ( autovalue = types[type].autocomplete(value) ) ? pass(autovalue) :
						fail( errorMessages[type] )
					);
				},
				
				required: function( value, attr, pass, fail ) {
					return ( !!value ) ?
						pass() :
						fail( jQuery.render(errorMessages.required, {attr: attr}) ) ;
				},
				
				minlength: function( value, attr, pass, fail ) {
					return ( !value || value.length >= parseInt(attr) ) ?
						pass() :
						fail( jQuery.render(errorMessages.required, {attr: attr}) ) ;
				},
				
				maxlength: function( value, attr, pass, fail ) {
					var number = parseInt( attr );
					
					// Be careful, if there is no value maxlength is implicitly there
					// whether it's in the html or not, and sometimes it's -1
					return ( !value || number === -1 || value.length <= number ) ?
						pass() :
						fail( jQuery.render(errorMessages.required, {attr: attr}) ) ;
				},
				
				min: function( value, attr, pass, fail ) {
					return ( !value || parseFloat(attr) <= parseFloat(value) ) ?
						pass() :
						fail( jQuery.render(errorMessages.required, {attr: attr}) ) ;
				},
				
				max: function( value, attr, pass, fail ) {
					return ( !value || parseFloat(attr) >= parseFloat(value) ) ?
						pass() :
						fail( jQuery.render(errorMessages.required, {attr: attr}) ) ;
				}
				//pattern: function( value, attr, pass, fail ) {
				//	return ( !value );
				//}
			};
	
	// Here's the meat and potatoes
	function handle(node, options){
		var field = jQuery(node),
				value = jQuery.trim( field.val() ),
				data = field.data('validate'),
				// Adding this option as a quick fix for unwanted autocompletion
				// happening on the change event. In reality, we may have to
				// rethink autocomplete a bit.
				autocomplete = (options.autocomplete !== undefined) ? options.autocomplete : field.attr( 'autocomplete' ) === 'on' ,
				passFlag = true,
				stopTestFlag = false,
				attr, attrval, rule, response;
		
		for (attr in attributes) {
		  // We use getAttribute rather than .attr(), because
		  // it returns the original value of the attribute rather
		  // than the browser's interpretation.
			attrval = field[0].getAttribute( attr );
			
			if ( attrval ) {
				attributes[attr]( value, attrval, function( autoval ){
					// The test has passed
					
					if ( autoval ) {
						value = autoval;
						field.val(autoval);
					}
					
					// Remove the error message
					if ( data && data[attr] === false ) {
						data[attr] = true;
						data.errorNode.remove();
					}
					
				}, function( message ){
					// The test has failed
					
					var response = options.fail && options.fail.call(node, value, message);
					
					// If the fail callback returns a value, override the
					// failure, and put that value in the field.
					if ( response ) {
						
						value = response;
						field.val(response);
						
						// Remove the error message
						if ( data && data[attr] === false ) {
							data[attr] = true;
							data.errorNode.remove();
						}
					}
					// Otherwise, it's the end of the road for this one
					else {
						if (!data) {
							data = {
								errorNode: options.errorNode
									.clone()
									.attr("for", field.attr("id") || "" )
							};
							field.data('validate', data);
						}
						
						data.errorNode.html( message );
						
						data[attr] = false;
						
						field
						.before( data.errorNode )
						.closest( options.errorSelector )
						.addClass( options.errorClass );
						
						passFlag = false;
					}
					
					stopTestFlag = true;
				}, autocomplete );
			}
			
			// If we've been told to stop testing,
			// break out of this loop.
			if (stopTestFlag) {
				break;
			}
		}
		
		if (passFlag) {
			// Remove error class
			field
			.closest( '.' + options.errorClass )
			.removeClass( options.errorClass );
			
			// Fire callback with input as context and arguments
			// value(string), checked(boolean)
			options.pass && options.pass.call( node, value, field.attr('checked') );
			
			return true;
		}
	}
	
	jQuery.fn.validator = function(options){
		var o = jQuery.extend({}, jQuery.fn.validator.options, options);
		
		return this
		.bind('submit', { options: o }, function(e){
			var form = jQuery(this),
					data = form.data('validator'),
					rule, validator, fields;
			
			if (!data) {
				data = { attempt: 0 };
				form.data('validator', data);
			}
			
			fields = form
			.find( 'input, textarea' )
			.each( function(i){
				if ( !handle(this, o) ) { e.preventDefault(); }
			});
			
			if (debug) { console.log('submit'); }
			
			// Dont go on to delegate events when it has already been done
			// or when there's no fields to validate
			if ( data.attempt++ || fields.length === 0 ) { return; }
				
			form
			.delegate( 'input, textarea', 'change', function(){
				if (debug) { console.log('change'); }
				handle(this, o);
			});
			
			if (debug) { console.log('change events delegated'); }
		});
	};
	
	// Call .validate() on each of a forms inputs
	// and textareas, and call pass if everything
	// passed and fail if at least one thing failed
	function handleForm( node, options ){
		var failCount = 0;
		
		jQuery(node)
		.find("input, textarea")
		.validate({
			pass: function( value ){
				if (debug) { console.log( value + ' - PASS' ); }
			},
			fail: function( value ){
				if (debug) { console.log( value + ' - FAIL' ); }
				failCount++;
			}
		});
		
		if (failCount && options.fail) {
			options.fail.call(this);
		}
		else if (options.pass) {
			options.pass.call(this);
		}
	}
	
	jQuery.fn.validate = function(o){
		var options = jQuery.extend({}, jQuery.fn.validator.options, o);
		
		return this.each(function(i){
			var tagName = this.nodeName.toLowerCase();
			
			if (tagName === 'form') {
				handleForm(this, options);
			}
			else if (tagName === 'input' || tagName === 'textarea') {
				handle(this, options);
			}
		});
	};
	
	options.errorMessages = errorMessages;
	
	jQuery.fn.validator.regex = regex;
	jQuery.fn.validator.options = jQuery.fn.validate.options = options;
	jQuery.fn.validator.attributes = attributes;
});