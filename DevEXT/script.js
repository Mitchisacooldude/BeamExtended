var loaddmt = false;
var adder = Math.random();
function beam_init()
{
	if (!loaddmt && $(".messages")[0]){
		loaddmt = true;
			script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = "https://exudev.ca/BeX/bex.js?"+adder;
			thehead = document.getElementsByTagName('head')[0];
			if(thehead) thehead.appendChild(script);
			scriptz = document.createElement('script');
			scriptz.type = 'text/javascript';
			scriptz.src = "https://mradder.com/ss/jquery.qtip.min.js?"+adder;
			theheads = document.getElementsByTagName('head')[0];
			if(theheads) thehead.appendChild(scriptz);
		}else if(loaddmt && !$(".messages")[0]) {
			loaddmt = false;
        	var i = document.createElement("script");
        	$(i).text("BeamExtendedInstance.close();");
        	$("head")[0].appendChild(i);
        	$(i).remove();
        }
}
chrome.runtime.sendMessage("showicon");
var loadedmt = false;

setInterval(function() {
		beam_init();
}, 2000);
