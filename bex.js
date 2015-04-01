/** @license
 * Copyright (c) 2015 IFDevelopment
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without limitation of the rights to use, copy, modify, merge,
 * and/or publish copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice, any copyright notices herein, and this permission
 * notice shall be included in all copies or substantial portions of the Software,
 * the Software, or portions of the Software, may not be sold for profit, and the
 * Software may not be distributed nor sub-licensed without explicit permission
 * from the copyright owner.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Should any questions arise concerning your usage of this Software, or to
 * request permission to distribute this Software, please contact the copyright
 * holder at contact@exudev.ca or by creating an issue here - https://github.com/ExuDev/BeamExtended/issues
 *
 * ---------------------------------
 *
 *  Unofficial TLDR:
 *  Free to modify for personal use
 *  Need permission to distribute the code
 *  Can't sell addon or features of the addon
 
 */
var BeamExtendedInstance;
if (typeof BeamExtendedInstance != 'undefined') {
    BeamExtendedInstance.close();
}


BeamExtended = function() {
    var bexoptions = {
        twitchemotes: true,
        linkimages: false,
        usercolors: true,
        twitchbadges: false,
        bexbadges: false,
        splitchat: false
    };

    //Localstorage
    if (localStorage.getItem('bex') == null) {
        localStorage.setItem('bex', JSON.stringify(bexoptions));
    } else {
        bexoptions = JSON.parse(localStorage.getItem('bex'));
    }
    //End Local Storage

    var VERSION = '1.1.6';
    var COMMAND = ':'; // What is before a command?

    var twitchEmoteTemplate = '';
    var twitchEmotes = [];

    var customEmoteTemplate = {
        global: '',
        channel: ''
    };
    var customEmotes = [];
    var customChannelEmotes = [];

    var roles = {};
    var colors = {};
    var colorWheel = [
        "#FF0000",
        "#0000FF",
        "#008000",
        "#B22222",
        "#FF7F50",
        "#9ACD32",
        "#FF4500",
        "#2E8B57",
        "#DAA520",
        "#D2691E",
        "#5F9EA0",
        "#1E90FF",
        "#FF69B4",
        "#8A2BE2",
        "#00FF7F"
    ];
    var secondColors = {};

    var triggeredAlerts = [];

    var tssnCrew = ['mindlesspuppetz', 'siggy', 'blackhawk120', 'ziteseve', 'squeaker', 'grimrot', 'artdude543', 'lilmac21', 'icanhascookie69', 'cadillac_don'];

    var timeoutAlertChecker;
    var timeoutColorGetter;

    var styleChannel = 'style';

    var pathname = window.location.pathname;
    var channel = pathname.toLowerCase().replace("/", "");

    function GetStylesheet() {
        if (bexoptions.bexbadges === true) {
            return 'bexBadgesStyle';

        } else if (bexoptions.twitchbadges === true) {
            return 'bexTwitchBadgesStyle';

        } else {
            return 'bexStyle';

        }
    }

    styleChannel = GetStylesheet();

    $("body").on("click", "chat-options input[data-bex]", function() {
        var d = $(this).data("bex");
        bexoptions[d] = $(this).prop("checked");

        if (d == "bexbadges") {
            $('.chat-dialog-menu-page.bexobj input[data-bex="twitchbadges"]').prop("checked", false);
            bexoptions.twitchbadges = false;
        } else if (d == "twitchbadges") {
            $('.chat-dialog-menu-page.bexobj input[data-bex="bexbadges"]').prop("checked", false);
            bexoptions.bexbadges = false;
        }

        localStorage.setItem('bex', JSON.stringify(bexoptions));
        console.log("Toggle State of: " + d);
    });

    $('head').append('<link rel="stylesheet" href="https://exudev.ca/BeX/Dependencies/qtip.css" type="text/css" />');

    setInterval(function() {
        var bexBadgesLoaded = $("link[href='https://exudev.ca/BeX/StyleSheets/bexBadgesStyle.css?']").length > 0;
        var twitchBadgesLoaded = $("link[href='https://exudev.ca/BeX/StyleSheets/bexTwitchBadgesStyle.css?']").length > 0;
        if (bexoptions.bexbadges === true && styleChannel != 'bexBadgesStyle' && !bexBadgesLoaded) {
            styleChannel = GetStylesheet();
            $cssLink.attr('href', 'https://exudev.ca/BeX/StyleSheets/' + styleChannel + '.css?');
        } else if (bexoptions.bexbadges === false && styleChannel == 'bexBadgesStyle' && bexBadgesLoaded) {
            styleChannel = GetStylesheet();
            $cssLink.attr('href', 'https://exudev.ca/BeX/StyleSheets/' + styleChannel + '.css?');
        } else if (bexoptions.twitchbadges === true && styleChannel != 'bexTwitchBadgesStyle' && !twitchBadgesLoaded) {
            styleChannel = GetStylesheet();
            $cssLink.attr('href', 'https://exudev.ca/BeX/StyleSheets/' + styleChannel + '.css?');
        } else if (bexoptions.twitchbadges === false && styleChannel == 'bexTwitchBadgesStyle' && twitchBadgesLoaded) {
            styleChannel = GetStylesheet();
            $cssLink.attr('href', 'https://exudev.ca/BeX/StyleSheets/' + styleChannel + '.css?');
        }
    }, 1000);

    setInterval(function() {
        var isSplitChatLoaded = $("link[href='https://exudev.ca/BeX/StyleSheets/splitchat.css']").length > 0;
        if (bexoptions.splitchat === true && !isSplitChatLoaded) {
            $('head').append('<link rel="stylesheet" href="https://exudev.ca/BeX/StyleSheets/splitchat.css" type="text/css" />');
        } else if (bexoptions.splitchat === false && isSplitChatLoaded) {
            $('link[rel=stylesheet][href~="https://exudev.ca/BeX/StyleSheets/splitchat.css"]').remove();
        }

    }, 1000);

    var username = '';

    var Utils = {
        proxifyImage: function(url) {
            if (Utils.startsWithIgnoreCase(url, 'http://')) {
                return 'https://api.plugCubed.net/proxy/' + url;
            }
            return url;
        },
        getBaseURL: function(url) {
            return url.indexOf('#') > -1 ? url.substr(0, url.indexOf('#')) : (url.indexOf('?') > -1 ? url.substr(0, url.indexOf('?')) : url);
        },
        startsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.indexOf(b) === 0;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.startsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        startsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return Utils.startsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.startsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.lastIndexOf(b) === a.length - b.length;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.endsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return Utils.endsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.endsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    };

    //region Loading data
    $.getJSON('https://beam.pro/api/v1/users/current', function(data) {
        if (data.username !== null) {
            username = data.username.toLowerCase();
        }
    });

    //region Roles
    $.getJSON('https://exudev.ca/BeX/config.json?' + Math.random(), function(data) {
        roles = data;
    });
    //endregion

    // This is a cookie loader for the GlobalUsernames - Which makes every user on beam have a color
    // It is currenlty not working
    // document.cookie.split(';').forEach(function(part) {
    //    if (part.trim().indexOf('BeXColors') === 0) {
    //        secondColors = JSON.parse(part.split('=')[1].trim());
    //    }
    // })

    //region Chat Colors
    $.getJSON('https://exudev.ca/BeX/UsernameColors.json', function(data) {
        colors = data;
    });
    //endregion

    //region Emotes
    $.getJSON('https://exudev.ca/BeX/emotes/_index.json?' + Math.random(),
        /**
         * @param {{template: String, emotes: Object}} data
         */
        function(data) {
            customEmoteTemplate = data.template;
            customEmotes = data.emotes;
        });
    //endregion

    //region Twitch Emotes
    $.getJSON('https://api.plugcubed.net/twitchemotes',
        /**
         * @param {{
         *     template: {
         *         small: String
         *     },
         *     emotes: {
         *         image_id: Number
         *     }[]
         * }} data
         */
        function(data) {
            twitchEmoteTemplate = data.template.small;
            twitchEmotes = [];

            for (var i in data.emotes) {
                if (!data.emotes.hasOwnProperty(i)) continue;
                twitchEmotes.push({
                    emote: i,
                    image_id: data.emotes[i].image_id
                });
            }
        });
    //endregion

    //region Channel Emotes
    function onCustomChannelEmotesLoaded(emotes) {
        if (emotes !== null) {
            customChannelEmotes = emotes;

            if (channel == 'exuviax') {
                $messages.append(
                    $('<div>')
                    .addClass('message')
                    .attr('data-role', 'ExuMessage').append(
                        $('<div>')
                        .addClass('message-body')
                        .html('Hey, I help create/maintain <a href="https://github.com/ExuDev/BeamExtended" target="_blank">Beam Extended</a> v' + VERSION + '!<br> To see all my channel emotes and bot commands, go <a href="http://beamalerts.com/bex/exuviax" target="_blank"> here</a>')
                    )
                );

                $(".nano").nanoScroller({
                    scroll: 'bottom'
                });
            } else {

                var $message = $('<div>')
                    .addClass('message-body')
                    .html('<a href="https://github.com/ExuDev/BeamExtended" target="_blank">Beam Extended loaded</a> v' + VERSION + '<br><strong>This channel is using custom emotes!</strong><br> The emotes are: ');

                for (var i in emotes) {
                    if (!emotes.hasOwnProperty(i)) continue;
                    var emote = emotes[i];
                    $message.append($('<img title="' + emote.emote + '">').addClass('exu-emote').attr('src', customEmoteTemplate.channel.split('{image_pack}').join(emote.image_pack || channel).split('{image_id}').join(emote.image_id).split('{image_ext}').join(emote.image_ext || 'png')).data('emote', $('<span>').html(emote.emote).text()));
                }

                $messages.append(
                    $('<div>')
                    .addClass('message')
                    .attr('data-role', 'ExuMessage').append(
                        $message
                    )
                );

                $(".nano").nanoScroller({
                    scroll: 'bottom'
                });
            }
        } else {
            $messages.append(
                $('<div>')
                .addClass('message')
                .attr('data-role', 'ExuMessage').append(
                    $('<div>')
                    .addClass('message-body')
                    .html('<a href="https://github.com/ExuDev/BeamExtended" target="_blank">Beam Extended loaded</a> v' + VERSION + '<br> Request custom emotes for your channel <a href=\"http://beamalerts.com/bex/\" target=\"_blank\"> here</a>')
                )
            );

            $(".nano").nanoScroller({
                scroll: 'bottom'
            });
        }
    }

    $.getJSON('https://exudev.ca/BeX/emotes/' + channel + '/_index.json?' + Math.random())
        .done(function(emotes) {
            onCustomChannelEmotesLoaded(emotes);
        })
        .fail(function() {
            onCustomChannelEmotesLoaded(null);
        });
    //endregion
    //endregion
    var $cssLink = $('<link rel="stylesheet" type="text/css" href="https://exudev.ca/BeX/StyleSheets/' + styleChannel + '.css?">');
    $('head').append($cssLink);

    function overrideMessageBody($messageBody) {
        if ($messageBody.data('overridden') == null) {
            // Replace image links with images
            if (bexoptions.linkimages === true) {
                $messageBody.find('a').each(function() {
                    if (Utils.endsWithIgnoreCase(Utils.getBaseURL(this.href), ['.gif', '.jpg', '.jpeg', '.png', '.rif', '.tiff', '.bmp'])) {
                        var original = $('<div>').append($(this).clone()).html();

                        var $imgContainer = $('<div>').addClass('imgContainer');

                        $(this).replaceWith($imgContainer);

                        $imgContainer.append($('<img>').attr('src', Utils.proxifyImage(this.href)));

                        $imgContainer.append($('<a>').addClass('open btn').text('Open').attr({
                            target: '_blank',
                            href: this.href
                        })).append($('<div>').addClass('remove btn').text('Remove').click(function() {
                            $(this).text('Are you sure?').off('click').click(function() {
                                $imgContainer.replaceWith($('<div>').append(original));
                            });
                        }));
                    }
                });
            }

            var messageBody = ' ' + $messageBody.html() + ' ';
            var oldMessageBody = messageBody;
            var emote, temp, hasEmotes = false;

            // Replace Twitch Emotes (Global)
            if (bexoptions.twitchemotes === true) {
                for (var i in twitchEmotes) {
                    if (!twitchEmotes.hasOwnProperty(i)) continue;
                    emote = twitchEmotes[i];
                    if (messageBody.indexOf(' ' + emote.emote + ' ') > -1 || messageBody.indexOf(':' + emote.emote + ':') > -1) {
                        hasEmotes = true;
                        temp = $('<div>').append($('<img bex-tooltip="' + emote.emote + '">').addClass('exu-emote').attr('src', twitchEmoteTemplate.split('{image_id}').join(emote.image_id)).data('emote', $('<span>').html(emote.emote).text()));
                        messageBody = messageBody.split(' ' + emote.emote + ' ').join(' ' + temp.html() + ' ');
                        messageBody = messageBody.split(':' + emote.emote + ':').join(temp.html());
                    }
                }
            }

            // Replace Custom Emotes (Global)
            for (i in customEmotes) {
                if (!customEmotes.hasOwnProperty(i)) continue;
                emote = customEmotes[i];
                if (messageBody.indexOf(' ' + emote.emote + ' ') > -1 || messageBody.indexOf(':' + emote.emote + ':') > -1) {
                    hasEmotes = true;
                    temp = $('<div>').append($('<img bex-tooltip="' + emote.emote + '">').addClass('exu-emote').attr('src', customEmoteTemplate.global.split('{image_id}').join(emote.image_id).split('{image_ext}').join(emote.image_ext || 'png')).data('emote', $('<span>').html(emote.emote).text()));
                    messageBody = messageBody.split(' ' + emote.emote + ' ').join(' ' + temp.html() + ' ');
                    messageBody = messageBody.split(':' + emote.emote + ':').join(temp.html());
                }
            }

            // Replace Custom Emotes (Channel)
            for (i in customChannelEmotes) {
                if (!customChannelEmotes.hasOwnProperty(i)) continue;
                emote = customChannelEmotes[i];
                if (messageBody.indexOf(' ' + emote.emote + ' ') > -1 || messageBody.indexOf(':' + emote.emote + ':') > -1) {
                    hasEmotes = true;
                    temp = $('<div>').append($('<img bex-tooltip="' + emote.emote + '">').addClass('exu-emote').attr('src', customEmoteTemplate.channel.split('{image_pack}').join(emote.image_pack || channel).split('{image_id}').join(emote.image_id).split('{image_ext}').join(emote.image_ext || 'png')).data('emote', $('<span>').html(emote.emote).text()));
                    messageBody = messageBody.split(' ' + emote.emote + ' ').join(' ' + temp.html() + ' ');
                    messageBody = messageBody.split(':' + emote.emote + ':').join(temp.html());
                }
            }

            if (oldMessageBody != messageBody) {
                $messageBody.html(messageBody.substr(1, messageBody.length - 1));

                if (hasEmotes) {
                    $messageBody.find('[bex-tooltip!=""]').qtip({ // Grab all elements with a non-blank data-tooltip attr.
                        style: {
                            classes: 'qtip'
                        },
                        content: {
                            attr: 'bex-tooltip' // Tell qTip2 to look inside this attr for its content
                        }
                    });
                }
            }

            $messageBody.data('overridden', true);
        }
    }

    function argsToString(args) {
        var string = "";

        if (args instanceof Array) {
            if (args.length > 1) {
                var iteration = 0,
                    delim = "";
                for (var x = 0; x < args.length; x++) {
                    if (iteration === 0) {
                        iteration = 1;
                        continue;
                    }

                    string += delim + args[x];
                    delim = " ";
                }
            }
        }

        return string;
    }

    $('textarea[ng-model="message.content"]').on("keyup", function(e) {
        var code = e.keyCode || e.which;
        if (code == '32') // 9 = TAB
        {
            var string = $(this).val();
            var msgSplit = string.split(" ");
            for (var x = 0; x < msgSplit.length; x++) { // Loop through words, to support commands mid-sentence.
                if (msgSplit[x].charAt(0) == COMMAND) { // Check first letter is command
                    switch (msgSplit[x].substring(1)) { // Remove the command executor
                        case "version":
                            $(this).val($(this).val().replace(COMMAND + "version", "BEx :: Beam Extended Version " + VERSION + "!")); // Just replace the command.
                            break;
                        case "link":
                            $(this).val($(this).val().replace(COMMAND + "link", "BEx :: You can grab Beam Extended from https://github.com/ExuDev/BeamExtended "));
                            break;
                    }
                }
            }
        }
    });


    function createSettingsPage() {
        $(this).parent().find(".chat-container").append(
            $('<div>').attr('id', 'bexSettings').append(
                $('<table>').addClass('table').append(
                    $('<tbody>').append(
                        $('<tr>').append(
                            $('<td>').addClass('col-xs-6').append(
                                $('<label>').text('Twitch Emotes')
                            )
                        ).append(
                            $('<td>').append(
                                $('<label>').addClass('checkbox-fancy').append(
                                    $('<input>').attr({
                                        type: 'checkbox',
                                        'data-bex': 'twitchemotes'
                                    })
                                )
                            )
                        )
                    ).append(
                        $('<tr>').append(
                            $('<td>').addClass('col-xs-6').append(
                                $('<label>').text('Username Colors')
                            )
                        ).append(
                            $('<td>').append(
                                $('<label>').addClass('checkbox-fancy').append(
                                    $('<input>').attr({
                                        type: 'checkbox',
                                        'data-bex': 'usercolors'
                                    })
                                )
                            )
                        )
                    ).append(
                        $('<tr>').append(
                            $('<td>').addClass('col-xs-6').append(
                                $('<label>').text('Use BEx Badges')
                            )
                        ).append(
                            $('<td>').append(
                                $('<label>').addClass('checkbox-fancy').append(
                                    $('<input>').attr({
                                        type: 'checkbox',
                                        'data-bex': 'bexbadges'
                                    })
                                )
                            )
                        )
                    ).append(
                        $('<tr>').append(
                            $('<td>').addClass('col-xs-6').append(
                                $('<label>').text('Use Twitch Badges')
                            )
                        ).append(
                            $('<td>').append(
                                $('<label>').addClass('checkbox-fancy').append(
                                    $('<input>').attr({
                                        type: 'checkbox',
                                        'data-bex': 'twitchbadges'
                                    })
                                )
                            )
                        )
                    ).append(
                        $('<tr>').append(
                            $('<td>').addClass('col-xs-6').append(
                                $('<label>').text('Chat Images')
                            )
                        ).append(
                            $('<td>').append(
                                $('<label>').addClass('checkbox-fancy').append(
                                    $('<input>').attr({
                                        type: 'checkbox',
                                        'data-bex': 'linkimages'
                                    })
                                )
                            )
                        )
                    ).append(
                        $('<tr>').append(
                            $('<td>').addClass('col-xs-6').append(
                                $('<label>').text('SplitChat')
                            )
                        ).append(
                            $('<td>').append(
                                $('<label>').addClass('checkbox-fancy').append(
                                    $('<input>').attr({
                                        type: 'checkbox',
                                        'data-bex': 'splitchat'
                                    })
                                )
                            )
                        )
                    )
                )
            ).dialog({
                autoOpen: false,
                show: {
                    effect: "blind",
                    duration: 1000
                },
                hide: {
                    effect: "explode",
                    duration: 1000
                }
            })
        );
        //need to fix for settings too work
        /*for (opt in bexoptions) {
            $('.chat-dialog-menu-page.bexobj input[data-bex="' + opt + '"]').prop("checked", bexoptions[opt]);
        }*/

        $('.message-actions').find('.list-inline').append(
            $('<li>').append('<a class="pull-left btn btn-link icon icon-menu">').click(function() {
                $('#bexSettings').dialog('open');
            })
        );
    }
   
    setInterval(function() {
        if (jQuery.fn.dialog != null && $(".message-actions .icon-menu").length < 1) {
            createSettingsPage();
        }
    }, 2000);


    /*        var opts = $(".message-actions"); // Get the div
            var parent = opts.find("ul"); // Find the section
            if (parent !== null) {
                // Add the navigation element for our page
                nav = parent.find(".list-inline");
                nav.find("li"); // Add them to my logic
                nav.append('<li><a class="pull-left btn btn-link icon icon-eye ng-scope" data-title="BEx Settings" data-placement="bottom" ></a></li>');
            }
        }

        // Selector is a bit annoying, but I can't see a better more reliable one to use.
        $(".message-actions .icon-cogs").click(function() {
            createSettingsPage();
        });

        //$("chat-options").on("click", "input[data-bex]", function() {
        //    // TEMPORARY FOR TESTING PURPOSES
        //    console.log("Toggle State of: " + $(this).data("bex"));
        //});
        
        $("chat-options").on("click", "li[data-apage]", function() {
            var num = $(this).data("apage");
            console.log("On Click " + num);

            $(this).parent().find("li").removeClass("active");
            $(this).addClass("active");

            var section = $(this).parent().parent().parent();

            // If our page doesn't exist, then re-add it.
            // We do this because the Beam system resets the syntax when their pages change.
            if ($(".chat-dialog-menu-page.bexobj").length === 0) {
                var ourPage = '<div class="chat-dialog-menu-page ng-scope bexobj" data-apage="Bex">' +
                    '<table class="table">' +
                    '<tbody>' +
                    '<tr>' +
                    '<td class="col-xs-6"><label>Twitch Emotes</label></td>' +
                    '<td><label class="checkbox-fancy"><input type="checkbox" data-bex="twitchemotes" class="ng-pristine ng-untouched ng-valid"></label></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="col-xs-6"><label>Username Colors</label></td>' +
                    '<td><label class="checkbox-fancy"><input type="checkbox" data-bex="usercolors" class="ng-pristine ng-untouched ng-valid"></label></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="col-xs-6"><label>Use BEx Badges</label></td>' +
                    '<td><label class="checkbox-fancy"><input type="checkbox" data-bex="bexbadges" class="ng-pristine ng-untouched ng-valid"></label></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="col-xs-6"><label>Use Twitch Badges</label></td>' +
                    '<td><label class="checkbox-fancy"><input type="checkbox" data-bex="twitchbadges" class="ng-pristine ng-untouched ng-valid"></label></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="col-xs-6"><label>Chat Images</label></td>' +
                    '<td><label class="checkbox-fancy"><input type="checkbox" data-bex="linkimages" class="ng-pristine ng-untouched ng-valid"></label></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="col-xs-6"><label>SplitChat</label></td>' +
                    '<td><label class="checkbox-fancy"><input type="checkbox" data-bex="splitchat" class="ng-pristine ng-untouched ng-valid"></label></td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>' +
                    '</div>';
                section.find(".chat-dialog-menu-page").after(ourPage);

                for (opt in bexoptions) {
                    $('.chat-dialog-menu-page.bexobj input[data-bex="' + opt + '"]').prop("checked", bexoptions[opt]);
                }
            }

            if (num == "Bex") {
                section.find(".chat-dialog-menu-page").hide();
                section.find('.chat-dialog-menu-page.bexobj').show();
            } else {
                section.find(".chat-dialog-menu-page").show();
                section.find('.chat-dialog-menu-page.bexobj').hide();
            }
        });*/


    function onChatReceived(event) {
        var $this = $(event.target);
        var messageAuthor = $this.find('.message-author').text().toLowerCase();
        var messageRole = $this.attr('data-role');

        if (messageAuthor === null || messageRole === null) {
            return;
        }

        var i;

        // Check for special roles
        for (i in roles) {
            if (!roles.hasOwnProperty(i)) continue;
            if (roles[i].indexOf(messageAuthor) > -1) {
                messageRole += ' ' + i;
            }
        }
        $this.attr('data-role', messageRole);

        // User Colors
        if (bexoptions.usercolors === true) {
            if (colors[messageAuthor] !== null) {
                $this.find('.message-author').css('color', colors[messageAuthor]);
            } else if (secondColors[messageAuthor] !== null) {
                if (bexoptions.globalcolors === true) {
                    $this.find('.message-author').css('color', secondColors[messageAuthor]);
                }
            } else {
                if (bexoptions.globalcolors === true) {
                    var randomPicker = Math.floor(Math.random() * 16);
                    secondColors[messageAuthor] = colorWheel[randomPicker];
                    $this.find('.message-author').css('color', secondColors[messageAuthor]);
                    // Here is more of the cookie loader, which is still not working.
                    // document.cookie['BeXColors'] = JSON.stringify(secondColors);
                }
            }
        }

        overrideMessageBody($this.find('.message-body'));

        if (messageAuthor == username) {
            $this.on('DOMSubtreeModified', onMessageOverridden);
        }
    }


    function onMessageOverridden(event) {
        var $this = $(event.target);
        if ($this.hasClass('message-body')) {
            setTimeout(function() {
                $this.off('DOMSubtreeModified');
            }, 500);
            $(event.target).data('overridden', null);
            overrideMessageBody($this);
        }
    }

    var $messages = $('.messages').find('.nano-content');

    $messages.on('DOMNodeInserted', onChatReceived);

    console.log('Loaded BeamExtended v' + VERSION);

    function checkForAlerts() {
        $.getJSON('https://exudev.ca/BeX/alert.json', function(systemAlert) {
            for (var i in systemAlert) {
                if (!systemAlert.hasOwnProperty(i)) continue;
                if (triggeredAlerts.indexOf(systemAlert[i]) > -1) continue;
                $messages.append(
                    $('<div>')
                    .addClass('message')
                    .attr('data-role', 'ExuMessage').append(
                        $('<div>')
                        .addClass('message-body')
                        .html('<b>Beam Extended Alert</b><br>' + systemAlert[i])
                    ));
                triggeredAlerts.push(systemAlert[i]);
            }
        });
        timeoutAlertChecker = setTimeout(function() {
            checkForAlerts();
        }, 6e4);
    }

    checkForAlerts();

    this.close = function() {
        $messages.off('DOMNodeInserted', onChatReceived);
        $cssLink.remove();
        $('#bexSettings').remove();
        $('.message-actions').find('.icon-menu').remove();
        clearTimeout(timeoutAlertChecker);
        clearTimeout(timeoutColorGetter);
        BeamExtendedInstance = undefined;
    };

    return this;
};

(function() {
    function checker() {
        if (typeof jQuery !== 'undefined' && $('.messages').length > 0) {
            if ($.fn.qtip == null) {
                $.getScript('https://mradder.com/ss/jquery.qtip.min.js', function() {
                    load();
                });
                return;
            }
            load();
        } else {
            setTimeout(function() {
                checker();
            }, 100);
        }
    }

    function load() {
        BeamExtendedInstance = new BeamExtended();
    }

    checker();
})();