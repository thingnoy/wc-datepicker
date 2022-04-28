/**
 * Delete dist folder
 * =====================
 *
 * @contributors: Thingnoy <boyskypart@gmail.com> (https://github.com/thingnoy)
 *
 * @license: MIT License
 *
 */
import * as shell from "shelljs";
declare const __dirname: string;

const path = `${__dirname}/../dist`;

shell.rm("-Rf", path);
