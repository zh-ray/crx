"use strict";

function drawDygraphChart(dailyStats, div) {
    var data = [];
    for (var dateString in dailyStats) {
        var aDate = new Date(dateString);
        data.push([aDate, dailyStats[dateString]]);
    }
    // resort data array by ascending dates
    data.sort(function (a,b) { return a[0].valueOf() - b[0].valueOf() });

    var g = new Dygraph.GVizChart(document.getElementById(div));
    g.draw(data, { 
        fill: 50, 
        displayRangeSelector: false, 
        thickness: 1, 
        pointClickCallback: function (e, point) { 
            applyDateFilter(point.xval);
        },
        fillGraph: true,
        fillAlpha: 0.5,
        colors: ['#4684EE'],
        showRangeSelector: false,
        height: 250,
        width: 800,
        title: 'Visits per Day',
        titleHeight: 22,
        labels: [ 
            'Date',     // no i18n needed, this text is never displayed
            chrome.i18n.getMessage('number_of_visits')
        ],
        labelsDivWidth: 300,
        interactionModel: Dygraph.Interaction.nonInteractiveModel_,
        xAxisLabelWidth: 75,
        axes: {
            x: {
                axisLabelFormatter: function(d, gran) {
                    return d.strftime("%b %Y");
                },
                valueFormatter: function(ms) {
                    return new Date(ms).strftime("%B %d, %Y");
                },
                ticker: function(a, b, pixels, opts, dygraph, vals) {
                    return Dygraph.getDateAxis(a, b, Dygraph.MONTHLY, opts, dygraph);
                }
            }
        }
    });
}

function drawHourChart(hourStats, div) {
    var table = new google.visualization.DataTable();
    table.addColumn('string', 'Hour');  // no i18n needed; text not displayed
    table.addColumn('number', chrome.i18n.getMessage('num_visits'));

    for (var i = 0; i < hourStats.length; i++) {
        var amPm = (i < 12) ? 'am' : 'pm';
        var hour = (i == 0 || i == 12) ? '12' : (i % 12).toString();
        table.addRow([ hour + amPm, hourStats[i] ]);
    }
    
    var hourChart = new google.visualization.ColumnChart(document.getElementById(div));
    hourChart.draw(table, {
        width: 800, 
        height: 240, 
        title: chrome.i18n.getMessage('time_of_day'), 
        fontSize: 12.7,
        hAxis: { slantedText: true }
    });
    
    google.visualization.events.addListener(hourChart, 'select', function() {
        addFilter('hour', table.getValue(hourChart.getSelection()[0].row, 0));
        window.location.reload();
    });
}

function drawDayChart(dayStats, div) {
    var table = new google.visualization.DataTable();
    table.addColumn('string', 'Day of Week');  // no i18n needed; text is not displayed
    table.addColumn('number', chrome.i18n.getMessage('num_visits'));

    var dayMapping = [
        chrome.i18n.getMessage('sunday'),
        chrome.i18n.getMessage('monday'),
        chrome.i18n.getMessage('tuesday'),
        chrome.i18n.getMessage('wednesday'),
        chrome.i18n.getMessage('thursday'),
        chrome.i18n.getMessage('friday'),
        chrome.i18n.getMessage('saturday') 
    ];
    
    for (var i = 0; i < dayStats.length; i++) {
        table.addRow([ dayMapping[i], dayStats[i] ]);
    }
    
    var dayChart = new google.visualization.ColumnChart(document.getElementById(div));
    dayChart.draw(table, {
        width: 800, height: 240, title: chrome.i18n.getMessage('day_of_week')
    });
    
    google.visualization.events.addListener(dayChart, 'select', function() {
        addFilter('weekday', table.getValue(dayChart.getSelection()[0].row, 0));
        window.location.reload();
    });
}


function drawDayOfMonthChart(dayOfMonthStats, div) {
    var table = new google.visualization.DataTable();
    table.addColumn('string', 'Day of Month');  // no i18n needed; text not displayed
    table.addColumn('number', chrome.i18n.getMessage('num_visits'));

    for (var i = 1; i < dayOfMonthStats.length; i++) {
        table.addRow([ i.toString(), dayOfMonthStats[i] ]);
    }
    
    var dayOfMonthChart = new google.visualization.ColumnChart(document.getElementById(div));
    dayOfMonthChart.draw(table, {
        width: 800, height: 240, title: chrome.i18n.getMessage('day_of_month'),
        hAxis: { showTextEvery: 2 }
    });
    
    google.visualization.events.addListener(dayOfMonthChart, 'select', function() {
        addFilter('monthDay', table.getValue(dayOfMonthChart.getSelection()[0].row, 0));
        window.location.reload();
    });
}

function drawMonthChart(monthStats, div) {
    var table = new google.visualization.DataTable();
    table.addColumn('string', 'Month'); // no i18n needed; text not displayed
    table.addColumn('number', chrome.i18n.getMessage('num_visits'));

    var monthMapping = [
        chrome.i18n.getMessage('jan_abbr'),
        chrome.i18n.getMessage('feb_abbr'),
        chrome.i18n.getMessage('mar_abbr'),
        chrome.i18n.getMessage('apr_abbr'),
        chrome.i18n.getMessage('may_abbr'),
        chrome.i18n.getMessage('jun_abbr'),
        chrome.i18n.getMessage('jul_abbr'),
        chrome.i18n.getMessage('aug_abbr'),
        chrome.i18n.getMessage('sep_abbr'),
        chrome.i18n.getMessage('oct_abbr'),
        chrome.i18n.getMessage('nov_abbr'),
        chrome.i18n.getMessage('dec_abbr') 
    ];
    
    for (var i = 0; i < monthStats.length; i++) {
        table.addRow([ monthMapping[i], monthStats[i] ]);
    }
    
    var monthChart = new google.visualization.ColumnChart(document.getElementById(div));
    monthChart.draw(table, {
        width: 800, height: 240, title: chrome.i18n.getMessage('month')
    });
    
    google.visualization.events.addListener(monthChart, 'select', function() {
        addFilter('month', table.getValue(monthChart.getSelection()[0].row, 0));
        window.location.reload();
    });
}

function drawTransitionChart(transitionStats, div, definition_id) {
    var table = new google.visualization.DataTable();
    table.addColumn('string', 'Transition');  // no i18n needed; text not displayed
    table.addColumn('number', chrome.i18n.getMessage('num_visits'));

    for (var key in transitionStats) {
        table.addRow([ key, transitionStats[key] ]);
    }
    
    var transitionChart = new google.visualization.PieChart(document.getElementById(div));
    transitionChart.draw(table, {
        width: 800, height: 240, title: chrome.i18n.getMessage('transition_type')
    });
    
    google.visualization.events.addListener(transitionChart, 'select', function() {
        addFilter('transition', table.getValue(transitionChart.getSelection()[0].row, 0));
        window.location.reload();
    });
    
    // Add a link to the definition of transition types
    var definition_div = document.getElementById(definition_id);
    var anchor = document.createElement('a');
    anchor.setAttribute('href', 'http://code.google.com/chrome/extensions/history.html#transition_types');
    anchor.appendChild(document.createTextNode(chrome.i18n.getMessage('define_transitions')));
    definition_div.appendChild(anchor);
}
