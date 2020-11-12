/* utils.js - a collection of utility methods */
"use strict";

/* Filter utilities */

function getFilters() {
    var filters = JSON.parse(window.sessionStorage.getItem("filters"));
    var count = 0;
    for (var key in filters) {
        ++count;
    }
    return count ? filters : null;
}

function saveFilters(newFilters) {
    window.sessionStorage.setItem("filters", JSON.stringify(newFilters));
}

function addFilter(key, value) {
    var filters = getFilters() || {};
    filters[key] = value;
    saveFilters(filters);
}


function removeFilter(key) {
    var filters = getFilters() || {};
    delete filters[key];
    var count = 0;
    for (var key in filters) {
        ++count;
    }
    saveFilters(count ? filters : null);
}


function removeAllFilters() {
    saveFilters(null);
}


function getFilterText(key, value) {
    var text = '';
    switch(key) {
        case "url":
            text = 'URL';
            break;
        default:
            text = value;
    }
    return text;
}

function stripSubDomain(host) {
    if (host == public_suffix.get_root_domain(host)) {
        return;
    }
    var matches = host.match(/^[^.]+\.([^.]+\..+)$/);
    return matches ? matches[1] : undefined;
}

/* 
    getActiveTab()
    
    Returns the active tab.  Defaults to 'tab1' if no active tab is set. 
*/

function getActiveTab() {
    var activeTab = window.sessionStorage.getItem('activeTab');
    if (!activeTab || (activeTab != 'tab1' && activeTab != 'tab2' && activeTab != 'tab3')) {
        activeTab = 'tab1';
        window.sessionStorage.setItem('activeTab', activeTab);
    }
    return activeTab;
}

/*
    getDomainPortion(host, baseDomain)
    
    For the given host, returns a portion of the domain name.
    If baseDomain is empty, returns the root domain.
    If baseDomain is populated, returns the baseDomain plus the next subdomain, if it exists.
    
    Examples:  
        getDomainPortion('www.blog.example.com') returns 'example.com'
        getDomainPortion('www.blog.example.com', 'example.com') returns 'blog.example.com'
        getDomainPortion('www.blog.example.com', 'blog.example.com') returns 'www.blog.example.com'
*/

function getDomainPortion(host, baseDomain) {
    var domain;
    host = host || '';
    baseDomain = baseDomain || '';
    
    if (baseDomain.length) {
        var regex = new RegExp('[^.]*\\.?' + escapeDots(baseDomain) + '$');
        var matches = host.match(regex);
        domain = matches ? matches[0] : undefined;
    }
    else {
        domain = public_suffix.get_root_domain(host);
    }
    
    return domain;
}


/*
    extractHost(url)
  
    Returns the hostname portion of the given url.
    Example:
        extractHost('http://www.example.com/?x=1') returns 'www.example.com'
 */
function extractHost(url) {
    var matches = url.match(/^.+?:\/\/(?:[^:@]+:[^@]+@)?([^\/?:]+)/);
    return matches ? matches[1] : undefined;
}


/*
    domainMatch(host, domain_filter)

    Returns true if host matches the given domain_filter.
    If no domain_filter is given, returns true.

    Examples:
        domainMatch('news.google.com', 'news.google.com') returns true
        domainMatch('news.google.com', 'google.com') returns true
        domainMatch('news.google.com', 'example.com') returns false
*/

function domainMatch(host, domain_filter) {
    host = host || '';

    if (!domain_filter) {
        return 1;
    }
    
    if (host == domain_filter) {
        // matched full domain
        return 1;
    }
    else {
        // matched partial domain
        var regex = new RegExp(escapeDots('.' + domain_filter) + '$');
        return regex.test(host);
    }
}


function escapeDots(string) {
    return string.replace(/\./g, '\\.');
}


/* Statistics utilities */

function calcMedian(values) {
    var median;

    if (!values.length) {
        return;
    }
    else if (values.length % 2 == 0) {
        var middle = values.length / 2;
        var lower_middle = values[ middle - 1 ];
        var upper_middle = values[ middle ];
        median = calcMean([lower_middle, upper_middle]);
    }
    else {
        var middle = Math.floor( values.length / 2 );
        median = values[middle];
    }

    return median;
}


function calcMean(values) {
    if (!values.length) {
        return;
    }
    
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return( Math.round(sum/values.length, 0) );
}


/* Time Conversion utilities */

// For example, convert '3pm' to '15'
function convert_12_to_24(hour12) {
    var hour24;
    if (hour12 == '12am') {
        hour24 = 0;
    }
    else if (hour12 == '12pm') {
        hour24 = 12;
    }
    else {
        var offset = hour12.substr(-2,2) == 'am' ? 0 : 12;
        hour12 = parseInt(hour12.replace(/(am|pm)/, ''));
        hour24 = hour12 + offset;
    }

    return hour24;
}


/* Number formatting */

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
