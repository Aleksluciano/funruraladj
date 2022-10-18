/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0*/
/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/node", require("./routes/myNode")());
	app.use("/data", require("./routes/myData")());
	app.use("/change", require("./routes/myChange")());
	app.use("/vigencia/add", require("./routes/vigencia/add")());
	app.use("/vigencia/alldata", require("./routes/vigencia/alldata")());
	app.use("/vigencia/delete", require("./routes/vigencia/delete")());
	app.use("/vigencia/edit", require("./routes/vigencia/edit")());
		app.use("/codtipo/add", require("./routes/codtipo/add")());
	app.use("/codtipo/alldata", require("./routes/codtipo/alldata")());
	app.use("/codtipo/delete", require("./routes/codtipo/delete")());
	app.use("/codtipo/edit", require("./routes/codtipo/edit")());
	app.use((err, req, res, next) => {
		console.error(JSON.stringify(err));
		res.status(500).send(`System Error ${JSON.stringify(err)}`);
	});

};