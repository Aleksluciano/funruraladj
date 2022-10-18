"use strict";
sap.ui.define([], function () {
	"use strict";
	var month = (new Date().getMonth() + 1).toString();
	var year = (new Date().getFullYear()).toString();

	if (month.length < 2) {
		month = '0' + month;
	}
	var date = '01' + '/' + month + '/' + year; 

	return {
		Simulation: true,
		StateList: { 	highlight: "Success",
						info: "Processado"},
		Results: [],
		Companies: [],
		Branchs: [],
		ItemIncentivo: "",
		CodigoIrf: "",
		CatImposto: "",
		SelectedCompany: 0,
		SelectedBranch: 0,
		SelectedBranch2: 0,
		SelectedEntsai: 0,
		SelectedPeriod: date,
		CompanyCollection: [],
		BranchCollection: [],
		EntsaiCollection:[{Id:0,Name:""},{Id:1,Name:"1 - Entrada"},{Id:2,Name:"2 - Saída"},{Id:3,Name:"3 - Entrada/Saída"}]
	};
});