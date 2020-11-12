"use strict";

function calcTrends(buildDom) {
    // Track the number of callbacks from chrome.history.getVisits()
    // that we expect to get.  When it reaches zero, we have all results.
    var numRequestsOutstanding = 0;
    var filters = getFilters();
  
    chrome.history.search({
        'text': '',                // Return every history item....
        'maxResults': 1000000000,  // Have to specify something, so why not a billion?
        'startTime': 0             // For some reason more results are returned when giving
                                   // a startTime, so ask for everything since the epoch
    },
    function(historyItems) {
        // For each history item, get details on all visits.
        for (var i = 0; i < historyItems.length; ++i) {
            var url = historyItems[i].url;

            // skip this url if it doesn't match the url filter
            if (filters && filters.url && filters.url != url) {
                continue;
            }

            // skip this url if it doesn't match the domain filter
            var host = extractHost(url);
            if (!domainMatch(host, filters ? filters.domain : undefined)) {
                continue;
            }

            // Get the next domain level
            var domain = getDomainPortion(host, filters ? filters.domain : undefined);

            var processVisitsWithUrl = function(url, domain, filters) {
                // We need the url and domain of the visited item to process the visit.
                // Use a closure to bind both into the callback's args.
                return function(visitItems) {
                    processVisits(url, domain, filters, visitItems);
                };
            };
            chrome.history.getVisits({url: url}, processVisitsWithUrl(url, domain, filters));
            numRequestsOutstanding++;
        }
        if (!numRequestsOutstanding) {
            onAllVisitsProcessed();
        }
    });

    // Maps URLs to a count of the number of times they were visited
    var trends = {
        "historyItems": 0, 
        "visitItems": 0,
        "byTransition": {},
        "byHour": [],
        "byDay": [],
        "byDayOfMonth": [],
        "byMonth": [],
        "byBusiestDay": {},
        "topDays": [],
        "topUrls": [],
        "topDomains": [],
        "topUniqueVisits": []
    };
  
    var byUrlHash = [];
    var byDomainHash = [];
    var byUniqueVisitsHash = [];

    // Mass initialization
    for (var i = 0; i < 24; i++)  { trends.byHour[i]   = 0; }
    for (var i = 0; i < 7; i++)   { trends.byDay[i]    = 0; }
    for (var i = 1; i <= 31; i++) { trends.byDayOfMonth[i]   = 0; }
    for (var i = 0; i < 12; i++)  { trends.byMonth[i]  = 0; }

    // Callback for chrome.history.getVisits().
    var processVisits = function(url, domain, filters, visitItems) {
        var hasMatch = 0;
        
        for (var i = 0, ie = visitItems.length; i < ie; ++i) {
            if (filters && !matchesAllFilters(visitItems[i], url, filters)) {
                continue;
            }
            trends.visitItems++;
            hasMatch = 1;
            
            if (!byUrlHash[url]) {
                byUrlHash[url] = 0;
            }
            byUrlHash[url]++;
            
            if (domain) {
                if (!byDomainHash[domain]) {
                    byDomainHash[domain] = 0;
                }
                byDomainHash[domain]++;

                if (!byUniqueVisitsHash[domain]) {
                    byUniqueVisitsHash[domain] = { url_count: 0, visit_count: 0 };
                }
                byUniqueVisitsHash[domain]['visit_count']++;
            }
            
            var visitDate = new Date(visitItems[i].visitTime);
            trends.byHour[ visitDate.getHours() ]++;
            trends.byDay[ visitDate.getDay() ]++;
            trends.byDayOfMonth[ visitDate.getDate() ]++;
            trends.byMonth[ visitDate.getMonth() ]++;
      
            if (!trends.byTransition[visitItems[i].transition]) {
                trends.byTransition[visitItems[i].transition] = 0;
            }
            trends.byTransition[visitItems[i].transition]++;
      
            if (!trends.byBusiestDay[visitDate.toDateString()]) {
                trends.byBusiestDay[visitDate.toDateString()] = 0;
            }
            trends.byBusiestDay[visitDate.toDateString()]++;
        }
        
        if (hasMatch) {
            trends.historyItems++;
            if (domain) {
                byUniqueVisitsHash[domain]['url_count']++;
            }
        }
        
        // If this is the final outstanding call to processVisits(),
        // then we have the final results.  Use them to calculate final stats.
        if (!--numRequestsOutstanding) {
            onAllVisitsProcessed();
        }

        return;
    };

    // This function is called when we have finished processing the entire history
    var onAllVisitsProcessed = function() {
        var sortBySecondPosition = function(a, b) {
            return b[1] - a[1];
        }
    
        // Re-order URLs to find the top 10 URLs
        var urlArray = [];
        for (var url in byUrlHash) {
            urlArray.push([ url, byUrlHash[url] ]);
        }
        urlArray.sort(sortBySecondPosition);
        trends.topUrls = urlArray.slice(0,100);
        
        // Re-order domains to find the top 10 domains
        var domainArray = [];
        for (var domain in byDomainHash) {
            domainArray.push([ domain, byDomainHash[domain] ]);
        }
        domainArray.sort(sortBySecondPosition);
        trends.topDomains = domainArray.slice(0,100);
        
        // Re-order unique visits to find the top 10/100
        var uniqueVisitsArray = [];
        for (var d in byUniqueVisitsHash) {
            var item = byUniqueVisitsHash[ d ];
            uniqueVisitsArray.push([
                d, 
                item.url_count, 
                item.visit_count,
                item.url_count / item.visit_count 
            ]);
        }
        uniqueVisitsArray.sort(sortBySecondPosition);
        trends.topUniqueVisits = uniqueVisitsArray.slice(0, 100);

        // Re-order daily stats to find the top 10 days
        // and keep track of each value for avg/median calculations
        var busiestDayArray = [];
        var busiestDayValues = [];
        var today = new Date().toDateString();
        for (var day in trends.byBusiestDay) {
            busiestDayArray.push([ day, trends.byBusiestDay[day] ]);
            // exclude today's stats from the average and median calculation
            if (day != today) {
                busiestDayValues.push( trends.byBusiestDay[day] );
            }
        }
        busiestDayArray.sort(sortBySecondPosition);
        trends.topDays = busiestDayArray.slice(0,100);

        busiestDayValues.sort(function(a,b) { return a - b; });
        trends.busiestDayMean = calcMean(busiestDayValues);
        trends.busiestDayMedian = calcMedian(busiestDayValues);

        buildDom(trends);
    };
  
    return trends;
}




/* 
    matchesAllFilters(visitItem, url, filters)
    
    Returns true if the current url/visitItem match all current filters 
*/

var weekday_mapping = {};
weekday_mapping[ chrome.i18n.getMessage("sunday")    ] = 0;
weekday_mapping[ chrome.i18n.getMessage("monday")    ] = 1;
weekday_mapping[ chrome.i18n.getMessage("tuesday")   ] = 2;
weekday_mapping[ chrome.i18n.getMessage("wednesday") ] = 3;
weekday_mapping[ chrome.i18n.getMessage("thursday")  ] = 4;
weekday_mapping[ chrome.i18n.getMessage("friday")    ] = 5;
weekday_mapping[ chrome.i18n.getMessage("saturday")  ] = 6;

var month_mapping = {};
month_mapping[ chrome.i18n.getMessage('jan_abbr') ] = 0;
month_mapping[ chrome.i18n.getMessage('feb_abbr') ] = 1;
month_mapping[ chrome.i18n.getMessage('mar_abbr') ] = 2;
month_mapping[ chrome.i18n.getMessage('apr_abbr') ] = 3;
month_mapping[ chrome.i18n.getMessage('may_abbr') ] = 4;
month_mapping[ chrome.i18n.getMessage('jun_abbr') ] = 5;
month_mapping[ chrome.i18n.getMessage('jul_abbr') ] = 6;
month_mapping[ chrome.i18n.getMessage('aug_abbr') ] = 7;
month_mapping[ chrome.i18n.getMessage('sep_abbr') ] = 8;
month_mapping[ chrome.i18n.getMessage('oct_abbr') ] = 9;
month_mapping[ chrome.i18n.getMessage('nov_abbr') ] = 10;
month_mapping[ chrome.i18n.getMessage('dec_abbr') ] = 11;

function matchesAllFilters(visitItem, url, filters) {
    var matchCount = 0;
    var filterCount = 0;
    
    if (filters.url != undefined) {
        // To have gotten this far means the URL is a match
        ++filterCount;
        ++matchCount;
    }
    
    if (filters.domain != undefined) {
        // To have gotten this far means the domain is a match
        ++filterCount;
        ++matchCount;
    }
    
    if (filters.transition != undefined) {
        ++filterCount;
        if (filters.transition == visitItem.transition) {
            ++matchCount;
        }
    }

    var visitDate = new Date(visitItem.visitTime);
    
    if (filters.hour != undefined) {
        ++filterCount;
        var hour24 = convert_12_to_24(filters.hour);
        if (hour24 == visitDate.getHours()) {
            ++matchCount;
        }
    }

    if (filters.weekday != undefined) {
        ++filterCount;

        if (weekday_mapping[filters.weekday] == visitDate.getDay()) {
            ++matchCount;
        }
    }

    if (filters.monthDay != undefined) {
        ++filterCount;
        if (filters.monthDay == visitDate.getDate()) {
            ++matchCount;
        }
    }

    if (filters.month != undefined) {
        ++filterCount;
        
        if (month_mapping[filters.month] == visitDate.getMonth()) {
            ++matchCount;
        }
    }
    
    if (filters.date != undefined) {
        ++filterCount;
        if (filters.date == visitDate.toDateString()) {
            ++matchCount;
        }
    }
    
    return( matchCount && filterCount == matchCount );
}

