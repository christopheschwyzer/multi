define(function(require, exports, module) {	

	var multi = null;

	function onPlayerConnected(event) {
		var p = $('<div class="player"></div>');
		var color = 'ffff' + (Math.random()*0xFFFFFF<<0).toString(16);
		color = '#' + color.substring(color.length-6, color.length);
		p.css('background-color', color);
		$('#new .players').append(p);
		event.player.on('disconnected', function (event) {
			p.remove();
		});
	}

	function onReadyClick(event) {
		$('#new .manual').hide();
		$('#new .symbols').show();
	}

	function onSessionCreated(event) {
		var token = event.session.token.toString();
		for (var i = 0; i < token.length; i++) {
			var symbol = $('#new .symbols').children().get(token[i]);
			$(symbol).attr('class', 'icon');
		}
		event.session.on('playerJoined', onPlayerConnected);
		$('#new').show();
		$('#loading').hide();
		$('#new .symbols').css('pointer-events', 'none');
	}

	function go(multiInstance) {
		multi = multiInstance;
		multi.on('sessionCreated', onSessionCreated);
		$('#new .ready').click(onReadyClick);
		$('#intro').hide();
		$('#loading').show();
		window.scrollTo(0, 1);
		multi.createSession();
	}

	exports.go = go;
});