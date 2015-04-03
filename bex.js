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
 * holder at contact@exudev.ca or by creating an issue here - https://github.com/IFDevelopment/BeamExtended/issues
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

$.fn.ignore = function(sel) {
    return this.clone().find(sel || ">*").remove().end();
};

BeamExtended = function() {
    var VERSION = '1.3.0';
    var COMMAND = ':'; // What is before a command?

    var twitchEmoteTemplate = '';
    var twitchEmotes = [];

    var customEmoteTemplate = {
        global: '',
        channel: ''
    };
    var customEmotes = [];
    var customChannelEmotes = [];

    var $bexOptions;
    var bexoptions = {
        twitchemotes: true,
        linkimages: false,
        usercolors: true,
        twitchbadges: false,
        bexbadges: false,
        splitchat: false,
        ignorecommands: false,
        ignorerobots: false
    };

    //region Localstorage
    if (localStorage.getItem('bex') == null) {
        localStorage.setItem('bex', JSON.stringify(bexoptions));
    } else {
        bexoptions = JSON.parse(localStorage.getItem('bex'));
    }
    //endregion Local Storage

    var roles = {};
    var colors = {};

    var triggeredAlerts = [];

    var timeoutAlertChecker;
    var timeoutColorGetter;

    var styleChannel = 'style';

    var $rootMeta = $('meta[name="bex-root-url"]');
    var rootURL = $rootMeta.length > 0 ? $rootMeta.attr('content') : 'https://exudev.ca/BEx/';

    var pathname = window.location.pathname;
    var channel = pathname.toLowerCase().replace("/", "");

    /**
     * Get the current stylesheet design
     * @returns {string}
     */
    function GetStylesheet() {
        if (bexoptions.bexbadges === true) {
            return 'bexBadges.style';

        } else if (bexoptions.twitchbadges === true) {
            return 'twitchBadges.style';

        } else {
            return 'style';

        }
    }

    styleChannel = GetStylesheet();

    $('head').append('<link rel="stylesheet" href="' + rootURL + 'Dependencies/qtip.css" type="text/css" />');

    setInterval(function() {
        var bexBadgesLoaded = $("link[href^='" + rootURL + "css/bexBadges.style.css?']").length > 0;
        var twitchBadgesLoaded = $("link[href^='" + rootURL + "css/twitchBadges.style.css?']").length > 0;

        if (bexoptions.bexbadges === true && styleChannel != 'bexBadges.style' && !bexBadgesLoaded ||
            bexoptions.bexbadges === false && styleChannel == 'bexBadges.style' && bexBadgesLoaded ||
            bexoptions.twitchbadges === true && styleChannel != 'twitchBadges.style' && !twitchBadgesLoaded ||
            bexoptions.twitchbadges === false && styleChannel == 'twitchBadges.style' && twitchBadgesLoaded) {
            styleChannel = GetStylesheet();
            $cssLink.attr('href', rootURL + 'css/' + styleChannel + '.css?');
        }
    }, 1000);

    setInterval(function() {
        var isSplitChatLoaded = $("link[href='" + rootURL + "css/splitchat.css']").length > 0;
        if (bexoptions.splitchat === true && !isSplitChatLoaded) {
            $('head').append('<link rel="stylesheet" href="' + rootURL + 'css/splitchat.css" type="text/css" />');
        } else if (bexoptions.splitchat === false && isSplitChatLoaded) {
            $('link[rel=stylesheet][href~="' + rootURL + 'css/splitchat.css"]').remove();
        }

    }, 1000);

    var username = '';

    /**
     * Different Utilities
     * @type {{proxifyImage: Function, getBaseURL: Function, startsWith: Function, startsWithIgnoreCase: Function, endsWith: Function, endsWithIgnoreCase: Function}}
     */
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
        },
        equalsIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length == b.length) {
                    return a.toLowerCase() == b.toLowerCase();
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.equalsIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    };

    //region Loading data
    $.getJSON('https://beam.pro/api/v1/users/current',
        /**
         * @param {{username: null|String}} data
         */
        function(data) {
            if (data.username !== null) {
                username = data.username.toLowerCase();
            }
        });

    //region Roles
    $.getJSON(rootURL + 'config.json?' + Math.random(), function(data) {
        roles = data;
    });
    //endregion

    //region Chat Colors
    $.getJSON(rootURL + 'UsernameColors.json', function(data) {
        colors = data;
    });
    //endregion

    //region Emotes
    $.getJSON(rootURL + 'emotes/_index.json?' + Math.random(),
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

            if (Utils.startsWith(channel, ['tatdk', 'exuviax', 'mradder'])) {
                $messages.append(
                    $('<div>')
                        .addClass('message')
                        .attr('data-role', 'ExuMessage').append(
                        $('<div>')
                            .addClass('message-body')
                            .html('Hey, I help create/maintain <a href="https://github.com/IFDevelopment/BeamExtended" target="_blank">Beam Extended</a> v' + VERSION + '!<br> To submit an issue/suggestion or want your own channel emotes, <a href="http://beamalerts.com/bex/" target="_blank">click here</a>')
                    )
                );

                $(".nano").nanoScroller({
                    scroll: 'bottom'
                });
            } else {

                var $message = $('<div>')
                    .addClass('message-body')
                    .html('<a href="https://github.com/IFDevelopment/BeamExtended" target="_blank">Beam Extended loaded</a> v' + VERSION + '<br><strong>This channel is using custom emotes!</strong><br> The emotes are: ');

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
                        .html('<a href="https://github.com/IFDevelopment/BeamExtended" target="_blank">Beam Extended loaded</a> v' + VERSION + '<br> Request custom emotes for your channel <a href=\"http://beamalerts.com/bex/\" target=\"_blank\"> here</a>')
                )
            );

            $(".nano").nanoScroller({
                scroll: 'bottom'
            });
        }
    }

    $.getJSON(rootURL + 'emotes/' + channel + '/_index.json?' + Math.random())
        .done(function(emotes) {
            onCustomChannelEmotesLoaded(emotes);
        })
        .fail(function() {
            onCustomChannelEmotesLoaded(null);
        });
    //endregion
    //endregion

    var $cssLink = $('<link rel="stylesheet" type="text/css" href="' + rootURL + 'css/' + styleChannel + '.css?">');
    $('head').append($cssLink);

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
                            $(this).val($(this).val().replace(COMMAND + "link", "BEx :: You can grab Beam Extended from https://github.com/IFDevelopment/BeamExtended "));
                            break;
                    }
                }
            }
        }
    });

    //region Settings
    function createSettingsPage() {
        function onChangeSetting(e) {
            var setting = $(e.target).attr('data-bex');

            switch (setting) {
                case 'bexbadges':
                    if (bexoptions['twitchbadges']) {
                        bexoptions['twitchbadges'] = false;
                        $('input[data-bex="twitchbadges"]').removeAttr('checked');
                    }
                    break;
                case 'twitchbadges':
                    if (bexoptions['bexbadges']) {
                        bexoptions['bexbadges'] = false;
                        $('input[data-bex="bexbadges"]').removeAttr('checked');
                    }
                    break;
            }

            bexoptions[setting] = !bexoptions[setting];
            localStorage.setItem('bex', JSON.stringify(bexoptions));
        }

        $bexOptions = $('<bex-settings>').append(
            $('<div>').addClass('chat-dialog chat-dialog-with-menu animated animated-s-fast zoomIn-enter zoomOut-leave').append(
                $('<header>').append(
                    $('<h5>').text('BEx Settings').append($('<a class="pull-right icon icon-close chat-close-icon"></a>').click(function() {
                        $bexOptions.hide('fast');
                    }))
                )/*
                 //TODO: In case we want multiple tabs
                 .append(
                 $('<div>').addClass("chat-dialog-menu").append(
                 $('<ul>').addClass("nav nav-pills nav-pills-beam").append(
                 $('<li>').addClass("active").append(
                 $('<a>').text('Channel')
                 )
                 ).append(
                 $('<li>').append(
                 $('<a>').text('Personal')
                 )
                 )
                 )
                 )*/
            ).append(
                $('<section>').append(
                    $('<alerts-box messages="errors">')
                ).append(
                    $('<div>').addClass("chat-dialog-menu-page").append(
                        $('<table>').addClass("table").append(
                            $('<tbody>').append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Twitch Emotes')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'twitchemotes'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Username Colors')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'usercolors'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('BEx Badges')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'bexbadges'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Twitch Badges')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'twitchbadges'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Chat Images')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'linkimages'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Split Chat')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'splitchat'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Ignore Bots')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'ignorerobots'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            ).append(
                                $('<tr>').append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').text('Ignore Commands')
                                    )
                                ).append(
                                    $('<td>').addClass('col-xs-6').append(
                                        $('<label>').addClass('checkbox-fancy').append(
                                            $('<input>').attr({
                                                type: 'checkbox',
                                                'data-bex': 'ignorecommands'
                                            }).change(onChangeSetting)
                                        )
                                    )
                                )
                            )
                        )
                    )
                ).append(
                    $('<div>').addClass("chat-dialog-menu-footer").append(
                        $('<div>').addClass("col-md-6").append(
                            $('<a>').addClass('btn btn-sm btn-default').text('Issues / Suggestions').attr({
                                target: '_blank',
                                href: 'https://github.com/IFDevelopment/BeamExtended/issues'
                            })
                        )
                    ).append(
                        $('<div>').addClass("col-md-6 text-right").append(
                            $('<a>').addClass('btn btn-sm btn-primary').text('Save').click(function() {
                                $bexOptions.hide('fast');
                            })
                        )
                    )
                )
            )
        ).hide();

        $('.chat-panel').find('.panel-body').append($bexOptions);

        for (var i in bexoptions) {
            if (bexoptions.hasOwnProperty(i) && bexoptions[i] == true) {
                $('input[data-bex="' + i + '"]').attr('checked', 'checked');
            }
        }

        $('.message-actions').find('.list-inline').append(
            $('<li>').append('<a class="pull-left btn btn-link icon icon-menu">').click(function() {
                $bexOptions.toggle('fast');
            }).mouseover(function() {
                var $tooltip = $('<div>').addClass('tooltip in am-fade bottom').css({
                    top: '29px',
                    display: 'block'
                }).html('<div class="tooltip-arrow"></div><div class="tooltip-inner">BEx Settings</div>');

                $(this).append($tooltip);

                $tooltip.css('left', $(this).offset().left - $('.chat-panel').offset().left - ($tooltip.width() / 2) + $(this).width() / 2);
            }).mouseout(function() {
                $(this).find('.tooltip').remove();
            })
        );
    }

    setInterval(function() {
        if ($(".message-actions .icon-menu").length < 1) {
            createSettingsPage();
        }
    }, 2000);
    //endregion

    //region On Chat Received
    function overrideMessageBody($messageBody) {
        if ($messageBody.data('overridden') == null) {
            // Replace image links with images
            if (bexoptions.linkimages === true) {
                $messageBody.find('a').each(function() {
                    // Prevent overriding multiple times
                    if ($(this).hasClass('open')) return;

                    if (Utils.endsWithIgnoreCase(Utils.getBaseURL(this.href), ['.gif', '.jpg', '.jpeg', '.png', '.rif', '.tiff', '.bmp'])) {
                        var original = $('<div>').append($(this).clone()).html();

                        var $imgContainer = $('<div>').addClass('imgContainer');

                        $(this).replaceWith($imgContainer);

                        $imgContainer.append($('<img>').attr('src', Utils.proxifyImage(this.href)));

                        $imgContainer.append($('<a>').addClass('open btn').text('Open').attr({
                            target: '_blank',
                            href: this.href
                        })).append($('<div>').addClass('remove btn').text('Remove').click(function() {
                            // FIXME: At some point...
                            $(original).find('.remove').text('Are you sure?');
                            $imgContainer.replaceWith($('<div>').append(original));
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

    function onChatReceived(event) {
        var $this = $(event.target);
        var messageAuthor = $this.find('.message-author').ignore('div').text().toLowerCase();
        var $authorTooltip = $this.find('.message-author').find('.message-tooltip');
        var messageRole = $this.attr('data-role');

        if (messageAuthor === null || messageRole === null) {
            return;
        }

        if (bexoptions.ignorerobots && Utils.equalsIgnoreCase(messageAuthor, roles['BExBot'] != null ? roles['BExBot'] : []) ||
            bexoptions.ignorecommands && Utils.startsWith($this.find('.message-body').ignore('.message-timestamp').text(), '!')) {
            $this.remove();
            return;
        }

        var i, _msgRoles = $authorTooltip.text().split(',');

        for (i in _msgRoles) {
            if (_msgRoles.hasOwnProperty(i)) {
                _msgRoles[i] = _msgRoles[i].trim();
            }
        }

        if (_msgRoles.indexOf('User') > -1) {
            _msgRoles.splice(_msgRoles.indexOf('User'), 1);
        }

        $authorTooltip.text(_msgRoles.join(', '));

        // Check for special roles
        for (i in roles) {
            if (!roles.hasOwnProperty(i)) continue;
            if (roles[i].indexOf(messageAuthor) > -1) {
                $this.addClass('message-role-' + i);
            }
        }

        // User Colors
        if (bexoptions.usercolors === true) {
            if (colors[messageAuthor] !== null) {
                $this.find('.message-author').css('color', colors[messageAuthor]);
            }
            /*
             TODO: Remove if this isn't comming back
             else if (secondColors[messageAuthor] !== null) {
             if (bexoptions.globalcolors === true) {
             $this.find('.message-author').css('color', secondColors[messageAuthor]);
             }
             } else {
             if (bexoptions.globalcolors === true) {
             var randomPicker = Math.floor(Math.random() * 16);
             secondColors[messageAuthor] = colorWheel[randomPicker];
             $this.find('.message-author').css('color', secondColors[messageAuthor]);
             }
             }
             */
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
    //endregion

    console.log('Loaded BeamExtended v' + VERSION);

    function checkForAlerts() {
        $.getJSON(rootURL + 'alert.json', function(systemAlert) {
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