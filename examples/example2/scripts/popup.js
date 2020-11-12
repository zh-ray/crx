 $(function () {
     popup.init();
     popup.setDetail();
     $("#title").on({
         "click": function () {
             // alert("");
         }
     });
     $("#switchDetailType").on({
         "click": function () {
             popup.switchBtnMouseEvent("click");
         },
         "mouseover": function () {
             popup.switchBtnMouseEvent("over");
         },
         "mouseout": function () {
             popup.switchBtnMouseEvent("out");
         },
     });
     $("#settingbtn").on({
         "click": function () {
             chrome.runtime.openOptionsPage();
         }
     });
 });

 var popup = {
     isToday: true, //展示类型 true：今天、false：总共
     init: function () {
         if (tbCommonJS.getLocalText("appname") === "时间脚印") {
             $("#title").addClass("title_zh");
         } else {
             $("#title").addClass("title_en");
         }
     },
     // “今/总”按钮鼠标事件
     switchBtnMouseEvent: function (type) {
         let btnSelected = this.isToday ? "spanTotal" : "spanToday";
         let btnUnSelected = this.isToday ? "spanToday" : "spanTotal";
         switch (type) {
             case "click": //切换按钮点击事件
                 $("#switchDetailType").off("click"); //点击后，解绑点击事件
                 $("#" + btnUnSelected).css("color", "#a00");
                 $("#" + btnSelected).css("color", "#ffffff");
                 $("#detail").animate({
                     left: this.isToday ? "-280px" : "0"
                 }, 'normal');
                 $("#switchSlider").animate({
                     left: this.isToday ? "22.5px" : "0"
                 }, 'normal', function () {
                     $("#switchDetailType").on("click", function () {
                         popup.switchBtnMouseEvent("click"); //动画完成后绑定点击事件
                     });
                 });
                 $("#switchDetailType").attr("local-data-title", this.isToday ? "tip_totay" : "tip_total"); //切换按钮提示
                 tbCommonJS.showTitle($("#switchDetailType")); //切换显示的title
                 this.isToday = !this.isToday;
                 this.setDetail();
                 break;
             case "over": //切换按钮鼠标移入事件
                 $("#switchSlider").css("background", "#a00");
                 $("#" + btnSelected).css("color", "#a00");
                 break;
             case "out": //切换按钮鼠标移除事件
                 $("#switchSlider").css("background", "");
                 $("#" + btnSelected).css("color", "#000000");
                 break;
             default:
                 break;
         }
     },
     setDetail: function () {
         let nameTotalTime = ""; //总时间localstorage名称
         let nameDetail = ""; //详情localstorage名称
         let nameDetailHtml = ""; //列表容器ID
         let isShowWebIcon = tbCommonJS.getStorageJson("checkshowicon") != "0" ? true : false; //是否显示网站图标
         if (this.isToday) {
             nameTotalTime = "tstotaltime_today";
             nameDetail = "timesummary_today";
             nameDetailHtml = "detailleft";
         } else {
             nameTotalTime = "tstotaltime";
             nameDetail = "timesummary";
             nameDetailHtml = "detailright";
         }
         $("#" + nameDetailHtml).html('');
         let showNum = tbCommonJS.getShowNum(); //显示网址数
         let totalTime = tbCommonJS.getStorageJson(nameTotalTime); //总时间
         let detailJson = tbCommonJS.getStorageJson(nameDetail); //获取数据
         detailJson = this.isToday ? detailJson.site : detailJson;
         detailJson = tbCommonJS.jsonSort(detailJson, 'timevalue', true); //排序
         if (detailJson.length === 0) {
             $("#" + nameDetailHtml).append('<div class="nohistory">' + tbCommonJS.getLocalText('nohistory') + '</div>');
             return;
         }
         showNum = showNum < detailJson.length ? showNum : detailJson.length;

         let displaySiteName;
         let displaySiteTime;
         let ratio; //比例
         let webIconImg; //网站的图标
         for (let i = 0; i < showNum; i++) {
             displaySiteName = tbCommonJS.getSiteName(detailJson[i].sitedomain);
             displaySiteTime = tbCommonJS.secondToCommonTime(detailJson[i].timevalue);
             ratio = Math.floor(Math.round(detailJson[i].timevalue / totalTime * 1000) / 10);
             if (ratio === 0) {
                 ratio = 1;
             }

             webIconImg = isShowWebIcon ? '<img class="webicon" src="' + tbCommonJS.getWebIcon(detailJson[i].sitedomain) + '" />' : "";
             $("#" + nameDetailHtml).append('<ul class="sitedetailul"><li class="sitecolumn sitedetailcolumn">' + webIconImg + '<span class="webname" title="' + detailJson[i].sitedomain + '">' + displaySiteName + '</span></li><li class="timecolumn">' + displaySiteTime + '</li><li class="ratiocolumn">' + ratio + '%</li></ul>');
         }
         // 加上网站点击直达
         $(".sitedetailcolumn").on({
             "click": function () {
                 chrome.tabs.create({
                     url: "http://" +$(this).children("[tbTitle]").attr("tbTitle")
                 }, function () {});
             }
         });
     }
 }