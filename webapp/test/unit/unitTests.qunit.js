/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"opensap/imt/COVID19_Tracker/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});