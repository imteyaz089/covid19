sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/suite/ui/commons/ChartContainer",
	"sap/suite/ui/commons/ChartContainerContent",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/ui/model/Filter',
	"sap/ui/core/Element"
], function (Controller,JSONModel,ChartContainer,ChartContainerContent,ChartFormatter,Filter,Element) {
	"use strict";
	
	var aMonths = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
			];
	var aData = [],
		aStates = [],
		aIndStateData = [],
		aIndEssential = [],
	    oModel = new JSONModel(),
	    StatesName = new JSONModel();
		
	return Controller.extend("opensap.imt.COVID19_Tracker.controller.Main", {
		
		onInit: function () {
			
			var oView = this.getView();
			var sURL = "https://api.covid19india.org/data.json";
			$.ajax({
				type:"GET",
				url:sURL,
				dataType:"json",
				success:this.successRest.bind(this),
				error:this.errorRest.bind(this)
			});
			this.adjustMyChart(oView,"chart1","cell1");
			this.adjustMyChart(oView,"chart2","cell2");	
			this.adjustMyChart(oView,"chart3","cell3");
			this.adjustMyChart(oView,"chart4","cell4");	
			this.adjustMyChart(oView,"dailyConfirmedAll","AllStateDailyLayCon");
			this.adjustMyChart(oView,"dailyDeceasedAll","AllStateDailyLayDec");
			this.adjustMyChart(oView,"dailyRecoveredAll","AllStateDailyLayRec");
			this.adjustMyChart(oView,"cumulConfirmedAll","AllStateCumLayCon");
			this.adjustMyChart(oView,"cumulDeceasedAll","AllStateCumLayDec");
			this.adjustMyChart(oView,"cumulRecoveredAll","AllStateCumLayRec");
			this.adjustMyChart(oView,"dailyConfirmedInd","indStateDailyLayCon","X","confirmed");
			this.adjustMyChart(oView,"dailyDeceasedInd","indStateDailyLayDec","X","deceased");
			this.adjustMyChart(oView,"dailyRecoveredInd","indStateDailyLayRec","X","recovered");
		},
		
		onSelectTab: function(oEvent) {
			var sKey = oEvent.getParameter("key");
			var oView = this.getView();
			
			if (sKey == 'keyDailyGraph')
			{
				this.showGraph(aData.cases_time_series);
			}
			else if (sKey == 'keyCumGraph')
			{
				this.showStateGraphOverall(oView);
			}
			else if (sKey == "keyIndState")
			{
				this.showIndividualStateGraph(oView);
			}
			else if (sKey == "keyEssential")
			{
				this.showEssentials(oView);
			}
		},
		
		onPress: function() {
		
		},
		
		successRest: function(data){
			aData = data;
			this.formatData(aData.cases_time_series);
			var myData = data.statewise;
			var overallStat = myData[0];
			myData.splice(0,1);
			var oModel = new JSONModel();
			oModel.setData({"newData":myData});
			var oModelTotal = new JSONModel();
			oModelTotal.setData({"cases":overallStat});
			this.getView().setModel(oModelTotal,"overallStat");
			// var oList = this.getView().byId("listdata");
			// oList.setModel(oModel);
			// oList.bindItems({
			// 	path:"/newData",
			// 	template: new sap.m.ObjectListItem({
			// 	title:"{state}",	
			// 	number:"{path:'confirmed', type:'sap.ui.model.type.Integer'}"
			// 	})
			// });
			// // oList.setHeaderText("Total Confirmed Cases");
			// var aSorter = [];
			// var sPath = "confirmed";
			// aSorter.push(new sap.ui.model.Sorter({path:'confirmed',type:'sap.ui.model.type.Integer'}, true));
			// var oBinding = oList.getBinding("items");
			// oBinding.sort(aSorter);
			var oTable = this.getView().byId("idTable");
			oTable.setModel(oModel);
			this.getStates(myData);
			// this.fnSetAppNotBusy();
		},
		errorRest: function(error){
			this.fnSetAppNotBusy();
		},
		adjustMyChart: function(oView,sChartId,sBlockId,bTable,sCaseType){
		
			var oChart = oView.byId(sChartId);
			var oChartContainerContent = new ChartContainerContent({icon:"sap-icon://area-chart",
				content:[oChart]
			});
			var oChartContainer = new ChartContainer({
				content:oChartContainerContent
				});
			if(bTable == "X") {
				this.setTableforChart(oChartContainer,sCaseType);
			}
			oChartContainer.setShowFullScreen(true);
			oChartContainer.setAutoAdjustHeight(true);
			oView.byId(sBlockId).addContent(oChartContainer);
			
			
		},
		setChartData: function(oView,oModel,sChartId){
			var oChart = oView.byId(sChartId);
			oChart.setModel(oModel);
		},
		
		onSearch: function(oEvent) {
			var sQuery = oEvent.getParameter("newValue");
			var oBinding = this.getView().byId("idTable").getBinding("items");
			sap.ui.require(	["sap/ui/model/Filter","sap/ui/model/FilterOperator"], function(Filter,FilterOperator){
			var aFilter = [new Filter("state", FilterOperator.Contains, sQuery)];
			oBinding.filter(aFilter);	
			});
		},
		
		setGraphDataAll: function(data,sChartId,sColor){
			this.setGraphProperties(sChartId,sColor);
		    this.setGraphAllModel(data,sChartId);
		    
		},
		setGraphAllModel: function(data,sChartId){
			var oModel = new JSONModel();
			oModel.setData({"dailyDataAll":data});
			var oView = this.getView();
			this.setChartData(oView, oModel, sChartId)
		},
		formatData: function(data) {
			
			data.forEach((item) => {
				var sdate = item.date;
				var sday = sdate.slice(0,2);
				var sMontht = sdate.slice(2);
				var sMonth = aMonths.indexOf(sMontht.trim());
				var newDate = new Date('2020',sMonth,sday);
				item.date = newDate;
			});
		},
		
		onModeChangeAll: function(oEvent){
				// var sMode = oEvent.getParameter("value");
				this.showGraph(aData.cases_time_series);
		},
		
		showGraph: function(data){
			var sMode = this.getView().byId("idSelectModeAll").getSelectedKey();
			
			if (sMode == 'Daily')
				{
					this.setGraphDataAll(data,"dailyConfirmedAll","#74abe2");
					this.setGraphDataAll(data,"dailyDeceasedAll","#f33334");
					this.setGraphDataAll(data,"dailyRecoveredAll","#4cba6b");
				}
				else
				{
					this.setGraphDataAll(data,"cumulConfirmedAll","#74abe2");
					this.setGraphDataAll(data,"cumulDeceasedAll","#f33334");
					this.setGraphDataAll(data,"cumulRecoveredAll","#4cba6b");
				}
			this.setVisibilityforChartAllStates(sMode);
		},
		
		showStateGraphOverall: function(oView) {
			var oModel = new JSONModel();
			oModel.setData({"newData":aData.statewise});
			this.setChartData(oView,oModel,"chart1");
			this.setChartData(oView,oModel,"chart2");
			this.setChartData(oView,oModel,"chart3");
			this.setChartData(oView,oModel,"chart4");
		},
		
		setVisibility: function(sChartId,sColId,bVisible) {
			this.getView().byId(sChartId).setVisible(bVisible);
			this.getView().byId(sColId).setVisible(bVisible);
		},
		
		setVisibilityforChartAllStates: function(sMode) {
			if (sMode == 'Daily')
				{
					this.setVisibility("cumulConfirmedAll","AllStateCumLayCon",false);
					this.setVisibility("cumulDeceasedAll","AllStateCumLayDec",false);
					this.setVisibility("cumulRecoveredAll","AllStateCumLayRec",false);
					this.setVisibility("dailyConfirmedAll","AllStateDailyLayCon",true);
					this.setVisibility("dailyDeceasedAll","AllStateDailyLayDec",true);
					this.setVisibility("dailyRecoveredAll","AllStateDailyLayRec",true);
				}
				else
				{
					this.setVisibility("dailyConfirmedAll","AllStateDailyLayCon",false);
					this.setVisibility("dailyDeceasedAll","AllStateDailyLayDec",false);
					this.setVisibility("dailyRecoveredAll","AllStateDailyLayRec",false);
					this.setVisibility("cumulConfirmedAll","AllStateCumLayCon",true);
					this.setVisibility("cumulDeceasedAll","AllStateCumLayDec",true);
					this.setVisibility("cumulRecoveredAll","AllStateCumLayRec",true);
				}
		},
		
		getStates: function(data){
			data.forEach((stateData) => {
				// var oState = {statecode:stateData.statecode,state:stateData.state};
				aStates.push({statecode:stateData.statecode,state:stateData.state});
			});
			StatesName.setData({"states":aStates});
			this.getView().setModel(StatesName,"stateNameModel");

		},
		showIndividualStateGraph: function(oView) {
			(aIndStateData.length == 0) ? this.getDatafromAPI() : aIndStateData;
			
		},
		getDatafromAPI: function(){
			var sURL = "https://api.covid19india.org/states_daily.json";
			$.ajax({
				type:"GET",
				url:sURL,
				dataType:"json",
				success:this.successIndState.bind(this),
				error:this.errorIndState.bind(this)
			});
		},
		successIndState: function(data){
			aIndStateData = data.states_daily;
			this.setIndStateData(aIndStateData);
			this.setGraphProperties("dailyConfirmedInd","#5899DA");
			this.setGraphProperties("dailyRecoveredInd","#19A979");
			this.setGraphProperties("dailyDeceasedInd","#f33334");
		},
		errorIndState: function(error){
			
		},
		
		setGraphProperties: function(sChartId,sColor){
			var dailyChart = this.getView().byId(sChartId);
			var oProperties = {
				plotArea: {
                    window: {
				        start: "2020-03-31",
				        end: "lastDataPoint"
				    },
					colorPalette:[sColor],
					drawingEffect:'glossy',
					dataLabel:{visible:true,showTotal:true},
				},
			    
				title: {
				        visible: true
				},
				tooltip: {
					visible: true
				}
		    };
		    dailyChart.setVizProperties(oProperties);
		    dailyChart.setVisible(true);
		    dailyChart.setBusy(false);
		    var oPopover = new sap.viz.ui5.controls.Popover({});
		    oPopover.connect(dailyChart.getVizUid());
		    
		},
		
		setIndStateData: function(data){
			var aIndStateConfirmed = [],
				aIndStateRecovered = [],
				aIndStateDeceased = [],
				aIndStateCases = [];
			
			var sStateCode = this.getView().byId("comboBoxStateSel").getSelectedKey();	
			sStateCode = sStateCode.toLowerCase();
			var aIndStateAPI = data;	
			aIndStateAPI.forEach((oState) => {
				for(let key in oState) {
					if(key == sStateCode)
					{
					if(oState.status == "Confirmed"){
						aIndStateConfirmed.push({"stateCode":key,"cases":oState[key],"date":oState.date});	
					}
					else if(oState.status == "Recovered"){
						aIndStateRecovered.push({"stateCode":key,"cases":oState[key],"date":oState.date});
					}
					else if(oState.status == "Deceased"){
						aIndStateDeceased.push({"stateCode":key,"cases":oState[key],"date":oState.date});
					}
					}
				}
			});
			aIndStateCases.push({"confirmed":aIndStateConfirmed,"recovered":aIndStateRecovered,"deceased":aIndStateDeceased});
			this.setIndStateModelonView(aIndStateCases);
			// for chart table
			aIndStateConfirmed.reverse();
			aIndStateRecovered.reverse();
			aIndStateDeceased.reverse();
			var oModelTableData = new JSONModel();
			oModelTableData.setData({"confirmed":aIndStateConfirmed,"recovered":aIndStateRecovered,"deceased":aIndStateDeceased});
			this.getView().setModel(oModelTableData,"IndStateTableData");
		},
		
		setIndStateModelonView: function(data) {
			var oModel = new JSONModel();
			oModel.setData({"indStateCases":data});
			this.getView().setModel(oModel,"IndStateCasesModel");
		},
		
		onStateChangeInd: function(oEvent) {
			// var sState = oEvent.getParameter("value");
			this.setIndStateData(aIndStateData);
		},
		
		setTableforChart: function(oChartContainer,sCaseType){
			var aSorter = [];
			var oTable = new sap.m.Table({headerText:'Tablular Display',growing:true,growingThreshold:10});
			var oCol1 = new sap.m.Column({header: new sap.m.Label({text:'Date'})});
			oTable.addColumn(oCol1);
			var oCol2 = new sap.m.Column({header: new sap.m.Label({text:'Cases'})});
			oTable.addColumn(oCol2);
			var ColListItem = new sap.m.ColumnListItem({type:'Active'});
			// oTable.bindAggregation("items","IndStateCasesModel>/indStateCases/0/confirmed",ColListItem);
			var str = "IndStateTableData>/";
			var sData = str.concat(sCaseType);
			oTable.bindAggregation("items",sData,ColListItem);
			var cell1 = new sap.m.Text({text:"{IndStateTableData>date}"});
			ColListItem.addCell(cell1); 
			    
			var cell2 = new sap.m.Text({text:"{IndStateTableData>cases}"});
			ColListItem.addCell(cell2); 
			
			var oChartContainerContent = new ChartContainerContent({icon:"sap-icon://table-view",
				content:[oTable]
			});
			oChartContainer.addContent(oChartContainerContent);
			
		},
		
		showEssentials: function(oView) {
			(aIndEssential.length == 0) ? this.getEssentailDataFromAPI() : aIndEssential;			
		},
		
		getEssentailDataFromAPI: function(){
				var sURL = "https://api.covid19india.org/resources/resources.json";
			$.ajax({
				type:"GET",
				url:sURL,
				dataType:"json",
				success:this.successIndEss.bind(this),
				error:this.errorIndEss.bind(this)
			});	
		},
		
		successIndEss: function(data) {
			aIndEssential = data.resources;
			var oModel = new JSONModel();
			oModel.setData({"essential":aIndEssential});
			this.getView().setModel(oModel,"IndEssential");
			var aCategory = [],
				aCity = [],
				aFilterData = [];
			var catSet = new Set(),
				citySet = new Set();
			aIndEssential.forEach((rec) => {
				catSet.add(rec.category);
				citySet.add(rec.city);
			});
			catSet.forEach((cat) => {
				aCategory.push({"text":cat});
			});
			citySet.forEach((city) => {
				aCity.push({"text":city});
			});
			
			aFilterData.push({"type":"Category", "values":aCategory});
			aFilterData.push({"type":"City", "values":aCity});
			var oModelCat = new JSONModel();
			oModelCat.setDefaultBindingMode("OneWay");
			oModelCat.setData({"essFilter":aFilterData});
			this.getView().setModel(oModelCat,"EssFilter");
		},
		
		errorIndEss: function(error) {
			
		},
		
		_applyFilter: function(oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var oTable = this.getView().byId("idEssTable");
			// var aFilter = [];
			// aFilter.push(new Filter("category","EQ","Free Food"));
			oTable.getBinding("items").filter(oFilter);
		},

		handleFacetFilterReset: function(oEvent) {
			var oFacetFilter = Element.registry.get(oEvent.getParameter("id")),
				aFacetFilterLists = oFacetFilter.getLists();

			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}

			this._applyFilter([]);
		},

		handleListClose: function(oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource().getParent();

			this._filterModel(oFacetFilter);
		},

		handleConfirm: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource();
			this._filterModel(oFacetFilter);
			
		},

		_filterModel: function(oFacetFilter) {
			var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
				return oList.getSelectedItems().length;
			});

			if (mFacetFilterLists.length) {
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
				var oFilter = new Filter(mFacetFilterLists.map(function(oList) {
					return new Filter(oList.getSelectedItems().map(function(oItem) {
						var sType = oList.getTitle().toLowerCase();
						return new Filter(sType, "EQ", oItem.getText());
					}), false);
				}), true);
				this._applyFilter(oFilter);
			} else {
				this._applyFilter([]);
			}
		}
	});
});