// Handle form elements

(function (module) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], module);
	} else {
		// Browser globals
		module(jQuery);
	}
})(function(jQuery, undefined){
	var doc = jQuery(document);
	
	function fieldData(target) {
		var data = jQuery.data(target, 'field'),
		    field, name;
		
		if (!data){
			field = jQuery(target);
			name = field.attr('name');
			
			data = {
				field: field,
				label: jQuery('label[for="'+target.id+'"]')
			};
			
			// Store reference to label that is a direct wrap of the
			// target node.
			data.wrap = data.label.filter(function() {
				return (target.parentNode === this);
			});
			
			if (name) {
				data.fields = jQuery('input[name="'+name+'"]');
			}
			
			jQuery.data(target, 'field', data);
		}
		
		return data;
	}

	function name(obj) {
		return obj.name;
	}

	function removeText(elem) {
		// Remove text nodes only
		elem
		.contents()
		.filter(function() {
			return this.nodeType === (window.Node ? window.Node.TEXT_NODE : 3);
		})
		.remove();
	}

	function populateSelect(node){
		// Take a select node and put it's selected option content
		// in the associated label.

		var view = fieldData(node),
		    html;

		// Remove text nodes from the button
		removeText(view.wrap);
		
		// Prepend the current value of the select
		html = view.field.find('option[value="'+node.value+'"]').html();
		view.wrap.prepend(html);
	}
	
	function updateFileLabel(node) {
		// Take a select node and put it's selected option content
		// in the associated label.
		var view = fieldData(node),
		    files = node.files,
		    html = Array.prototype.map.call(files, name).join('<br/>');
		
		// Remove text nodes from the button
		removeText(view.wrap);
		
		view.wrap.prepend(html);
	}
	
	function updateRadioLabel() {
		var node = this,
		    data = fieldData(node);
		
		if (this.checked) {
		    data.label.addClass('on');
		}
		else {
		    data.label.removeClass('on');
		}
	}
	
	
	doc
	
	// Readonly inputs have their text selected when you click
	// on them.
	
	.on('focus click', 'input[readonly]', function(e) {
		jQuery(e.currentTarget).select();
	})
	
	// Extend the events emitted by input[type='range']
	// nodes with changestart and changeend events.
	
	.on('mousedown touchstart', 'input[type="range"]', (function(){
		var endTypes = {
			mousedown: 'mouseup',
			touchstart: 'touchend'
		};
		
		function change(e){
			jQuery(e.target)
			.trigger({ type: 'changestart' })
			.unbind('change', change);
		}
		
		function mouseup(e){
			jQuery(e.target)
			.trigger({ type: 'changeend' })
			.unbind('mouseup', mouseup);
		}
		
		return function(e){
			jQuery(e.target)
			.bind('change', change)
			.bind(endTypes[ e.type ], mouseup);
		};
	})())
	
	// Global form validation
	
	.on('change', 'input, textarea', function(e) {
		// Don't make this script require jQuery.fn.validate
		if (!jQuery.fn.validate) { return; }
		
		jQuery(this).validate({
			fail: function(){ e.preventDefault(); }
		});
	})
	
	// Active classes for radio input labels
	
	.on('change update', 'input[type="radio"]', function(e){
		var data = fieldData(e.target);
		
		if (data.fields) {
			data.fields.each(updateRadioLabel);
		}
	})
	
	// Active classes for checkbox input labels
	
	.on('change update', 'input[type="checkbox"]', function(e) {
		var data = fieldData(e.target);
		
		if (data.field.prop('checked')) {
			data.label.addClass('on');
		}
		else {
			data.label.removeClass('on');
		}
	})
	
	// For browsers that don't understand it, prevent changes on
	// disabled form elements.
	.on('change', '[disabled]', function(e) {
		// The nuclear approach
		e.preventDefault();
		e.stopPropagation();
		return false;
	})
	
	// Value display for select boxes that are wrapped in buttons
	// for style. The value is set as the content of the button.
	.on('change update', '.button > select', function(e) {
		populateSelect(e.target);
	})
	
	// Value display for file inputs that are wrapped in buttons
	// for style. Value is set as the text content of the button.
	.on('change update', '.button > input[type="file"]', function(e) {
		updateFileLabel(e.target);
	})
	
	.on('focusin focusout', '.button > select', function(e) {
		var view = fieldData(e.target);
		
		if (e.type === 'focusin') {
			view.wrap.addClass('focus');
		}
		else {
			view.wrap.removeClass('focus');
		}
	})
	
	.ready(function() {
		jQuery('.button > select').each(function() {
			populateSelect(this);
		});
		
		jQuery('input:checked').each(function() {
			var data = fieldData(this);
			data.label.addClass('on');
		});
	});
});