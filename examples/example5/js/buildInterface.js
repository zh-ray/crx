"use strict";

function createOverview(trends, divId) {
    // keep track of events, mapping element ids 
    // to their event callback
    var events = {
        click: {},
        keyup: {}
    };

    var div = document.getElementById(divId);

    div.appendChild( createUnlimitedLink() );

    // Display heading
    div.appendChild( createHeading() );

    div.appendChild( createClearDiv() );

    // Display list of current filters with Clear buttons
    div.appendChild( createFilterDiv(events) );    

    // Display total counts
    div.appendChild( createCountsDiv(trends) );

    div.appendChild( createDomainBackLink(events) );
    
    // Add a div to clear prior floats
    div.appendChild( createClearDiv() );

    // Determine the active tab.  The id attribute on the <body> tag must be set to the
    // active tab for it to display properly.
    var activeTab = getActiveTab();
    document.body.setAttribute('id', activeTab);

    // Create a container for tabs
    var tabsDiv = createTabsContainer(events);
    
    // Display the Top 10 Most Visited Domains table
    var domainProperties = {
        rows: trends.topDomains,
        rowIdPrefix: 'domainlink',
        onclickFunction: applyDomainFilter,
        linkTitle: chrome.i18n.getMessage('domain_hover_text'),
        containerId: 'domain_container',
        tableId: 'domain_table',
        tableClass: 'tab_2col',
        tableHeaders: {
            normal: [ 'top10_domains',  'visit_count' ],
            popup:  [ 'top100_domains', 'visit_count' ]
        },
        dataTableColumns: [
            { sWidth: "70%" },
            { sType: "data-sort-numeric", sWidth: "30%" }
        ],
        popupWidth: "50%",
        columnFormats: ["t", "n"],
        filterTextBoxId: 'domain_custom_filter_text',
        filterSubmitId: 'domain_custom_filter_go',
        filterText: chrome.i18n.getMessage('filter_by_domain'),
        filterPlaceholder: 'example.com'
    };
    tabsDiv.appendChild( createTab('tab1', activeTab, domainProperties, events) );

    // Display the Top 10 Most Visited URLs table 
    var urlProperties = {
        rows: trends.topUrls,
        rowIdPrefix: 'urllink',
        onclickFunction: applyUrlFilter,
        linkTitle: chrome.i18n.getMessage('url_hover_text'),
        containerId: 'url_container',
        tableId: 'url_table',
        tableClass: 'tab_2col',
        tableHeaders: {
            normal: [ 'top10_urls',  'visit_count' ],
            popup:  [ 'top100_urls', 'visit_count' ]
        },
        dataTableColumns: [
            null,
            { sType: "data-sort-numeric" }
        ],
        popupWidth: "60%",
        columnFormats: ["t", "n"],
        filterTextBoxId: 'url_custom_filter_text',
        filterSubmitId: 'url_custom_filter_go',
        filterText: chrome.i18n.getMessage('filter_by_url'),
        filterPlaceholder: 'http://www.example.com/'
    };
    tabsDiv.appendChild( createTab('tab2', activeTab, urlProperties, events) );
    div.appendChild( tabsDiv );

    // Display the Top 10 Domains with most unique URLs
    var uniqueUrlColumns = [
        'top10_unique_urls',
        'unique_url_count',
        'visit_count',
        'percent_unique_visits',
    ];
    var uniqueUrlProperties = {
        rows: trends.topUniqueVisits,
        rowIdPrefix: 'uniqueUrlLink',
        onclickFunction: applyDomainFilter,
        linkTitle: chrome.i18n.getMessage('domain_hover_text'),
        containerId: 'unique_url_container',
        tableId: 'unique_url_table',
        tableClass: 'tab_4col',
        tableHeaders: {
            normal: uniqueUrlColumns,
            popup:  uniqueUrlColumns
        },
        dataTableColumns: [
            null,
            { sType: "data-sort-numeric" },
            { sType: "data-sort-numeric" },
            { sType: "data-sort-numeric" }
        ],
        popupWidth: "70%",
        columnFormats: ["t", "n", "n", "p"]
    };
    tabsDiv.appendChild( createTab('tab3', activeTab, uniqueUrlProperties, events) );

    // Add a div to clear the prior floats
    tabsDiv.appendChild( createClearDiv() );
   
    // Display the Daily Stats table
    div.appendChild( createDailyStats(trends) );

    // Display the Top 10 Busiest Days table
    var daysProperties = {
        rows: trends.topDays,
        rowIdPrefix: 'busiestday',
        containerId: 'busiest_days_container',
        tableId: 'busiest_days',
        tableClass: 'tab_2col',
        onclickFunction: applyDateFilter,
        linkTitle: chrome.i18n.getMessage('day_hover_text'),
        tableHeaders: {
            normal: [ 'top10_days',  'visit_count' ],
            popup:  [ 'top100_days', 'visit_count' ]
        },
        dataTableColumns: [
            { sType: "data-sort-numeric" },
            { sType: "data-sort-numeric" }
        ],
        columnFormats: ["d", "n"],
        popupWidth: "50%"
    };
    div.appendChild( createTable(daysProperties, events) );

    // Define callbacks for clicking a link in each table
    var domainLinkCallback = function() {
        applyDomainFilter( $(this).attr('data-sort') );
    };
    var urlLinkCallback = function() {
        applyUrlFilter( $(this).attr('data-sort') );
    };
    var dateLinkCallback = function() {
        applyDateFilter( $(this).attr('data-sort') );
    };

    var setupArray = [
        // Top 10 tables
        [ domainProperties.tableId,    domainLinkCallback ],
        [ uniqueUrlProperties.tableId, domainLinkCallback ],
        [ urlProperties.tableId,       urlLinkCallback    ],
        [ daysProperties.tableId,      dateLinkCallback   ],
        // Top 100 tables (popups)
        [ domainProperties.containerId    + '_more', domainLinkCallback ],
        [ uniqueUrlProperties.containerId + '_more', domainLinkCallback ],
        [ urlProperties.containerId       + '_more', urlLinkCallback    ],
        [ daysProperties.containerId      + '_more', dateLinkCallback   ],
        // Daily Stats table
        [ 'per_day_stats', dateLinkCallback ]
    ];
    for (var i = 0; i < setupArray.length; i++) {
        var row = setupArray[i];
        $('#' + row[0]).on( 'click', 'a', row[1] );
    }

    // set up event listeners
    for (var eventType in events) {
        for (var id in events[eventType]) {
            document.getElementById(id).addEventListener(eventType, events[eventType][id]);
        }
    }

    return;
}


function buildTable(headers, rows, props) {
    var table = document.createElement('table');
    for (var key in props) {
        table.setAttribute(key, props[key]);
    }

    var thead = document.createElement('thead');
    
    if (headers) {
        var tr = document.createElement('tr');
        for (var i = 0; i < headers.length; i++) {
            var th = document.createElement('th');
            th.appendChild(document.createTextNode(headers[i][0]));
            var props = headers[i][1];
            for (var key in props) {
                th.setAttribute(key, props[key]);
            }
            th.setAttribute('class', 'col' + (i + 1));
            tr.appendChild(th);
        }
        thead.appendChild(tr);
    }

    var tbody = document.createElement('tbody');

    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        var tr = document.createElement('tr');
        var row = rows[rowIndex];
        for (var colIndex = 0; colIndex < row.length; colIndex++) {
            var td = document.createElement('td');
            td.setAttribute('class', 'col' + (colIndex + 1));
            td.appendChild(row[colIndex]);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    return table;
}



/* 
    switchTab( tabName )

    Called when a user switches to a new tab.  Does the work of hiding
    the current tab and displaying the new tab.
*/
function switchTab(tabName) {
    window.sessionStorage.setItem('activeTab', tabName);
    document.getElementById('domain_container').style.display = (tabName == 'tab1' ? '' : 'none');
    document.getElementById('url_container').style.display = (tabName == 'tab2' ? '' : 'none');
    document.getElementById('unique_url_container').style.display = (tabName == 'tab3' ? '' : 'none');
    document.body.setAttribute('id', tabName);
}


/*
    applyUrlFilter( url )

    Called when a user clicks on a URL. Adds the URL filter and reloads the page.
*/

function applyUrlFilter(url) {
    addFilter("url", url);
    window.location.reload();
}


/*
    applyDomainFilter( domain )

    Called when a user clicks on a domain.  Adds the domain filter and reloads the page.
*/
function applyDomainFilter(domain) {
    addFilter("domain", domain);
    window.location.reload();
}


/*
    applyDateFilter( time_ms )

    Called when a user clicks on a date.  Adds the date filter and reloads the page.
*/
function applyDateFilter(time_ms) {
    var date = new Date(parseInt(time_ms));
    addFilter("date", date.toDateString());
    window.location.reload();
}


/*
    applyRemoveAllFilters()

    Called when a user clicks the "Clear All Filters" button.  Removes all filters and reloads the page.
*/
function applyRemoveAllFilters() {
    removeAllFilters();
    window.location.reload();
}


/*
    applyRemoveFilter( filter )

    Called when a user clicks the "Clear" button for a filter.  Removes the filter and reloads the page.
*/
function applyRemoveFilter(filter) {
    removeFilter(filter);
    window.location.reload();
}


function createHeading() {
    var heading = document.createElement('h2');
    heading.appendChild( document.createTextNode(chrome.i18n.getMessage('extension_name')) );
    return heading;
}

// Display a list of current filters along with a "Clear All" button
function createFilterDiv(events) {
    var filterDiv = document.createElement('div');
    filterDiv.setAttribute('id', 'filters');

    var filters = getFilters();
    if (!filters) {
        return filterDiv;
    }

    var html = chrome.i18n.getMessage('results_filtered') + '<br />';
    var filterCount = 0;
    for (var key in filters) {
        ++filterCount;
        var id = "removeFilter" + filterCount;
        html += 
            '<div class="filter_value">' + 
                getFilterText(key, filters[key]) + 
                '&nbsp;&nbsp;&nbsp;' + 
                '<input id="' + id + '" type="submit" value="' + chrome.i18n.getMessage('clear') + '" />' +
            ' </div>';
        // use a closure to preserve the value of key
        var generate_callback = function(key) {
            return function() { applyRemoveFilter(key) };
        }
        events.click[id] = generate_callback(key);
    }
    if (filterCount > 1) {
        html += 
            '<div class="filter_value">' +
            '<input id="clear_all" type="submit" value="' + chrome.i18n.getMessage('clear_all') + '" />'
            '</div>'
        ;
        events.click["clear_all"] = applyRemoveAllFilters;
    }
    filterDiv.innerHTML += html;
    
    return filterDiv;
}

// Display a link to History Trends Unlimited
function createUnlimitedLink() {
    var id = 'unlimited_link';
    var anchor = document.createElement('a');
    anchor.setAttribute(
        'href', 
        "https://chrome.google.com/webstore/detail/history-trends-unlimited/pnmchffiealhkdloeffcdnbgdnedheme"
    );
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('id', id);
    anchor.appendChild(document.createTextNode(chrome.i18n.getMessage('unlimited_link')));
    return anchor;
}


// Display a count of URLs visited and number of times visited
function createCountsDiv(trends) {
    var countsDiv = document.createElement('div');
    countsDiv.setAttribute('id', 'counts');
    countsDiv.innerHTML = chrome.i18n.getMessage('url_stats', [trends.historyItems.toString(), trends.visitItems.toString()]);
    return countsDiv;
}

// Set up the tabs container
function createTabsContainer(events) {
    var tabsDiv = document.createElement('div');
    tabsDiv.setAttribute('id', 'tab_container');
    
    var domainTabName = chrome.i18n.getMessage('domain_tab_name');
    var urlTabName = chrome.i18n.getMessage('url_tab_name');
    var uniqueUrlTabName = chrome.i18n.getMessage('unique_url_tab_name');
    
    tabsDiv.innerHTML =
        '<ul id="tabnav">' +
            '<li class="tab1"><a id="tablink1" href="javascript:void(0);">' + domainTabName + '</a></li>' +
            '<li class="tab2"><a id="tablink2" href="javascript:void(0);">' + urlTabName + '</a></li>' +
            '<li class="tab3"><a id="tablink3" href="javascript:void(0);">' + uniqueUrlTabName + '</a></li>' +
        '</ul>'
    ;
    
    events.click['tablink1'] = function() { switchTab('tab1') };
    events.click['tablink2'] = function() { switchTab('tab2') };
    events.click['tablink3'] = function() { switchTab('tab3') };

    return tabsDiv;
}


function createTab(tabName, activeTab, props, events) {
    var tabContainer = createTable(props, events);

    // Hide the tab if it's not active
    if (activeTab != tabName) {
        tabContainer.setAttribute('style', 'display: none;');
    }

    return tabContainer;
}


/*
    createTable(props, events)

    The props argument contains the following keys/values:
        rows:               array of domain/url objects
        rowIdPrefix:        id prefix for each domain/url link
        onclickFunction:    applyDomainFilter/applyUrlFilter
        linkTitle:          'Filter by this Domain/URL'
        containerId:        'domain_container'/'url_container'
        tableClass:         class for table tag
        tableHeaders:       hash mapping "normal"/"popup" to array of column names
        dataTableColumns:   array to pass to aoColumns property of dataTable()
        columnFormats:      one-letter format codes for each column:
                            t => text (i.e., no formatting)
                            d => date string
                            p => integer percent
                            n => integer
        filterTextBoxId:    Id of textbox for custom domain/url
        filterSubmitId:     Id of submit button for custom domain/url
        filterText:         'Filter by domain: '/'Filter by URL: '
        filterPlaceholder:  'example.com'/'http://www.example.com/'
*/

function createTable(props, events) {
    var container = document.createElement('div');
    container.setAttribute('id', props.containerId);
    container.setAttribute('class', 'light_background');
    
    var maxRows = props.rows.length > 10 ? 10 : props.rows.length;
    var tableRows = createTableRows(props, 0, maxRows);

    var smallHeaderColumns = [];
    for (var i = 0; i < props.tableHeaders.normal.length; i++) {
        smallHeaderColumns.push( [ chrome.i18n.getMessage( props.tableHeaders.normal[i] ), { 'class': 'col' + (i + 1) } ] );
    }

    var tableClass = props.tableClass ? ' ' + props.tableClass : '';

    container.appendChild(
        buildTable(
            smallHeaderColumns,
            tableRows, 
            { 
                id: props.tableId, 
                'class': 'top10 main_table' + tableClass
            }
        )
    );

    // Display controls to search for a specific Domain or URL

    var bottomRowDiv = document.createElement('div');
    bottomRowDiv.setAttribute('class', 'tab_bottom_row');
    
    if (props.filterTextBoxId) {
        var filterDiv = document.createElement('div');
        filterDiv.setAttribute('class', 'filter_controls');
        filterDiv.appendChild(document.createTextNode(props.filterText));

        var filterText = document.createElement('input');
        filterText.setAttribute('id', props.filterTextBoxId);
        filterText.setAttribute('type','text');
        filterText.setAttribute('placeholder', props.filterPlaceholder);
        filterText.setAttribute('size','35');
        filterDiv.appendChild(filterText);
        
        var filterButton = document.createElement('input');
        filterButton.setAttribute('type', 'submit');
        filterButton.setAttribute('id', props.filterSubmitId);
        filterButton.setAttribute('value', chrome.i18n.getMessage('go'));
        filterDiv.appendChild(filterButton);
    
        bottomRowDiv.appendChild(filterDiv);
        events.click[props.filterSubmitId] = function() { 
            props.onclickFunction(document.getElementById(props.filterTextBoxId).value);
        };
        events.keyup[props.filterTextBoxId] = function (e) {
            if (e.which == 13) {
                props.onclickFunction(document.getElementById(props.filterTextBoxId).value);
            }
        };
    }


    if (props.rows.length > 10) {
        // Create a hidden div containing content for the View More Domains/URLs link

        var moreMaxRows = props.rows.length > 100 ? 100 : props.rows.length;
        var moreTableRows = createTableRows(props, 0, moreMaxRows);

        var popupHeaderColumns = [];
        for (var i = 0; i < props.tableHeaders.popup.length; i++) {
            popupHeaderColumns.push( [ chrome.i18n.getMessage( props.tableHeaders.popup[i] ), { 'class': 'col' + (i + 1) } ] );
        }
        var moreTableId = props.tableId + '_more';
        var hiddenDiv = document.createElement('div');
        var hiddenDivId = props.containerId + '_more';
        hiddenDiv.setAttribute('id', hiddenDivId);
        hiddenDiv.appendChild(
            buildTable(
                popupHeaderColumns,
                moreTableRows, 
                {
                    id: moreTableId,
                    'class': 'top10 main_table light_background popup' + tableClass 
                }
            )
        );
        var hiddenParentDiv = document.createElement('div');
        hiddenParentDiv.setAttribute('style', 'display: none;');
        hiddenParentDiv.appendChild(hiddenDiv);

        container.appendChild(hiddenParentDiv);

        // Display a link to View More of the top URLs

        var viewMoreAnchor = document.createElement('a');
        var viewMoreAnchorId = hiddenDivId + '_link';
        viewMoreAnchor.setAttribute('href', 'javascript:void(0);');
        viewMoreAnchor.setAttribute('id', viewMoreAnchorId);
        viewMoreAnchor.appendChild(document.createTextNode(chrome.i18n.getMessage('view_more')));

        var generate_callback = function(divId, tableId) {
            return function(e) { 
                $.colorbox({
                    inline:true, 
                    href:"#" + divId, 
                    height:"85%", 
                    width: props.popupWidth,
                    onComplete: function() {
                        $("#" + tableId ).dataTable({
                            aaSorting: [[1, "desc"]],
                            aoColumns: props.dataTableColumns,
                            bAutoWidth: false,
                            bPaginate: false,
                            bProcessing: false,
                            bSort: true,
                            bStateSave: false,
                            bFilter: false,
                            bInfo: false,
                            bRetrieve: true
                        });
                    }
                }); 
                e.preventDefault();
            };
        };
        events.click[viewMoreAnchorId] = generate_callback(hiddenDivId, moreTableId);

        var viewMoreDiv = document.createElement('div');
        viewMoreDiv.setAttribute('class', 'tab_view_more');
        viewMoreDiv.appendChild(viewMoreAnchor);
        
        bottomRowDiv.appendChild(viewMoreDiv);
    }
    
    container.appendChild(bottomRowDiv);

    return container;
}


function createTableRows(props, startIndex, stopIndex, opts) {
    var tableRows = [];

    for (var i = startIndex; i < stopIndex; i++) {
        var row = [];
        var text = formatValue( props.rows[i][0], props.columnFormats[0] );
        var anchor = document.createElement('a');
        var id = props.rowIdPrefix + i;
        anchor.setAttribute('href', 'javascript:void(0);');
        anchor.setAttribute('id', id);
        anchor.setAttribute('title', props.linkTitle);
        anchor.setAttribute('data-sort', sortValue( props.rows[i][0], props.columnFormats[0] ));
        anchor.appendChild( document.createTextNode(text) );
        row.push( anchor );

        for (var j = 1; j < props.rows[i].length; j++) {
            var rawValue = props.rows[i][j];
            var formattedValue = formatValue( rawValue, props.columnFormats[j] );

            var span = document.createElement('span');
            span.setAttribute( 'data-sort', sortValue( rawValue, props.columnFormats[j] ) );
            span.appendChild( document.createTextNode(formattedValue) );

            row.push( span );
        }

        tableRows.push( row );
    }

    return tableRows;
}



function createDailyStats(trends) {
    // Create a link to filter for Today's visits

    var todayLink = document.createElement('a');
    var todayLinkId = 'todaylink';
    todayLink.setAttribute('href', 'javascript: void(0);');
    todayLink.setAttribute('id', todayLinkId);
    todayLink.setAttribute('title', chrome.i18n.getMessage('today_hover_text'));
    todayLink.setAttribute('data-sort', new Date().getTime());
    todayLink.appendChild(document.createTextNode(chrome.i18n.getMessage('today')));

    // Display the Daily Stats table

    var dailyStatsContainer = document.createElement('div');
    dailyStatsContainer.setAttribute('id', 'daily_stats_container');
    dailyStatsContainer.setAttribute('class', 'light_background');
    
    var avg_visits_text = chrome.i18n.getMessage('average_visits');
    var mean_visits_text = chrome.i18n.getMessage('median_visits');
    var not_applicable_text = chrome.i18n.getMessage('not_applicable');
    
    dailyStatsContainer.appendChild(
        buildTable(
            [
                [chrome.i18n.getMessage('daily_stats'), {}],
                ['', {}]
            ],
            [
                [document.createTextNode(avg_visits_text), document.createTextNode(trends.busiestDayMean || not_applicable_text)],
                [document.createTextNode(mean_visits_text), document.createTextNode(trends.busiestDayMedian || not_applicable_text)],
                [todayLink, document.createTextNode(trends.byBusiestDay[ (new Date).toDateString() ] || not_applicable_text) ]
            ],
            { id: 'per_day_stats', 'class': 'top10' }
        )
    );

    return dailyStatsContainer;
}

function createClearDiv() {
    var clear_div = document.createElement('div');
    clear_div.setAttribute('style', 'clear: both;');
    return clear_div;
}


function createDomainBackLink(events) {
    var backDiv = document.createElement('div');
    backDiv.setAttribute('id', 'back_domain');

    var filters = getFilters();
    if (filters && filters.domain) { 
        var newDomain = stripSubDomain(filters.domain);
        if (newDomain) {
            var id = 'back_domain_link';
            var anchor = document.createElement('a');
            anchor.setAttribute('href', 'javascript:void(0);');
            anchor.setAttribute('id', id);
            anchor.appendChild(document.createTextNode(chrome.i18n.getMessage('return_to', newDomain)));
            backDiv.appendChild(anchor);

            events.click[id] = function(e) { 
                applyDomainFilter(newDomain); 
                e.preventDefault();
            };
        }
    }

    return backDiv;
}

function formatValue( value, code ) {
    var formatted;

    if (code == "p") {
        formatted = Math.round(value * 100, 0) + " %";
    }
    else {
        formatted = value;
    }

    return formatted;
}

function sortValue( value, code ) {
    var newValue;

    if (code == "d") {
        newValue = new Date(value).getTime();
    }
    else {
        newValue = value;
    }

    return newValue;
}


