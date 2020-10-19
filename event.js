// 用于存储所有打开的window的id
var windowIdArr = [];
var rewardArr = ["blog.csdn.net", "github.com", "stackoverflow.com"];
var penaltyArr = ["bilibili.com", "douyu.com", "huya.com", "youtube.com"];

init();

// 标签激活事件
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (typeof tab == "undefined") return;
        var url = tab.url;
        var urlType = filterUrl(url);
        if (urlType == "Skip")
            return;
        var tabId = activeInfo.tabId;
        var windowId = activeInfo.windowId;

        // 若激活一个新的tab，则需保存上一个tab的网站时间记录
        if (localStorage[windowId] != null) {
            saveTime(windowIdArr);
        }

        startTimer(windowId, tabId, url, urlType);
        console.log(windowId + " | " + tabId + " | " + urlType);
    });
});

// window关闭事件
chrome.windows.onRemoved.addListener(function (windowId) {
    saveTime(windowId);
    localStorage.removeItem(windowId);
    for (var i = 0; i < windowIdArr.length; i++) {
        if (windowIdArr[i] == windowId) {
            windowIdArr.splice(i, 1);
        }
    }
});

// tab更新事件
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (!tab.active) return;
    if (changeInfo.url == undefined) return;

    if (changeInfo.url != null) {
        saveTime(tab.windowId);
        startTimer(tab.windowId, tabId, changeInfo.url, filterUrl(changeInfo.url));
        console.log(tab.windowId + " | " + tabId + " | " + filterUrl(changeInfo.url));
    }
});

// 每日首次使用时初始化插件
function init() {
    // 首次安装后
    if (localStorage["today"] == null) {
        setTodayDate();
    }

    // 存储版本号
    var manifest = chrome.runtime.getManifest();
    localStorage["version"] = manifest.version;

    // 填充windowId数组
    chrome.windows.getAll(function (windows) {
        for (var i = 0; i < windows.length; i++) {
            var windowId = windows[i].id;
            windowIdArr.push(windowId);
        }
    });
}

// 将"today"设为今日日期
function setTodayDate() {
    localStorage["today"] = getDateString();
}

//返回时间字符串，如2020-01-01
function getDateString(millis) {
    if (millis != null) {
        var date = new Date(millis);
    } else {
        var date = new Date();
    }
    // getMonth()从0开始
    if (date.getMonth() < 9) {
        resultDate = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-";
    } else {
        resultDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-";
    }
    if (date.getDate() < 10) {
        resultDate += "0" + date.getDate();
    } else {
        resultDate += date.getDate();
    }
    return resultDate;
}

// 存储网站的访问时间
function saveTime(windowId) {
    // 保存时间之前需要有window计时信息
    if (localStorage[windowId] != null) {
        var jsonObj = JSON.parse(localStorage[windowId]);
        var domain = jsonObj.domain;
        var start = jsonObj.start;

        // 同样需要处理不同window中存在同一网站的情况
        for (let i = 0; i < windowIdArr.length; i++) {
            var wId = windowIdArr[i];

            if (localStorage[wId] == null) {
                continue;
            }
            if (JSON.parse(localStorage[wId]).domain == domain) {
                var info = getSaveJsonStr(jsonObj.domain, jsonObj.start);
            }

        }
    }
}

// 记录开始时间信息
function startTimer(windowId, tabId, url, urlType) {
    var domain = extractDomain(url);
    // 当存在多个window打开相同网页时,只计算其中任一个网页的浏览时间并保存
    chrome.windows.getAll(function (windows) {
        for (var i = 0; i < windows.length; i++) {
            var wId = windows[i].id;
            if (localStorage[wId] == null)
                continue;

            if (JSON.parse(localStorage[wId]).domain == domain) {
                saveTime(wId);
                break;
            }
        }
        // 将不同window中同一网站的开始计时时间同步为当前时间
        var start = Date.now();
        for (var i = 0; i < windows, length; i++) {
            var wId = windows[i].id;
            if (localStorage[wId] == null) {
                continue;
            }

            var obj = JSON.parse(localStorage[wId]);
            if (obj.domain == domain) {
                localStorage[wId] = getStartTimeInfoJsonStr(obj.tabId, domain, start);
            }
        }
        localStorage[windowId] = getStartTimeInfoJsonStr(tabId, domain, start);

        // 判断windowId是否已录入数组
        if (!windowIdArr.includes(windowId)) {
            windowIdArr.push(windowIdArr);
        }
    });
}

// 根据url判断网站类型
function filterUrl(url) {
    if (url == "" || url == null) {
        return "Skip";
    }
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("file://") || url.startsWith("ed2k://")) {
        return "Skip";
    }
    var domain = extractDomain(url);
    for (var i = 0; i < rewardArr.length; i++) {
        if (domain.endsWith(rewardArr[i])) {
            return "Reward";
        }
    }
    for (var i = 0; i < penaltyArr.length; i++) {
        if (domain.endsWith(penaltyArr[i])) {
            return "Penalty";
        }
    }
    return "Other"
}

// 通过正则表达式获取url中的域名
function extractDomain(url) {
    var re = /:\/\/(www\.)?(.+?)\//;
    return url.match(re)[2];
}

// 返回记录开始记录时的时间json串
// tabId 在window中active的tabId
// domain 该tab中的域名
// start 开始计时的时间戳（13位）
function getStartTimeInfoJsonStr(tabId, domain, start = Date.now()) {
    return '{"tabId":' + tabId + ',"domain":"' + domain + '","start":' + start + '}';
}

function getSaveJsonStr(domain, start) {

}