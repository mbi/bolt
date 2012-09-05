// Listen for actions that trigger dropdowns, popdowns slides and tabs

(function(jQuery, bolt, undefined){
	var debug = (window.console && window.console.log),
	    
	    add = jQuery.event.add,
	    
	    remove = jQuery.event.remove,

	    trigger = function(node, type, data) {
	    	jQuery.event.trigger(type, data, node);
	    };
	
	function preventDefault(e) {
		e.preventDefault();
	}
	
	function isLeftButton(e) {
		// Ignore mousedowns on any button other than the left (or
		// primary) mouse button, or when a modifier key is pressed.
		return (e.which === 1 && !e.ctrlKey && !e.altKey);
	}

	jQuery(document)
	
	// Mousedown on buttons toggle activate on their targets
	.on('mousedown tap', 'a[href^="#"]', function(e) {
		var id, target, elem, data, clas;

		// Default is prevented indicates that this link has already
		// been handled. Save ourselves the overhead of further handling.
		if (e.isDefaultPrevented()) { return; }

		// Ignore mousedowns on any button other than the left (or primary)
		// mouse button, or when a modifier key is pressed.
		if (e.type === 'mousedown' && !isLeftButton(e)) { return; }

		id = e.currentTarget.hash.substring(1);
		target = document.getElementById(id);

		// This link does not point to an id in the DOM. No action required.
		if (!target) { return; }

		// Get the bolt data that may have been created by a previous
		// activate event.
		data = jQuery.data(target, 'bolt');

		// Decide what class this object is.
		if (data && data['class']) {
			elem = data.elem;
			clas = data['class'];
		}
		else {
			elem = jQuery(target);
			clas = bolt.classify(target);
		}

		// If it has no class, we have no business trying to activate
		// it on mousedown.
		if (!clas) { return; }

		e.preventDefault();

		// Prevent the click that follows the mousedown.
		// !TODO: this should happen only once!
		if (e.type === 'mousedown') { add(e.currentTarget, 'click', preventDefault); }

		if (!bolt.has(clas, 'activate')) { return; }

		if ((data && data.active) || (!data && elem.hasClass('active'))) { return; }

		// Attach bolt's data to the target
		if (!data) {
			jQuery.data(target, 'bolt', { 'class': clas, elem: elem });
		}

		trigger(target, { type: 'activate', relatedTarget: e.currentTarget });
	})

	// Mouseover on tip links toggle activate on their targets
	.on('mouseover mouseout tap', 'a[href^="#"], [data-tip]', function(e) {
		var href, node, elem, data, clas;
		
		href = e.currentTarget.getAttribute('data-tip');
		
		if (href && !(/^#/.test(href))) {
			// The data-tip attribute holds text. Create a tip node and
			// stick it in the DOM
			elem = jQuery('<div/>', {
				'class': 'tip',
				'text': href
			});
			node = elem[0];
			clas = 'tip';
			e.currentTarget.setAttribute('data-tip', '#' + bolt.identify(node));
			document.body.appendChild(node);
		}
		else {
			if (!href) {
				href = e.currentTarget.hash;
			}

			node = document.getElementById(href.substring(1));

			// If there is no node, there's no need to continue. Thanks.
			if (!node) { return; }

			// Get the bolt data that may have been created by a previous
			// activate event.
			data = jQuery.data(node, 'bolt');

			elem = (data && data.elem) || jQuery(node);
		}

		// Decide what class this object is.
		if (!clas) {
			clas = data && data['class'] ?
				data['class'] :
				bolt.classify(node) ;
		}

		if (clas && !data) {
		  jQuery.data(elem[0], 'bolt', { 'class': clas, elem: elem });
		}

		// If it has not the class 'tip', we have no business trying to
		// activate it on hover.
		if (clas !== 'tip') { return; }

		// Tap events should make tips show immediately
		if (e.type === 'tap') {
			elem.css(jQuery.prefix('transition')+'Delay', '0');
		}

		elem.trigger(e.type === 'mouseout' ? 'deactivate' : { type: 'activate', relatedTarget: e.currentTarget });
	});
})(jQuery, jQuery.bolt);