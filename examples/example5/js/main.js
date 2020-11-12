"use strict";

// History Trends setup
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('waiting_text').innerHTML = chrome.i18n.getMessage("waiting_text");
});
google.load("visualization", "1", {packages:["corechart", "annotatedtimeline"]});
google.setOnLoadCallback(initialize);
function initialize() {
    calcTrends(buildDom);
    function buildDom(trends) {
        // Several charts must be visible for them to render correctly
        document.getElementById('waiting_container').style.display = 'none';
        document.getElementById('trends_container').style.display = 'block';
        createOverview(trends, 'overview');
        drawHourChart(trends.byHour, 'chart_hour');
        drawDayChart(trends.byDay, 'chart_day');
        drawDayOfMonthChart(trends.byDayOfMonth, 'chart_day_of_month');
        drawMonthChart(trends.byMonth, 'chart_month');
        drawTransitionChart(trends.byTransition, 'chart_transition', 'transition_definition');
        drawDygraphChart(trends.byBusiestDay, 'chart_time');
    }
}

// Google Analytics setup
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-836968-5']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
