( function( $, QUnit ) {

	"use strict";

	var $testCanvas = $( "#testCanvas" );
	var $fixture = null;

	QUnit.module( "jQuery DateQuickPicker", {
		beforeEach: function() {

			// fixture is the element where your jQuery plugin will act
			$fixture = $( "<div/>" );

			$testCanvas.append( $fixture );
		},
		afterEach: function() {

			// we remove the element to reset our plugin job :)
			$fixture.remove();
		}
	} );

	QUnit.test( "is inside jQuery library", function( assert ) {

		assert.equal( typeof $.fn.datequickpicker, "function", "has function inside jquery.fn" );
		assert.equal( typeof $fixture.datequickpicker, "function", "another way to test it" );
	} );

	QUnit.test( "returns jQuery functions after called (chaining)", function( assert ) {
		assert.equal(
			typeof $fixture.datequickpicker().on,
			"function",
			"'on' function must exist after plugin call" );
	} );

	QUnit.test( "caches plugin instance", function( assert ) {
		$fixture.datequickpicker();
		assert.ok(
			$fixture.data( "plugin_datequickpicker" ),
			"has cached it into a jQuery data"
		);
	} );

	QUnit.test( "enable custom config", function( assert ) {
		$fixture.datequickpicker( {
			foo: "bar",
			onRadioClicked: onClickHandler,
			onSelectChanged: onClickHandler
		} );

		function onClickHandler( start, end ) {
			console.log( start, end );
			return;
		}

		var pluginData = $fixture.data( "plugin_datequickpicker" );

		assert.deepEqual(
			pluginData.settings,
			{
				onRadioClicked: onClickHandler,
				onSelectChanged: onClickHandler,
				foo: "bar"
			},
			"extend plugin settings"
		);

	} );

	QUnit.test( "changes the element view", function( assert ) {
		$fixture.datequickpicker();

		var now = new Date();
		var year = now.getFullYear();
		var month = now.getMonth() + 1;
		var day = now.getDate();
		var week = getWeeksInYear( now );

		function getWeeksInYear( date ) {
			var onejan = new Date( date.getFullYear(), 0, 1 );
			return Math.ceil( ( ( ( date - onejan ) / 86400000 ) + onejan.getDay() + 1 ) / 7 );
		}

		assert.equal( $fixture.find( "select.dqp-year" ).val(), year );
		assert.equal( $fixture.find( "select.dqp-month" ).val(), month );
		assert.equal( $fixture.find( "select.dqp-day" ).val(), day );
		assert.equal( $fixture.find( "select.dqp-week" ).val(), week );
	} );

}( jQuery, QUnit ) );
