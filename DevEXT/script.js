var loaddmt = false;
function beam_init() {
    if (!loaddmt && $(".messages")[0]) {
        var rand = Date.now();
        loaddmt = true;
 
        var $head = $('head');
 
        // qTip
        $head.append($('<script>').attr({
            type: 'text/javascript',
            src: 'https://mradder.com/ss/jquery.qtip.min.js?' + rand
        }));
 
        // BEx
        $head.append($('<script>').attr({
            type: 'text/javascript',
            src: 'https://exudev.ca/BeX/bex.js?' + rand // INSERT THE CORRECT URL HERE
        }));
    } else if (loaddmt && !$(".messages")[0]) {
        loaddmt = false;
        var i = document.createElement("script");
        $(i).text("BeamExtendedInstance.close();");
        $("head")[0].appendChild(i);
        $(i).remove();
    }
}
 
setInterval(function() {
    beam_init();
}, 2000);