import 'bootstrap';
import Highcharts from 'highcharts/highstock';
window.Highcharts = Highcharts;
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/histogram-bellcurve')(Highcharts);
require('highcharts/modules/map')(Highcharts);
import TagsInput from 'tags-input';
window.TagsInput = TagsInput;
import $ from 'jquery';
window.$ = $;
import dt from 'datatables.net-bs4';
import 'datatables.net-responsive-bs4';
window.$.DataTable = dt;
import introJs from 'intro.js';
window.introJs = introJs;
import './scss/app.scss';