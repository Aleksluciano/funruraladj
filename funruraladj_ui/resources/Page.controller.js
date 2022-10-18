sap.ui.define([
	"funruraladj_ui/BaseController",
	'sap/ui/model/json/JSONModel',
	'funruraladj_ui/myLib/oData',
	'funruraladj_ui/myLib/utils',
	'sap/m/MessageToast',
	"sap/m/MessageBox"
], function (BaseController, JSONModel, oData, utils, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("funruraladj_ui.Page", {
  		onTable: function () {
			this.getRouter().navTo("appTable");
		},
		onTable2: function () {
			this.getRouter().navTo("appTable2");
		},
		onPress: function () {
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView();
			if (oData.SelectedCompany == 0 || oData.SelectedBranch == 0 || oData.SelectedEntsai == 0) {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}

			if(!oData.SelectedPeriod.match(dateReg)){
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}
			oData.Results = [];
			var oModel = new JSONModel(oData);
			view.setModel(oModel);

			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			var company = utils.find(oData.SelectedCompany, oData.CompanyCollection);
			var branch = utils.find(oData.SelectedBranch, oData.BranchCollection);
			var direct = oData.SelectedEntsai;


			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/funrural/change", true);
			xhttp.setRequestHeader('content-type', 'application/json');
		
			var content = {
				company: company,
				branch: branch,
				period: oData.SelectedPeriod,
				direct: direct
			};
			xhttp.send(JSON.stringify(content));
			var msg = '';
			xhttp.onreadystatechange = function () {
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);
					oDialog.close();
					//console.log(response.result, response.resultSum);

					if (response.result.length > 0) {
						msg = 'Processado com sucesso!!';
					} else {
						msg = 'Nenhum registro encontrado';
					}

			
					var alv1 = {
						ALV1: response.result
					};
					var oModelAlv1 = new JSONModel(alv1);
					view.byId('tableAlv1').setModel(oModelAlv1);
					
						var alv2 = {
						ALV2: Object.values(response.resultSum)
					};
					var oModelAlv2 = new JSONModel(alv2);
					view.byId('tableAlv2').setModel(oModelAlv2);

					MessageToast.show(msg);
				} else {
						oDialog.close();
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					} 
				}
			};

		},

		changeCompany: function () {
			var allData = this.getView().getModel().getData();

			oData.SelectedBranch = 0;
			oData.BranchCollection = [];


			oData.BranchCollection = allData.Branchs.filter(function (a) {
				if (a.IdCompany == oData.SelectedCompany || a.Id == 0) {
					return true;
				} else {
					return false;
				}
			});


		}

	});

});