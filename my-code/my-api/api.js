//---------------------------------------------------------------------//

var map, marker, myLatlng, myOptions;

function loadMap() {
	myLatlng = new google.maps.LatLng(30.3753,69.3451);
	myOptions = {
    zoom: 6,
    center: myLatlng,
  }
  
	map = new google.maps.Map(document.getElementById("map"), myOptions);

  	marker = new google.maps.Marker({
		position: myLatlng, 
		map: map,
		draggable: true
	});

  google.maps.event.addListener(marker, 'dragend', function (event) {
	document.getElementById("lat").value = marker.getPosition().lat();
	document.getElementById("lng").value = marker.getPosition().lng();
	map.setCenter(marker.getPosition());
  });
}

function getLocation() {
	if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(showPosition);
	} else {
	  console.log("Geolocation is not supported by this browser.");
	}
  }
  
function showPosition(position) {
	document.getElementById("lat").value = position.coords.latitude;
	document.getElementById("lng").value = position.coords.longitude;
	marker.setPosition({
		lat: position.coords.latitude,
		lng: position.coords.longitude
	});
	map.setCenter(marker.getPosition());
	map.setZoom(12);
}

window.onload = getLocation();

//html edit:

//<!DOCTYPE html>
//<html>
//<head>
//	<title>Access Google Maps API</title>
//	
//	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
//	
//	<style type="text/css">
//		#map {
//			width: 100%;
//			height: 450px;
//			border: 1px solid #ccc;
//		}
//	</style>
//</head>
//<body>
//	<div class="container">
//		<h1 class="text-center text-danger">Access Google Maps API</h1><br>
//		<div id="map"></div>
//		<br>
//		<div class="row">
//			<div class="col-md-6"><input type="text" class="form-control" id="lat"></div>
//			<div class="col-md-6"><input type="text" class="form-control" id="lng"></div>
//		</div>
//	</div>
//</body>
//<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
//<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
//<script type="text/javascript" src="js/googlemap.js"></script>
//<script async defer
//    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDKrULIip5xWYjsplPu8P-Bi-sRiPOkCGQ&callback=loadMap">
//</script>
//</html>

//---------------------------------------------------------------------//

function decorate (initial, decorate_before, decorate_after) {
	return function () {
		var initial_call_result;

		if (typeof decorate_before === 'function') {
			if (!!decorate_before.apply(this, arguments) === false) {
				return;
			}
		}
		initial_call_result = initial.apply(this, arguments);
		if (typeof decorate_after === 'function') {
			decorate_after.apply(this, arguments);
		}
		return initial_call_result;
	};
}


function chain (func, callback) {
	var callbacks,
		func_states;

	callbacks = [];
	func_states = [];
	chain = function (func, callback) {
		var callback_index,
			chained,
			func_index;

		callback_index = callbacks.indexOf(callback);
		if (callback_index === -1) {
			chained = {
				func : [],
				state : [],
				test : function () {
					for (var i = 0; i < this.func.length; i += 1) {
						if (!this.state[i]) {
							return;
						}
					}
					callback();
					this.state = [];
				}
			};
			callbacks.push(callback);
			func_states.push(chained);
		} else {
			chained = func_states[callback_index];
		}

		func_index = chained.func.push(func) - 1;
		func = decorate(func, null, function () {
			chained.state[func_index] = true;
			chained.test();
		});
		return func;
	};
	return chain.apply(this, arguments);
}

/* example of use */

function on_all_async_ready () {
	console.log('all ready');
}

var on_2_of_3_ready = function () {
    console.info('1 and 2 ready');
}

var async_1 = chain(function () {
	console.info('first async');
}, on_all_async_ready);

async_1 = chain(async_1, on_2_of_3_ready);


var async_2 = chain(function () {
	console.info('second_async');
}, on_all_async_ready);

async_2 = chain(async_2, on_2_of_3_ready);


var async_3 = chain(function () {
	console.info('third async');
}, on_all_async_ready);


setTimeout(function () {
	async_1();
	setTimeout(async_2, 1000);
	setTimeout(async_3, 2000);
}, 2000);

//---------------------------------------------------------------------//

var event_manager = (function () {
	"use strict";

	var public_methods,
		index_of,
		bindings;

	public_methods = {};
	bindings = {};

	// returns index of the element
	index_of = (function () {
		var io;

		io = Array.prototype.indexOf;
		if (io) {
			return function (el, arr) {
				return io.call(arr, el);
			};
		} else {
			return function (el, arr) {
				var i;

				for (i = 0; i < arr.length; i += 1) {
					if (el === arr[i]) {
						return i;
					}
				}
				return -1;
			};
		}
	}());

	// you can modify it as deep, as you want
	function bind (obj, eventName, handler) {
		var handler_wrapper = function (event) {
			event = event || window.event;
			if (event.srcElement) {
				event.target = event.srcElement;
			}
			return handler.call(obj, event);
		};

		if (obj.addEventListener) {
			obj.addEventListener(eventName, handler_wrapper, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + eventName, handler_wrapper);
		}
		return handler_wrapper;
	}


	function unbind (obj, event_name, handler) {
		if (obj.removeEventListener) {
			obj.removeEventListener(event_name, handler, false);
		} else {
			obj.detachEvent('on' + event_name, handler);
		}
	}


	function is_empty_object (object) {
		var key;

		for (key in object) {
			if (object.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}

	function super_handler (event_name) {
		return function (event) {
			var selector,
				handlers,
				target_node,
				nodes_by_selector,
				i;

			target_node = event.target;
			for (selector in bindings[event_name].handlers) {
				if (bindings[event_name].handlers.hasOwnProperty(selector)) {
					handlers = bindings[event_name].handlers[selector];
					nodes_by_selector = document.querySelectorAll(selector);

					// walk top from the node
					while (target_node) {
						if (index_of(target_node, nodes_by_selector) !== -1) {
							for (i = 0; i < handlers.length; i += 1) {
								handlers[i].call(target_node, event);
							}
							// seek untill first match
							break;
						}
						target_node = target_node.parentNode;
					}

					// start over again
					target_node = event.target;
				}
			}
		};
	}

	function live (selector, event_name, handler) {
		if (!bindings[event_name]) {
			bindings[event_name] = {
				super_handler : bind(document, event_name, super_handler(event_name)),
				handlers : {}
			};
		}
		if (!bindings[event_name].handlers[selector]) {
			bindings[event_name].handlers[selector] = [];
		}
		bindings[event_name].handlers[selector].push(handler);
		return handler;
	}

	function die (selector, event_name, handler) {
		var handler_index;

		if (!handler) {
			// event, selector
			delete bindings[event_name].handlers[selector];
			if (is_empty_object(bindings[event_name].handlers)) {
				unbind(document, event_name, bindings[event_name].super_handler);
				delete bindings[event_name];
			}
		} else {
			// event, selector, handler
			if (bindings[event_name]) {
				handler_index = index_of(handler, bindings[event_name].handlers[selector]);
				if (handler_index !== -1) {
					bindings[event_name].handlers[selector].splice(handler_index, 1);
					if (!bindings[event_name].handlers[selector].length) {
						delete bindings[event_name].handlers[selector];
						if (is_empty_object(bindings[event_name].handlers)) {
							unbind(document, event_name, bindings[event_name].super_handler);
							delete bindings[event_name];
						}
					}
				}
			}
		}
	}

	public_methods.live = live;
	public_methods.die = die;
	return public_methods;
}());

//---------------------------------------------------------------------//

function splitter (initial, pair_separator, key_value_separator) {
	var param_type = Object.prototype.toString.call(initial),
		res,
		kvPairs,
		kvPair,
		key;

	pair_separator = pair_separator || '&';
	key_value_separator = key_value_separator || '=';
	if (param_type === '[object String]') {
		res = {};
		if (initial) {
			kvPairs = initial.split(pair_separator);
			for (var i = 0; i < kvPairs.length; i += 1) {
				kvPair = kvPairs[i].split(key_value_separator);
				res[kvPair[0]] = kvPair[1];
			}
		}
	} else if (param_type === '[object Object]') {
		res = '';
		for (key in initial) {
			if (initial.hasOwnProperty(key)) {
				res ? res += (pair_separator + key + key_value_separator + initial[key])
				: res = key + key_value_separator + initial[key];
			}
		}
	}
	return res;
}

//---------------------------------------------------------------------//

var mediator = (function () {
	'use strict';
	var events;

	events = {};
	return {
		subscribe : function (event_name, callback) {
			if (!events[event_name]) {
				events[event_name] = [];
			}
			events[event_name].push(callback);
		},

		unsubscribe : function (event_name, callback_) {
			if (arguments.length === 1) {
				delete events[event_name];
			} else {
				if (events[event_name]) {
					events[event_name] = events[event_name].filter(function (callback) {
						return callback !== callback_;
					});
				}
			}
		},

		publish : function (event_name, data) {
			var callbacks;
			var i;

			callbacks = events[event_name];
			if (callbacks && callbacks.length) {
				for (i = 0; i < callbacks.length; i += 1) {
					callbacks[i].call(undefined, data);
				}
			}
		}
	}
}());

//---------------------------------------------------------------------//

function make_iterable (func) {
	var arr_proto;

	arr_proto = Array.prototype;
	return function (el) {
		var res,
			args,
			i;

		res = [];
		args = [undefined].concat(arr_proto.slice.call(arguments, 1));
		if ('length' in el) {
			for (i = 0; i < el.length; i += 1) {
				args.splice(0,1,el[i]);
				res[i] = func.apply(this, args);
			}
		} else {
			res.push(func.apply(this, arguments));
		}
		return res;
	};
}

//---------------------------------------------------------------------//

var worker = (function () {
	var stack;
	var callsGap;
	var sinseLastCall;
	var lastCall;

	// functions stack
	stack = [];

	// time between calls
	callsGap = 999;

	// last time when function from stack was processed
	lastCall = 0;

	// async iterator on functions stack
	function processStack () {
		var thisMoment;
		var funcArgsPair;

		thisMoment = now();
		sinseLastCall = thisMoment - lastCall;

		if (sinseLastCall >= callsGap && stack.length) {

			lastCall = thisMoment;
      
			funcArgsPair = stack.shift()();
			funcArgsPair.func.apply(window, funcArgsPair.args);

			setTimeout(processStack, callsGap);
		}
	}

	function now () {
		return new Date().getTime();
	}

	function isIsArrayLike (obj) {
		return length in obj && typeof obj !== 'function';
	}

	return function (func, args) {
		stack.push({
			func : func,
			args : isIsArrayLike(args) ? args : [args]
		});
		processStack();
	};
}());

//---------------------------------------------------------------------//

function wait_for (condition, callback, timeout, interval, on_fail) {
	var control;


	control = {
		_timeout : null,
		stop : function () {
			clearTimeout(this._timeout);
			if (on_fail) {
				on_fail();
			}
		}
	};
	interval = interval || 50;
	(function waiter () {
		var condition_result;

		try {
			condition_result = condition();
		} catch (err) {
			mmcore.EH(err);
		}

		if (condition_result) {
			callback();
		} else {
			control._timeout = setTimeout(waiter, interval);
		}
	}());

	if (timeout) {
		setTimeout(function () {
			control.stop();
		}, timeout);
	}

	return control;
}

//---------------------------------------------------------------------//
