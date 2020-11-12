var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-108360509-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  //ga('set', 'checkProtocolTask', null);
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var trackevent = function(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
}

document.getElementById('add-filter-cta').addEventListener('click', trackevent);
document.getElementById('submit-domain').addEventListener('click', trackevent);
