<?php
/*
Plugin Name: {{package.displayName}} - WebComponent
Plugin URI:  {{package.homepage}}
Description: {{package.description}}
Version:     {{package.version}}
Author:      {{package.author}}
Author URI:  {{package.authorUrl}}
License:     MIT
License URI: https://github.com/thingnoy/wc-datepicker/main/LICENSE.md
*/
function wc_datepicker_load(){
	wp_enqueue_script("wc_datepicker", plugins_url('wc-datepicker', dirname(__FILE__))."/webcomponent.js", array(), false, true);
}

add_action("wp_enqueue_scripts", "wc_datepicker_load");
?>