// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variables rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "datequickpicker",
			defaults = {
				onRadioClicked: null,
				onSelectChanged: null
			};

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {
			init: function() {
				this.initPickerHtml();
				this.initSelectOption();
				this.initEventHandler();
				this.doStartAction();
			},
			initPickerHtml: function() {
				var pickerHtml =
					"<div class='datequickpicker-content'>" +
						"<div class='select select-success' style='display:inline'>" +
							"<select class='dqp-year p-l-5 p-r-5'></select>" +
							"<select class='dqp-month p-l-5 p-r-5'></select>" +
							"<select class='dqp-day p-l-5 p-r-5'></select>" +
							"<select class='dqp-week p-l-5 p-r-5'></select>" +
						"</div>" +
						"<div class='radio radio-success m-l-20' style='display:inline'>" +
							"<input type='radio' name='dqp-radio' value='today'" +
								" id='dqp-today' checked='checked'>" +
							"<label for='dqp-today'>今日</label>" +
							"<input type='radio' name='dqp-radio' value='yesterday'" +
								" id='dqp-yesterday'>" +
							"<label for='dqp-yesterday'>昨日</label>" +
							"<input type='radio' name='dqp-radio' value='curWeek'" +
								" id='dqp-cur-week'>" +
							"<label for='dqp-cur-week'>本周</label>" +
							"<input type='radio' name='dqp-radio' value='curMonth'" +
								" id='dqp-cur-month'>" +
							"<label for='dqp-cur-month'>本月</label>" +
						"</div>" +
					"</div>";
				$( this.element ).html( pickerHtml );
			},
			initSelectOption: function() {
				var now = new Date();
				var year = now.getFullYear();
				var month = now.getMonth() + 1;
				var day = now.getDate();
				var week = this.getWeeksInYear( now );

				var yearOption = "";
				for ( var yi = 2016; yi <= year; yi++ ) {
					if ( yi === year ) {
						yearOption += "<option name='dqp-year' value='" + yi +
										"' selected='selected'>" + yi + "</option>";
					} else {
						yearOption += "<option name='dqp-year' value='" + yi +
										"'>" + yi + "</option>";
					}
				}
				$( this.element ).find( "select.dqp-year" ).append( yearOption );

				var monthOption = "";
				for ( var mi = 1; mi <= 12; mi++ ) {
					if ( mi === month ) {
						monthOption += "<option name='dqp-month' value='" + mi +
										"' selected='selected'>" + mi + "月</option>";
					} else {
						monthOption += "<option name='dqp-month' value='" + mi +
										"'>" + mi + "月</option>";
					}
				}
				$( this.element ).find( "select.dqp-month" ).append( monthOption );

				var dayOption = "";
				var monthMaxDay = this.getDaysInMonth( year, month );
				for ( var mmi = 1; mmi <= monthMaxDay; mmi++ ) {
					if ( mmi === day ) {
						dayOption += "<option name='dqp-day' value='" + mmi +
										"' selected='selected'>" + mmi + "号</option>";
					} else {
						dayOption += "<option name='dqp-day' value='" + mmi +
										"'>" + mmi + "号</option>";
					}
				}
				$( this.element ).find( "select.dqp-day" ).append( dayOption );

				var weekOption = "";
				for ( var wi = 1; wi <= 54; wi++ ) {
					if ( wi === week ) {
						weekOption += "<option name='dqp-week' value='" + wi +
										"' selected='selected'>" + wi + "周</option>";
					} else {
						weekOption += "<option name='dqp-week' value='" + wi +
										"'>" + wi + "周</option>";
					}
				}
				$( this.element ).find( "select.dqp-week" ).append( weekOption );
			},
			initEventHandler: function() {
				var _plugin = this;
				$( this.element ).on( "click", "input[name='dqp-radio']", function() {
					_plugin.onRadioClickedHandler();
				} );

				$( this.element ).on( "change", "select", function() {
					_plugin.onSelectChangedHandler();
				} );

				$( this.element ).on( "change", "select.dqp-month", function() {
					var dayOption = "";
					var year = $( "select.dqp-year" ).val();
					var month = $( "select.dqp-month" ).val();
					var monthMaxDay = _plugin.getDaysInMonth( year, month );
					for ( var mmi = 1; mmi <= monthMaxDay; mmi++ ) {
						dayOption += "<option name='dqp-day' value='" + mmi +
											"'>" + mmi + "号</option>";
					}
					$( _plugin.element ).find( "select.dqp-day" ).html( dayOption );
				} );
			},
			doStartAction: function() {
				$( this.element ).find( "input[name='dqp-radio']:first" ).click();
			},
			onRadioClickedHandler: function() {
				var radioVal = $( this.element ).find( "input[name='dqp-radio']:checked" ).val();
				var start = 1, end = 0;

				var now = new Date();
				var year = now.getFullYear();
				var month = now.getMonth() + 1;
				var day = now.getDate();
				var week = this.getWeeksInYear( now );
				var $selectContainer = $( this.element ).find( "div.select" );

				$selectContainer.children().removeClass( "hidden" );
				switch ( radioVal ) {
					case "today":
						$selectContainer.children( ".dqp-year" ).val( year );
						$selectContainer.children( ".dqp-month" ).val( month );
						$selectContainer.children( ".dqp-day" ).val( day );
						$selectContainer.children( ".dqp-week" ).addClass( "hidden" );
						start = 1, end = 0;
						break;
					case "yesterday":
						$selectContainer.children( ".dqp-year" ).val( year );
						$selectContainer.children( ".dqp-month" ).val( month );
						$selectContainer.children( ".dqp-day" ).val( day - 1 );
						$selectContainer.children( ".dqp-week" ).addClass( "hidden" );
						start = 2, end = 1;
						break;
					case "curWeek":
						$selectContainer.children( ".dqp-year" ).val( year );
						$selectContainer.children( ".dqp-week" ).val( week );
						$selectContainer.children( ".dqp-month" ).addClass( "hidden" );
						$selectContainer.children( ".dqp-day" ).addClass( "hidden" );
						start = day, end = 0;
						break;
					case "curMonth":
						$selectContainer.children( ".dqp-year" ).val( year );
						$selectContainer.children( ".dqp-month" ).val( month );
						$selectContainer.children( ".dqp-day" ).addClass( "hidden" );
						$selectContainer.children( ".dqp-week" ).addClass( "hidden" );
						start = day, end = 0;
						break;
				}

				if ( this.settings.onRadioClicked ) {
					this.settings.onRadioClicked( start, end );
				}
			},
			onSelectChangedHandler: function() {
				var $selectContainer = $( this.element ).find( "div.select" );
				var isWeek = $selectContainer.children( ".dqp-week" ).is( ":visible" );
				var isDay = $selectContainer.children( ".dqp-day" ).is( ":visible" );
				var year = $selectContainer.children( ".dqp-year" ).val();
				var week = $selectContainer.children( ".dqp-week" ).val();
				var month = $selectContainer.children( ".dqp-month" ).val() - 1;
				var day = $selectContainer.children( ".dqp-day" ).val();
				var dayBeforeToday, startDayBeforeToday, endDayBeforeToday;
				var start, end;
				var now = new Date();

				if ( isWeek ) {
					var startDateOfWeek = this.getWeeksStartDate( year, week );

					dayBeforeToday = Math.ceil( ( now - startDateOfWeek ) / 86400000 ) - 1;
					start = dayBeforeToday + 1, end = dayBeforeToday - 6;
					end = end > 0 ? end : 0;
				} else if ( isDay ) {
					var date = new Date( year, month, day );
					if ( date > now ) {
						alert( "选择的日期已超过今天" );
						return;
					}

					dayBeforeToday = Math.ceil( ( now - date ) / 86400000 ) - 1;
					start = dayBeforeToday + 1, end = dayBeforeToday;
				} else {
					if ( year === now.getFullYear() && month > now.getMonth() ) {
						alert( "选择的月份已超过本月" );
						return;
					}

					var monthStartDate = new Date( year, month, 1 );
					var monthEndDate = new Date( year, month + 1, 0 );
					startDayBeforeToday = Math.ceil( ( now - monthStartDate ) / 86400000 ) - 1;
					endDayBeforeToday = Math.ceil( ( now - monthEndDate ) / 86400000 ) - 1;
					start = startDayBeforeToday + 1;
					end = endDayBeforeToday > 0 ? endDayBeforeToday : 0;
				}

				if ( this.settings.onSelectChanged ) {
					this.settings.onSelectChanged( start, end );
				}
			},
			getDaysInMonth: function( year, month ) {
				var date = new Date( year, month, 0 );
				return date.getDate();
			},

			// http://zerosixthree.se/snippets/get-week-of-the-year-with-jquery/
			getWeeksInYear: function( date ) {
				var onejan = new Date( date.getFullYear(), 0, 1 );
				return Math.ceil( ( ( ( date - onejan ) / 86400000 ) + onejan.getDay() + 1 ) / 7 );
			},
			getWeeksStartDate: function( year, week ) {
				var onejan = new Date( year, 0, 1 );
				return onejan.getTime() + ( week - 1 ) * 7 * 86400000 -
						( onejan.getDay() - 1 ) * 86400000;
			}
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );
