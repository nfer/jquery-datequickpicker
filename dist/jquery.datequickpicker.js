/*
 *  jquery-datequickpicker - v0.1.0
 *  A Date Quick Picker jQuery plugin.
 *  https://github.com/nfer/jquery-datequickpicker
 *
 *  Made by Nfer Zhuang
 *  Under MIT License
 */
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
					"<div class='radio radio-success'>" +
						"<select class='dqp-select dqp-year p-l-5 p-r-5'></select>" +
						"<select class='dqp-select dqp-month p-l-5 p-r-5'></select>" +
						"<select class='dqp-select dqp-day p-l-5 p-r-5'></select>" +
						"<select class='dqp-select dqp-week p-l-5 p-r-5'></select>" +
						"<span class='hidde m-l-10 m-r-10'></span>" +
						"<input type='radio' name='dqp-radio' value='today' id='today'" +
							" checked='checked'>" +
						"<label for='today'>今日</label>" +
						"<input type='radio' name='dqp-radio' value='yesterday' id='yesterday'>" +
						"<label for='yesterday'>昨日</label>" +
						"<input type='radio' name='dqp-radio' value='cur_week' id='cur_week'>" +
						"<label for='cur_week'>本周</label>" +
						"<input type='radio' name='dqp-radio' value='cur_month' id='cur_month'>" +
						"<label for='cur_month'>本月</label>" +
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
				$( "select.dqp-year" ).append( yearOption );

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
				$( "select.dqp-month" ).append( monthOption );

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
				$( "select.dqp-day" ).append( dayOption );

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
				$( "select.dqp-week" ).append( weekOption );
			},
			initEventHandler: function() {
				var _plugin = this;
				$( this.element ).on( "click", "input[name='dqp-radio']", function() {
					_plugin.onRadioClickedHandler();
				} );

				$( this.element ).on( "change", "select.dqp-select", function() {
					_plugin.onSelectChangedHandler();
				} );
			},
			doStartAction: function() {
				$( "input[name='dqp-radio']:first" ).click();
			},
			onRadioClickedHandler: function() {
				var datequickpickerRadio = $( "input[name='dqp-radio']:checked" ).val();
				var start = 1, end = 0;

				var now = new Date();
				var year = now.getFullYear();
				var month = now.getMonth() + 1;
				var day = now.getDate();
				var week = this.getWeeksInYear( now );

				$( "select.dqp-select" ).removeClass( "hidden" );
				switch ( datequickpickerRadio ) {
					case "today":
						$( "select.dqp-year" ).val( year );
						$( "select.dqp-month" ).val( month );
						$( "select.dqp-day" ).val( day );
						$( "select.dqp-week" ).addClass( "hidden" );
						start = 1, end = 0;
						break;
					case "yesterday":
						$( "select.dqp-year" ).val( year );
						$( "select.dqp-month" ).val( month );
						$( "select.dqp-day" ).val( day - 1 );
						$( "select.dqp-week" ).addClass( "hidden" );
						start = 2, end = 1;
						break;
					case "cur_week":
						$( "select.dqp-year" ).val( year );
						$( "select.dqp-week" ).val( week );
						$( "select.dqp-month" ).addClass( "hidden" );
						$( "select.dqp-day" ).addClass( "hidden" );
						start = day, end = 0;
						break;
					case "cur_month":
						$( "select.dqp-year" ).val( year );
						$( "select.dqp-month" ).val( month );
						$( "select.dqp-day" ).addClass( "hidden" );
						$( "select.dqp-week" ).addClass( "hidden" );
						start = day, end = 0;
						break;
				}

				if ( this.settings.onRadioClicked ) {
					this.settings.onRadioClicked( start, end );
				}
			},
			onSelectChangedHandler: function() {
				var isWeek = $( "select.dqp-week" ).is( ":visible" );
				var isDay = $( "select.dqp-day" ).is( ":visible" );
				var year = $( "select.dqp-year" ).val();
				var week = $( "select.dqp-week" ).val();
				var month = $( "select.dqp-month" ).val() - 1;
				var day = $( "select.dqp-day" ).val();
				var dayBeforeToday, endDayBeforeToday;
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
