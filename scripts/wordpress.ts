/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Wordpress Package
 * =====================
 *
 * @contributors: Thingnoy <boyskypart@gmail.com> (https://github.com/thingnoy)
 *
 * @license: MIT License
 *
 */
import * as fs from "fs";
import * as shell from "shelljs";
import nunjucks from "nunjucks";
const pkg = require("../package.json");

declare const __dirname: string;

nunjucks.configure({
	autoescape: false,
});

let html = nunjucks.render(`${__dirname}/../wordpress/readme.txt`, { package: pkg });
fs.writeFileSync(`${__dirname}/../dist/readme.txt`, html, "utf8");

html = nunjucks.render(`${__dirname}/../wordpress/wc_datepicker.php`, { package: pkg });
fs.writeFileSync(`${__dirname}/../dist/wc_datepicker.php`, html, "utf8");

shell.mkdir("-p", `${__dirname}/../build/${pkg.name.replace("@thingnoy/", "")}/`);
shell.mkdir("-p", `${__dirname}/../dist/wordpress/`);
shell.cp("-R", `${__dirname}/../dist/*`, `${__dirname}/../build/${pkg.name.replace("@thingnoy/", "")}/`);

shell.rm("-r", `${__dirname}/../build/${pkg.name.replace("@thingnoy/", "")}/wordpress`);
shell.exec(`cd build && zip -r ../dist/wordpress/${pkg.name.replace("@thingnoy/", "")}-wordpress-plugin.zip .`);

shell.rm("-r", `${__dirname}/../build`);
shell.rm("-r", `${__dirname}/../dist/wc_datepicker.php`);
shell.rm("-r", `${__dirname}/../dist/readme.txt`);
