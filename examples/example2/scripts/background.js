$(function () {
    background.getDataFromStorage();
});

window.setInterval(function () {
    chrome.idle.queryState(15, function (state) {
        if (state === 'locked') {
            return; //如果被锁定则不记录
        } else {
            chrome.tabs.getSelected(null, function (tab) {
                chrome.windows.getCurrent(function (win) {
                    if (win.state == "minimized" || !win.focused) {
                        return; //如果是最小化或者焦点不在浏览器上，则不记录
                    } else {  
                        if (tab.pinned && tbCommonJS.getStorage("recordpinedtab") == "0") {
                            return;     //固定标签页不统计
                        }
                        let sitedomain = tbCommonJS.urlToDomain(tab.url);
                        sitedomain = tbCommonJS.getSingleUrl(sitedomain);
                        if (sitedomain !== "") {
                            let todayStr = tbCommonJS.getDateStr();
                            if (background.timeJsonToday.date !== todayStr) {
                                background.timeJsonToday = {
                                    "date": "" + todayStr + "",
                                    "site": []
                                };
                                localStorage.setItem("timesummary_today", JSON.stringify(background.timeJsonToday));
                                localStorage.setItem("tstotaltime_today", 0);
                            }
                            background.addTimeToTotal();
                            background.addTimeToSite(sitedomain);
                        }
                    }
                });
            });
        }
    });
    if (localStorage.getItem("tstopmsg") != null && localStorage.getItem("tstopmsg") !== "" && tbCommonJS.getTimeStr() === localStorage.getItem("tstopmsg") + ":00") {
        background.notifyMe();
    }
}, 1000);

//监听消息
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting === "clearhistory") { //清空历史消息
            background.timeJson = [];
            background.timeJsonToday = {};
            background.getDataFromStorage();
        }
    });

var background = {
    timeJson: "",
    timeJsonToday: "",
    timeDateStorage: "", //总共
    timeDateStorageToday: "", //今天
    getDataFromStorage: function () {
        this.timeJson = tbCommonJS.getStorageJson("timesummary"); //获取数据

        //获取今天数据
        this.timeDateStorageToday = localStorage.getItem("timesummary_today");
        let todayStr = tbCommonJS.getDateStr();
        if (this.timeDateStorageToday == null || this.timeDateStorageToday === "") {
            this.timeJsonToday = {
                "date": "" + todayStr + "",
                "site": []
            };
            localStorage.setItem("timesummary_today", JSON.stringify(this.timeJsonToday));
            localStorage.setItem("tstotaltime_today", 0);
        } else {
            this.timeJsonToday = JSON.parse(this.timeDateStorageToday);
            if (this.timeJsonToday.date !== todayStr) {
                this.timeJsonToday = {
                    "date": "" + todayStr + "",
                    "site": []
                };
                localStorage.setItem("timesummary_today", JSON.stringify(this.timeJsonToday));
                localStorage.setItem("tstotaltime_today", 0);
            }
        }
    },
    //消息提醒
    notifyMe: function () {
        if (!Notification) {
            return;
        }
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        } else {
            var tipMessage = [];
            let timeJsonTodayTemp = tbCommonJS.jsonSort(this.timeJsonToday.site, 'timevalue', true);
            for (let i = 0; i < timeJsonTodayTemp.length && i < 3; i++) {
                var arr = {
                    "title": "Top" + (i + 1),
                    "message": tbCommonJS.getSiteName(timeJsonTodayTemp[i].sitedomain) + "-" + tbCommonJS.secondToCommonTime(timeJsonTodayTemp[i].timevalue)
                }
                tipMessage.push(arr);
            }
            if (tipMessage.length == 0) {
                return;
            }
            let topnotify = chrome.notifications.create(null, {
                type: 'list',
                iconUrl: 'images/icon_128.png',
                title: tbCommonJS.getLocalText("appname") + '-' + tbCommonJS.getLocalText("todaystop3"),
                message: "",
                items: tipMessage
            });
        }
    },
    addTimeToSite: function (sitedomain) {
        let isAdded = false;
        let isAddedToday = false;
        //总数据
        for (let i = 0; i < this.timeJson.length; i++) {
            if (this.timeJson[i].sitedomain === sitedomain) {
                this.timeJson[i].timevalue += 1;
                isAdded = true;
                break;
            }
        }
        if (!isAdded) {
            let arr = {
                "sitedomain": sitedomain,
                "timevalue": 1
            }
            this.timeJson.push(arr);
        }
        //今天数据
        for (let i = 0; i < this.timeJsonToday.site.length; i++) {
            if (this.timeJsonToday.site[i].sitedomain === sitedomain) {
                this.timeJsonToday.site[i].timevalue += 1;
                isAddedToday = true;
                break;
            }
        }
        if (!isAddedToday) {
            let arr = {
                "sitedomain": sitedomain,
                "timevalue": 1
            }
            this.timeJsonToday.site.push(arr);
        }

        localStorage.setItem("timesummary", JSON.stringify(this.timeJson));
        localStorage.setItem("timesummary_today", JSON.stringify(this.timeJsonToday));

        isAdded = false;
        isAddedToday = false;
    },
    //记录总时间
    addTimeToTotal: function () {
        let totalTime = parseInt(localStorage.getItem("tstotaltime"));
        if (totalTime === 0 || totalTime == null || isNaN(totalTime)) {
            totalTime = 1;
            for (let i = 0; i < this.timeJson.length; i++) {
                totalTime += this.timeJson[i].timevalue;
            }
        } else {
            totalTime++;
        }
        localStorage.setItem("tstotaltime", totalTime);

        let totalTimeToday = parseInt(localStorage.getItem("tstotaltime_today"));
        if (totalTimeToday === 0 || totalTimeToday == null || isNaN(totalTimeToday)) {
            totalTimeToday = 1;
        } else {
            totalTimeToday++;
        }
        localStorage.setItem("tstotaltime_today", totalTimeToday);
    }

}