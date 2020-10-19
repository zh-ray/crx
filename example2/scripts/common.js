$(function () {
    $("[local-data-html]").each(function () {
        $(this).html(tbCommonJS.getLocalText(this.getAttribute("local-data-html")));
    });
    $("[local-data-val]").each(function () {
        $(this).val(tbCommonJS.getLocalText(this.getAttribute("local-data-val")));
    });
    $("body").on("mouseover", "[title],[local-data-title]", function () {
        tbCommonJS.showTitle($(this));
    })
});

var tbCommonJS = {
    //当前语言
    lang: chrome.i18n.getMessage('lang'),
    //读取localstorage中的数据
    getStorage: function (name) {
        let storageValue = localStorage.getItem(name);
        return storageValue == null ? "" : storageValue;
    },
    // 读取localstorage中的数据转为json
    getStorageJson: function (name) {
        let storageJson;
        let storageData = localStorage.getItem(name);
        if (storageData !== "" && storageData != null) {
            storageJson = JSON.parse(storageData);
        } else {
            switch (name) {
                case "timesummary":
                    storageJson = [];
                    localStorage.setItem("timesummary", JSON.stringify(storageJson));
                    break;
                case "timesummary_today":
                    storageJson = {
                        "date": "",
                        "site": []
                    };
                    localStorage.setItem("timesummary_today", JSON.stringify(storageJson));
                    break;
                default:
                    storageJson = {};
                    break;
            }
        }
        return storageJson;
    },
    // 把秒转换为对应的秒分时
    secondToCommonTime: function (s) {
        if (s < 60) {
            return s + "s";
        } else if (s / 60 < 60) {
            return Math.ceil(s / 60) + "m";
        } else {
            return Math.ceil(s / 3600) + "h";
        }
    },
    // JSON排序
    jsonSort: function (array, field, reverse) {
        if (array.length < 2 || !field || typeof array[0] !== "object") return array;
        if (typeof array[0][field] === "number") {
            array.sort(function (x, y) {
                return x[field] - y[field]
            });
        }
        if (typeof array[0][field] === "string") {
            array.sort(function (x, y) {
                return x[field].localeCompare(y[field])
            });
        }
        if (reverse) {
            array.reverse();
        }
        return array;
    },
    //获取网站名
    getSiteName: function (sitedomain) {
        let sitename = "";
        let customNameJson = this.getStorageJson("timesummaryCSN"); //自定义网站名
        if (customNameJson.hasOwnProperty(sitedomain) && customNameJson[sitedomain].sitename != "") { //如果自定义过，则显示自定义网站名
            sitename = customNameJson[sitedomain].sitename;
        } else if (this.getStorage("showdefaultname") !== "0") { //如果显示系统默认网站名
            if (sitejson[sitedomain] != undefined && sitejson[sitedomain][tbCommonJS.lang] != undefined && sitejson[sitedomain][tbCommonJS.lang] != "") { //如果sitejson中包含了该网址，则显示sitejson中的名称
                sitename = sitejson[sitedomain][tbCommonJS.lang];
            } else {
                let isHadReapeatSite = false;
                for (let j = 0; j < repeatSiteUrl.length; j++) {
                    if (sitedomain.indexOf(repeatSiteUrl[j]) >= 0) {
                        sitename = repeatSiteUrl[j];
                        isHadReapeatSite = true;
                        break;
                    }
                }
                if (!isHadReapeatSite) {
                    return sitedomain;
                }
            }
        } else { //显示网址
            sitename = sitedomain;
        }
        return sitename;
    },
    //获取显示网址数
    getShowNum: function () {
        let showNum = this.getStorage("TMshowsitenum");
        if (showNum === null || showNum === 0 || showNum === "") {
            showNum = 10;
            localStorage.setItem("TMshowsitenum", "10");
        }
        return showNum;
    },
    //获取多语言文本
    getLocalText: function (key) {
        try {
            let text = chrome.i18n.getMessage(key);
            if (text) {
                return text;
            } else {
                return "";
            }
        } catch {
            return "";
        }
    },
    //判断字符串是否为网址
    isSiteUrl: function (url) {
        let urlpattern = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        let objExp = new RegExp(urlpattern);
        return objExp.test(url);
    },
    //把网址变成domain
    urlToDomain: function (str) {
        let siteDomain = "";
        if (this.isSiteUrl(str)) {
            let pattern = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;
            siteDomain = pattern.exec(str)[4];
            siteDomain = siteDomain.replace("www.", "");
        }
        return siteDomain;
    },
    //获取单个网址
    getSingleUrl: function (stieurl) {
        let singleUrl = stieurl;
        for (let i = 0; i < repeatSiteUrl.length; i++) {
            if (stieurl.indexOf(repeatSiteUrl[i]) >= 0) {
                singleUrl = repeatSiteUrl[i];
                break;
            }
        }
        return singleUrl;
    },
    getDateStr: function () {
        var dateStr = "";
        var d = new Date();
        dateStr += d.getFullYear();
        dateStr += (d.getMonth() + 1) >= 10 ? d.getMonth() + 1 : "0" + (d.getMonth() + 1);
        dateStr += d.getDate();
        return dateStr;
    },
    //获取当前时间
    getTimeStr: function () {
        var myDate = new Date();
        var h = myDate.getHours(); //获取当前小时数(0-23)
        var m = myDate.getMinutes(); //获取当前分钟数(0-59)
        var s = myDate.getSeconds();
        return (h >= 10 ? h : "0" + h) + ":" + (m >= 10 ? m : "0" + m) + ":" + (s >= 10 ? s : "0" + s);
    },
    //获取网站图标
    getWebIcon: function (siteurl) {
        let iconApiUrl = "";
        switch (tbCommonJS.lang) {
            case "zh_CN":
                iconApiUrl = "https://www.google.cn/s2/favicons?domain=";
                break;
            case "en":
                iconApiUrl = "https://www.google.com/s2/favicons?domain=";
                break;
            default:
                iconApiUrl = "https://www.google.com/s2/favicons?domain=";
                break;
        }
        return iconApiUrl + siteurl;
    },
    //弹框
    alertFrame: function (alerter, option) {
        let initOption = {
            title: "",
            containerType: 1, //1为文字，2为元素
        }
        option = option || initOption;
        option.containerType = typeof (alerter) === "object" ? 2 : 1;
        let alertFrame;
        let frameTitle = option.title || "";
        $("<div class='alertbg'></div>").appendTo("body").show(); //添加背景蒙层
        if (option.containerType == 2 && alerter.parents(".alertframe").length > 0) {
            alertFrame = alerter.parents(".alertframe");
        } else {
            alertFrame = $("<div class='alertframe'><div class='tab'><div class='title'>" + frameTitle + "</div><button class='closeBtn' data-svg='closebtn'></button></div><div class='content'></div></div>").appendTo("body");
            svgHtml.init("closebtn", alertFrame.find(".closeBtn"));

            if (option.containerType == 1) {
                alerter = $("<div class='alerttext'><div>" + alerter + "</div></div>").appendTo("body");
            }
            alertFrame.css({
                height: alerter.outerHeight() + 50,
                width: alerter.outerWidth()
            });
            alertFrame.children(".content").append(alerter.show());
        }
        alertFrame.slideDown("fast");
        $(".closeBtn").on("click", function () {
            $(this).parents(".alertframe").slideUp("fast", function () {
                $(".alertbg").remove();
            });
        });
    },
    //显示Title
    showTitle: function (ele) {
        $(".tbTitle").remove();
        var initTitle = ele.attr("title");
        let tbTitle = tbCommonJS.getLocalText(ele.attr("local-data-title")) || ele.attr("title") || "";
        if (tbTitle == "") {
            return;
        }
        var eleTitle = $("<div class='tbTitle'><div class='triangleout'><span class='trianglein'></span></div><div class='content'>" + tbTitle + "</div></div>").appendTo("body");
        let titleTop = ele.offset().top - $(document).scrollTop() + ele.height() + 3;
        let titleLeft = Math.max((ele.offset().left - (eleTitle.width() - ele.width()) / 2), 5) //最小为靠左5px

        if (titleTop + eleTitle.height() > $(window).height()) {
            titleTop = titleTop - eleTitle.height() - ele.height() - 6;
            eleTitle.remove();
            eleTitle = $("<div class='tbTitle'><div class='content'>" + tbTitle + "</div><div class='triangleout triangleoutinverted'><span class='trianglein'></span></div></div>").appendTo("body");
        }
        eleTitle.css({
            top: titleTop,
            left: titleLeft
        }).show();
        ele.attr({
            "title": "",
            "tbTitle": initTitle
        }).on("mouseout", function () {
            $(".tbTitle").remove();
            ele.attr("title", initTitle);
        });
    }
};