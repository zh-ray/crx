$(function () {
    opt.init();
    $("#checkshowname,#checkshowicon,#checkrecordpinedtab").on("change", function () {
        opt.updateCheck(this);
    });
    //消息通知
    $("#checktopmsg,#topmsgtime").on("change", function (e) {
        opt.updateMsgTime();
        if (e.target.id === "checktopmsg") {
            $(".msgtime").animate({
                height: 'toggle'
            }, "fast");
        }
    });
    //网站显示条数
    $("#showsitenum").on("change", function () {
        opt.updateSiteNum();
    });
    $(".csnsite").on("blur", function () {
        opt.updateSiteName(this);
    });
    //显示邮箱
    $("#iconemail").on("click", function () {
        tbCommonJS.alertFrame("Email:chengradytmac@.com", {
            "title": tbCommonJS.getLocalText("Email")
        });
    });
    //显示微信赞助
    $("#iconwepay").on("click", function () {
        tbCommonJS.alertFrame($(".aletwepay"), {
            "title": tbCommonJS.getLocalText("donatebywepay")
        });
    });
    $("#iconalipay").on("click", function () {
        tbCommonJS.alertFrame($(".aletalipay"), {
            "title": tbCommonJS.getLocalText("donatebyalipay")
        });
    });
    //清除记录
    $("#btnclear").on("click", function () {
        opt.clearHistory();
    });

    $("#about").on("click", function () {
        opt.eggshell();
    });
});

var opt = {
    //自定义网站命名Json
    jsonCustomerSiteName: "",
    //初始化
    init: function () {
        $("#checkshowname").attr("checked", tbCommonJS.getStorage("showdefaultname") == "0" ? false : true); //显示默认网站名
        $("#checkshowicon").attr("checked", tbCommonJS.getStorage("checkshowicon") == "0" ? false : true); //显示图标
        $("#checkrecordpinedtab").attr("checked", tbCommonJS.getStorage("recordpinedtab") == "0" ? false : true); //显示图标
        //排行榜消息提醒时间
        if (tbCommonJS.getStorage("tstopmsg") == "-1" || tbCommonJS.getStorage("tstopmsg") == "") {
            $("#checktopmsg").attr("checked", false);
        } else {
            $("#topmsgtime").val(tbCommonJS.getStorage("tstopmsg"));
            $(".msgtime").show();
        }
        //显示条数
        if (tbCommonJS.getStorage("TMshowsitenum") != "") {
            $("#showsitenum").val(tbCommonJS.getStorage("TMshowsitenum"));
        }

        jsonCustomerSiteName = tbCommonJS.getStorageJson("timesummaryCSN");
        opt.initSiteList();
    },
    updateCheck: function (e) {
        if ($(e).attr("data") != undefined && $(e).attr("data") != "") {
            localStorage.setItem($(e).attr("data"), $(e).is(':checked') ? "1" : "0");
        }
    },
    //修改排行榜消息提醒时间
    updateMsgTime: function () {
        if ($("#checktopmsg").is(':checked')) {
            localStorage.setItem("tstopmsg", $("#topmsgtime").val());
        } else {
            localStorage.setItem("tstopmsg", "");
        }
    },
    //修改网站显示条数
    updateSiteNum: function () {
        localStorage.setItem("TMshowsitenum", $("#showsitenum").val());
    },
    // 构造网站列表
    initSiteList: function () {
        let siteData = tbCommonJS.getStorageJson("timesummary");
        siteData = tbCommonJS.jsonSort(siteData, 'timevalue', true);
        let siteListHtml = "";
        let defaultSiteName = ""; //默认网站名
        let customSiteName = ""; //自定义网站名
        let siteCount = siteData.length > 100 ? 100 : siteData.length; //显示网站个数
        for (var i = 0; i < siteCount; i++) {
            defaultSiteName = sitejson[siteData[i].sitedomain] != undefined && sitejson[siteData[i].sitedomain][tbCommonJS.lang] != undefined && sitejson[siteData[i].sitedomain][tbCommonJS.lang] != "" ? sitejson[siteData[i].sitedomain][tbCommonJS.lang] : "";
            if (jsonCustomerSiteName.hasOwnProperty(siteData[i].sitedomain) && jsonCustomerSiteName[siteData[i].sitedomain].sitename != "") { //如果重命名过，则显示重命名
                customSiteName = jsonCustomerSiteName[siteData[i].sitedomain].sitename;
            } else {
                customSiteName = "";
            }

            siteListHtml += "<tr><td class='thcustomicon'><img class='iconimg' src='" + tbCommonJS.getWebIcon(siteData[i].sitedomain) + "'/></td><td id='sitename" + i + "' class='thtitle'>" + siteData[i].sitedomain + "</td><td class='thdefaultname'>" + defaultSiteName + "</td><td class='thcustomname'><input id='csnsite" + i + "' class='csnsite' autocomplete='off' value='" + customSiteName + "' /></td></tr>";
        }
        $("#weblistbody").append(siteListHtml);
    },
    //更新自定义网站名
    updateSiteName: function (e) {
        let sitename = $(e).val();
        let sitedomain = $("#sitename" + $(e).attr("id").replace("csnsite", "")).html();
        if (jsonCustomerSiteName.hasOwnProperty(sitedomain)) {
            jsonCustomerSiteName[sitedomain].sitename = sitename;
        } else {
            jsonCustomerSiteName[sitedomain] = {
                "sitename": sitename,
                "show": "1"
            };
        }
        localStorage.setItem("timesummaryCSN", JSON.stringify(jsonCustomerSiteName));
    },
    //清除记录
    clearHistory: function () {
        if (confirm(tbCommonJS.getLocalText("clearallrecords"))) {
            localStorage.setItem("timesummary", ""); //网站时间json
            localStorage.setItem("tstotaltime", ""); //总时间
            localStorage.setItem("timesummary_today", ""); //今天网站时间json
            localStorage.setItem("tstotaltime_today", ""); //今天总时间
            localStorage.setItem("timesummaryCSN", ""); //自定义网站名
            opt.initSiteList(); //重新加载网站列表
            alert(tbCommonJS.getLocalText("clearsuccessfully"));
        }
        chrome.extension.sendRequest({
            greeting: "clearhistory"
        }, function (response) {});
    },
    eggClickCount: 0,
    eggshell: function () {
        opt.eggClickCount++;
        setTimeout(function () {
            opt.eggClickCount = 0;
        }, 5000);
        if (opt.eggClickCount >= 5) {
            tbCommonJS.alertFrame("To:10,4ever.", {
                title: tbCommonJS.getLocalText("eggshell")
            });
        }
    }
}