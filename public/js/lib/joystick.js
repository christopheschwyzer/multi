/**
 * Module for an on-screen Joystick that supports both
 * touch and klick events.
 * @module
 */
define(function () {

	/**
	 * This is an on-screen joystick supporting both touch
	 * and click events and four directions.
	 * @class
	 * @param {integer} threshold  distance from the joysticks center 
	 *  in pixel that's needed to trigger a direction change.
	 * @param {function} directionCallback  function that should be called when
	 *  the direction has changed. The new direction is passed as an integer:
	 *  up=0, right=1, down=2, left=3
	 * @param {boolean} allowOppositeDir true if every direction should be allowed
	 *  in any order. False if user should not change direction to the opposite
	 *  direction directly.
	 * @param {jQueryElement} container  dom element containing a marker that's
	 *  shown when the user starts touching or dragging (with the css class
	 *  'down') and a marker that indicates the current direction (with the css
	 *  class 'move')
	 * @param {jQueryElement} eventArea  dom element that contains the area in
	 *  which the user can use the joystick (e.g. $('html'))
	 */
	function Joystick(threshold, directionCallback, allowOppositeDir, container, eventArea) {

		var eventEmitter = eventArea;
		var downMarker = container.find('.down');
		var moveMarker = container.find('.move');
		var direction = null;
		var startPos;

		function getEventPosition(event) {
			var pos = {};
			if (typeof event.originalEvent.touches !== 'undefined') {
				pos.x = event.originalEvent.touches[0].pageX;
				pos.y = event.originalEvent.touches[0].pageY;
			} else {
				pos.x = event.clientX;
				pos.y = event.clientY;
			}
			return pos;
		}

		function onMove(event) {
			event.preventDefault();
			var newDirection = direction;
			var pos = getEventPosition(event);
			var snapX = pos.x > startPos.x - threshold &&
				pos.x < startPos.x + threshold;
			var snapY = pos.y > startPos.y - threshold &&
				pos.y < startPos.y + threshold;
			if (!(snapX && snapY)) {
				if (snapX) {
					pos.x = startPos.x;
					newDirection = (pos.y < startPos.y) ? 0 : 2;
				}
				if (snapY) {
					pos.y = startPos.y;
					newDirection = (pos.x < startPos.x) ? 3 : 1;
				}
				var oppositeDir = (direction + 2) % 4;
				if (newDirection !== direction && 
					(allowOppositeDir || newDirection != oppositeDir)) {
					direction = newDirection;
					directionCallback(direction);
				}
			}
			moveMarker.css('top', pos.y);
			moveMarker.css('left', pos.x);
		}

		function onUp(event) {
			eventEmitter.off('touchmove mousemove', onMove);
			downMarker.hide();
			moveMarker.fadeOut();
		}

		// controller starting point
		// TODO: make this work with multitouch (first touch is king)
		function onDown(event) {
			eventEmitter.one('touchend mouseup', onUp);
			eventEmitter.on('touchmove mousemove', onMove);
			startPos = getEventPosition(event);
			downMarker.css('top', startPos.y);
			downMarker.css('left', startPos.x);
			moveMarker.css('top', startPos.y);
			moveMarker.css('left', startPos.x);
			downMarker.show();
			moveMarker.fadeIn();
		}


		// PUBLIC

		/**
		 * Registers all necessary events so this joystick can be used.
		 */
		this.start = function () {
			direction = null;
			eventEmitter.on('touchstart mousedown', onDown);
		};

		/**
		 * Unregisters all events so this joystick stops working.
		 */
		this.stop = function () {
			eventEmitter.off('touchstart mousedown', onDown);
			downMarker.hide();
			moveMarker.fadeOut();
		};

	}

	return Joystick;

});