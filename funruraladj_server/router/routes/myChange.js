/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");

function pad(n) {
	return n < 10 ? '0' + n : n;
}

module.exports = () => {
	var app = express.Router();

	//HANA DB Client 
	app.post("/", async(req, res) => {

		const {
			company,
			branch,
			period,
			direct
		} = req.body;
		const period1 = period.slice(6) + period.slice(3, 5) + '01';
		const newdate = new Date(period.slice(6), parseFloat(period.slice(3, 5)) + 1, 0);
		const period2 = period.slice(6) + period.slice(3, 5) + newdate.getDate().toString();

		//validações
		if (!company) return res.type("text/plain").status(500).send(`ERROR: Filtro de empresa faltando`);
		if (!branch) return res.type("text/plain").status(500).send(`ERROR: Filtro de filial faltando`);
		if (period1.slice(4, 6) !== period2.slice(4, 6)) return res.type("text/plain").status(500).send(
			`ERROR: Filtro de data maior que um mês`);
		if (!direct || direct > 3) return res.type("text/plain").status(500).send(`ERROR: Filtro de entrada e saída incorreto`);

		let client = req.db;

		//QUERIES
		const query_select_v_emp_fed = `select "MANDT_TDF" from "adejo.view::/TMF/V_EMP_FED" WHERE EMPRESA = ? AND EH_MATRIZ = 'X'`;

		//SQL EXEC
		const resultAll = [];
		let item = 0;
		const resultSum = {};
		try {
			let v_emp_fed_table = await client.exec(query_select_v_emp_fed, [company]);
			const query_select_funrural =
				`SELECT *
FROM "CV_FUNRURAL"
	(placeholder."$$P_EMP$$"=> '${company}', 
	placeholder."$$P_FILIAL$$"=> '${branch}', 
	placeholder."$$P_DT_INI$$"=> '${period1}', 
	placeholder."$$P_DT_FIN$$"=> '${period2}', 
	placeholder."$$P_DIRECT$$"=> '${direct}', 
	placeholder."$$P_MANDT_TDF$$"=> '${v_emp_fed_table[0].MANDT_TDF}')`;
			console.log(query_select_funrural);
			let v_funfural_table = await client.exec(query_select_funrural);
			console.log(v_funfural_table);
			for (const v_funrural of v_funfural_table) {
				let vl_item = 0;
				let vl_senar = 0;
				let vl_funrural = 0;
				let vl_tot_fun_sen = 0;

				vl_item = parseFloat(v_funrural.VL_ITEM).toFixed(6);
				vl_senar = parseFloat(v_funrural.VL_SENAR).toFixed(6);
				vl_funrural = parseFloat(v_funrural.VL_FUNRURAL).toFixed(6);
				vl_tot_fun_sen = parseFloat(v_funrural.CA_VL_TOT_FUN_SEN).toFixed(6);

				if (direct == '3') {
					console.log("igual 3");
					if (v_funrural.DIRECT == '2') {
						vl_item = (parseFloat(v_funrural.VL_ITEM) * (-1)).toFixed(6);
						v_funrural.VL_ITEM = val_item.toString();
					}
				}

				if (resultSum[v_funrural.COD_PART]) {
					vl_item = vl_item + parseFloat(resultSum[v_funrural.COD_PART].VL_ITEM).toFixed(6);
					vl_senar = vl_senar + parseFloat(v_funrural.VL_SENAR).toFixed(6);
					vl_funrural = vl_funrural + parseFloat(v_funrural.VL_FUNRURAL).toFixed(6);
					vl_tot_fun_sen = vl_tot_fun_sen + parseFloat(v_funrural.CA_VL_TOT_FUN_SEN).toFixed(6);
				}

				resultSum[v_funrural.COD_PART] = {
					COD_PART: v_funrural.COD_PART,
					NOME: v_funrural.NOME,
					VL_ITEM: vl_item.toString(),
					VL_SENAR: vl_senar.toString(),
					VL_FUNRURAL: vl_funrural.toString(),
					CA_VL_TOT_FUN_SEN: vl_tot_fun_sen.toString()
				}

				item++;
				resultAll.push({... {
						item
					},
					...v_funrural
				});

			}

			return res.type("application/json").status(200).send({
				result: resultAll,
				resultSum: resultSum
			});

		} catch (err) {
			console.log(err)
			return res.type("text/plain").status(500).send(`ERROR: code: ${err.code} message: ${err.message}`);
		}
	});

	return app;
};