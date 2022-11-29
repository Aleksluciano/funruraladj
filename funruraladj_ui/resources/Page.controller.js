sap.ui.define([
	"funruraladj_ui/BaseController",
	'sap/ui/model/json/JSONModel',
	'funruraladj_ui/myLib/oData',
	'funruraladj_ui/myLib/utils',
	'sap/m/MessageToast',
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
	"sap/ui/core/format/NumberFormat"
], function (BaseController, JSONModel, oData, utils, MessageToast, MessageBox, Spreadsheet, NumberFormat) {
	"use strict";
	var planilha1 = [];
	var planilha2 = [];
	var metadata = "";
	return BaseController.extend("funruraladj_ui.Page", {
		onTable: function () {
			this.getRouter().navTo("appTable");
		},
		onTable2: function () {
			this.getRouter().navTo("appTable2");
		},
		onExcel1: function () {
			this._onDataExport(planilha1, 1);
		},
		onExcel2: function () {
			this._onDataExport(planilha2, 2);
		},
		_onDataExport: function (result, planilha_numero) {
			var oExportConfiguration, oExportPromise, oSpreadsheet;

			oExportConfiguration = this._createExportConfiguration(result, planilha_numero);
			oSpreadsheet = new Spreadsheet(oExportConfiguration);

			/* Starts the export and returns a Promise */
			oExportPromise = oSpreadsheet.build();

			oExportPromise.then(function () {
				// Here you can perform additional steps after the export has finished
			});
		},
		_createExportConfiguration: function (result, planilha_numero) {
			const oFormatOptions = {
				minFractionDigits: 2,
				maxFractionDigits: 2
			};
			let oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
			const resultFinal = result.map(a => {
				let b = Object.assign({}, a);
				b.VL_ITEM = oFloatFormat.format(a.VL_ITEM);
				b.VL_SENAR = oFloatFormat.format(a.VL_SENAR);
				b.CA_VL_TOT_FUN_SEN = oFloatFormat.format(a.CA_VL_TOT_FUN_SEN);
				b.VL_FUNRURAL = oFloatFormat.format(a.VL_FUNRURAL);
				return b;
			});

			if (planilha_numero == 1) {
				var oConfiguration = {
					fileName: "FUN_DETALHE_" + metadata,
					workbook: {

						columns: [{
								property: "EMPRESA",
								label: "Empresa",
								width: 15
							}, {
								property: "FILIAL",
								label: "Filial",
								width: 15
							}, {
								property: "NF_ID",
								label: "ID NF",
								width: 15
							}, {
								property: "NUM_DOC",
								label: "N. DocF",
								width: 15
							}, {
								property: "SER",
								label: "Série DocF",
								width: 15
							}, {
								property: "DT_DOC",
								label: "Dt.doc",
								width: 15
							}, {
								property: "DT_E_S",
								label: "Data",
								width: 15
							}, {
								property: "DIRECT",
								label: "Ent/Saída",
								width: 15
							}, {
								property: "COD_PART",
								label: "Código partc.",
								width: 15
							}, {
								property: "CA_CNPJ_CPF",
								label: "CNPJ ou CPF",
								width: 15
							}, {
								property: "NOME",
								label: "Nome",
								width: 15
							}, {
								property: "CFOP",
								label: "Cód.CFOP",
								width: 15
							}, {
								property: "VL_ITEM",
								label: "VlTotDocto",
								width: 15
							}, {
								property: "VL_SENAR",
								label: "VrSENAR",
								width: 15
							}, {
								property: "VL_FUNRURAL",
								label: "VrFUNFURAL",
								width: 15
							}, {
								property: "CA_VL_TOT_FUN_SEN",
								label: "VrFUN+SEN",
								width: 15
							},

							{
								property: "UF",
								label: "UF",
								width: 15
							},

							{
								property: "DESC_MUN",
								label: "Município",
								width: 15
							},

							{
								property: "ICMSTAXPAY",
								label: "Contribuinte ICMS",
								width: 15
							},

							{
								property: "NUM_REF_LANCTO",
								label: "Ref.doc.origem",
								width: 15
							},

							{
								property: "NUM_LCTO",
								label: "Número do Lançamento",
								width: 15
							}
						]

					},
					dataSource: resultFinal
				};
			} else {
				oConfiguration = {
					fileName: "FUN_RESUMO_" + metadata,
					workbook: {

						columns: [{
							property: "COD_PART",
							label: "Código partc.",
							width: 15
						}, {
							property: "NOME",
							label: "Nome",
							width: 15
						}, {
							property: "VL_ITEM",
							label: "VlTotDocto",
							width: 15
						}, {
							property: "VL_SENAR",
							label: "VrSENAR",
							width: 15
						}, {
							property: "VL_FUNRURAL",
							label: "VrFUNFURAL",
							width: 15
						}, {
							property: "CA_VL_TOT_FUN_SEN",
							label: "VrFUN+SEN",
							width: 15
						}]
					},
					dataSource: resultFinal
				};
			}

			return oConfiguration;
		},
		onPress: function () {
			planilha1 = [];
			planilha2 = [];
			var bt1 = this.getView().byId('BtnExcel1');
			var bt2 = this.getView().byId('BtnExcel2');
			bt1.setEnabled(false);
			bt2.setEnabled(false);
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var that = this;
			var view = this.getView();
			if (oData.SelectedCompany == 0 || oData.SelectedBranch == 0 || oData.SelectedEntsai == 0) {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}

			if (!oData.SelectedPeriod.match(dateReg)) {
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
					planilha1 = response.result;
					planilha2 = Object.values(response.resultSum);
					metadata = content.company + '_' + content.branch + '_' + content.period.slice(3, 5) + content.period.slice(6);
					if (planilha1 && planilha1.length > 0) bt1.setEnabled(true);
					if (planilha2 && planilha2.length > 0) bt2.setEnabled(true);

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