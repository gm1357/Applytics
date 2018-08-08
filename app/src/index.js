import 'bootstrap';
import Highcharts from 'highcharts/highstock';
window.Highcharts = Highcharts;
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/histogram-bellcurve')(Highcharts);
import './scss/app.scss';