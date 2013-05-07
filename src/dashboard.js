(function ($) {
    "use strict";

    window.dashboard = {
        '$' : jQuery
    };

    var dashboardTpl =
            (
                ''
                    + '<div class="dashboard">'
                    +   '<div class="dashboard-title">{{{title}}}</div>'
                    +   '<div class="dashboard-tab-buttons"></div>'
                    +   '<div class="dashboard-tabs">'
                    +   '</div>'
                    + '</div>'
            );

    var flashDashboardTpl =
            ( 
                ''
                    + '<object width="{{{width}}}" height="{{{height}}}"'
                    +        ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">'
                    +   '<param name="quality" value="best" />'
                    +   '<param name="scale" value="exactfit" />'
                    +   '<param name="wmode" value="opaque" />'
                    +   '<param name="bgcolor" value="#ffffff" />'
                    +   '<param name="src" value="{{{swf_path}}}"/>'
                    +   '<param name="name" value="mgid" />'
                    +   '<param name="allowfullscreen" value="false" />'
                    +   '<param name="allowScriptAccess" value="sameDomain" />'
                    +   '<param name="flashvars" value="config={{{config}}}"/>'
                    +   '<param name="align" value="middle" />'
                    +   '<embed'
                    +     ' type="application/x-shockwave-flash"'
                    +     ' width="{{{width}}}"'
                    +     ' height="{{{height}}}"'
                    +     ' src="{{{swf_path}}}"'
                    +     ' name="mgid"'
                    +     ' bgcolor="#ffffff"'
                    +     ' wmode="opaque"'
                    +     ' scale="exactfit"'
                    +     ' quality="best"'
                    +     ' allowfullscreen="false"'
                    +     ' allowscriptaccess="sameDomain"'
                    +     ' flashvars="config={{{config}}}"'
                    +     ' align="middle">'
                    +   '</embed>'
                    + '</object>'
            );
              
    function xmlObjectToString(obj) {
        if (window.ActiveXObject) {
            return obj.xml;
        }
        return (new XMLSerializer()).serializeToString(obj);
    }
              
    function remove_trailing_slash(url) {
        return url.replace(/\/$/, '');
    }

    function add_relative_url_prefix(prefix, url) {
        // If `url` is a relative url (neither starts with a '/', nor contains a '//'),
        // modify it by prepending `prefix` to it.  If `url` is not relative, return
        // it unmodified.
        if (url.match(/^\//) || url.match(/\/\//)) {
            return url;
        }
        return remove_trailing_slash(prefix) + '/' + url;
    }

    function removeTitleTagAndFixSuperSub(string) {
        string = string.replace(/<title>/, "");
        string = string.replace(/<\/title>/, "");
        string = string.replace(/<span\s+baselineShift="superscript">([^>]+)<\/span>/, "<sup>$1</sup>");
        string = string.replace(/<span\s+baselineShift="subscript">([^>]+)<\/span>/, "<sub>$1</sub>");
        return string;
    }

    function applyXMLOverrides($target, $overrides) {
        var i;
        if (! $overrides || $overrides.length === 0) {
            return $target;
        }
        if (window.multigraph.utilityFunctions.typeOf($overrides) === "array") {
            for (i=0; i<$overrides.length; ++i) {
                applyXMLOverrides($target, $overrides[i]);
            }
        } else {
            var $attrs = $overrides.find(">attribute");
            $attrs.each(function() {
                var $this = $(this);
                var attrName = $this.attr('name');
                var attrValue = $this.attr('value');
                $target.attr(attrName, attrValue);
            });
            $overrides.find(">element").each(function() {
                var $this = $(this);
                var elementName   = $this.attr('name');
                var elementAction = $this.attr('action');
                var elementText   = $this.attr('text');
                var $targetChildList = $target.find(">"+elementName);
                if ($targetChildList.length === 0) {
                    $target.append($("<"+elementName+">"));
                } else if (elementAction === "empty") {
                    $target.find(">"+elementName).empty();
                } else if (elementText) {
                    $target.find(">"+elementName).text(elementText);
                }
                applyXMLOverrides($target.find(">"+elementName), $this);
            });
            $overrides.find(">elements").each(function() {
                var $e = $(this);
                var elementName = $e.attr('name');
                $target.find(elementName).each(function() {
                    var $descendant = $(this);
                    $e.find(">attribute").each(function() {
                        var $f = $(this);
                        var name = $f.attr('name');
                        var value = $f.attr('value');
                        $descendant.attr(name, value);
                    });
                });
            });
        }
        return $target;
    }

    function buildDashboard($container, $configxml) {
        var $globalMuglOverrides   = $configxml.find(">mugloverrides");
        var $timelineMugl          = $configxml.find(">timeline mugl");
        var $timelineMuglOverrides = $configxml.find(">timeline mugloverrides");
        var $tabsContainer = $container.find(".dashboard-tabs");
        var $tabButtonsDiv = $container.find(".dashboard-tab-buttons");
        
        var tabList       = [];
        var tabButtonList = [];

        function displayTab(i) {
            var j;
            for (j=0; j<tabList.length; ++j) {
                if (j == i) {
                    tabList[j].css('display', 'block');
                    tabButtonList[j].addClass("dashboard-button-selected");
                } else {
                    tabList[j].css('display', 'none');
                    tabButtonList[j].removeClass("dashboard-button-selected");
                }
            }
        }

        $configxml.find(">tab").each(function(i) {
            var $tabxml  = $(this);
            var tabTitle = $tabxml.find(">title").text();
            var tabId    = $tabxml.attr('id');
            var $tabMuglOverrides = $tabxml.find(">mugloverrides");
            var tabGraphs = [];
            $tabxml.find('graph').each(function() {
                //var title       = $(this).find('>title').text();
                var title       = removeTitleTagAndFixSuperSub(xmlObjectToString(($(this).find('>title'))[0]));
                var shortTitle  = $(this).find('>shorttitle').text();
                var description = $(this).find('>description').text();
                var legendTitle = $(this).find('>legendtitle').text();
                var legendText  = $(this).find('>legendtext').text();
                var link        = $(this).find('>link').text();
                var $legend     = undefined;
                if ($(this).find('>legend').length > 0) {
                    $legend = $('<table/>');
                    $(this).find('>legend item').each(function() {
                        $legend.append($('<tr><td><img src="'
                                         + add_relative_url_prefix(window.dashboard.assets,
                                                                   $(this).find("img").attr('src'))
                                         + '"/></td><td>'
                                         + $(this).find("text").text()
                                         + '</td></tr>'));
                    });
                }
                var mugl        = applyXMLOverrides($(this).find('mugl'),
                                                    [ $globalMuglOverrides,
                                                      $tabMuglOverrides ]);
                tabGraphs.push({
                    'title'       : title,
                    'shortTitle'  : shortTitle, 
                    'description' : description,
                    'legendTitle' : legendTitle,
                    'legendText'  : legendText,
                    'legend'      : $legend,
                    'mugl'        : mugl,
                    'link'        : link
                });
            });
            $timelineMugl = applyXMLOverrides($timelineMugl, 
                                              [ $globalMuglOverrides,
                                                $tabMuglOverrides,
                                                $timelineMuglOverrides ]);
            var timeSliderMin         = parseInt($timelineMugl.find("horizontalaxis pan").attr('min'), 10);
            var timeSliderMax         = parseInt($timelineMugl.find("horizontalaxis pan").attr('max'), 10);
            var timeSliderSelectedMin = parseInt($timelineMugl.find("horizontalaxis").attr('min'), 10);
            var timeSliderSelectedMax = parseInt($timelineMugl.find("horizontalaxis").attr('max'), 10);

            // create the tab div, with css display `none`, and add it to the list of all tabdivs
            if (tabGraphs.length > 1) {
                tabList.push(
                    $('<div class="dashboard-tab-wrapper">')
                        .dashboard_tab({
                            graphs                : tabGraphs,
                            timelineMugl          : $timelineMugl,
                            timeSliderMin         : timeSliderMin,
                            timeSliderMax         : timeSliderMax,
                            timeSliderSelectedMin : timeSliderSelectedMin,
                            timeSliderSelectedMax : timeSliderSelectedMax
                        })
                        .appendTo($tabsContainer)
                        .css('display', 'none')
                );
            } else {
                tabList.push(
                    $('<div class="dashboard-tab-wrapper">')
                        .dashboard_singleslot_tab({
                            graph                 : tabGraphs[0],
                            timelineMugl          : $timelineMugl,
                            timeSliderMin         : timeSliderMin,
                            timeSliderMax         : timeSliderMax,
                            timeSliderSelectedMin : timeSliderSelectedMin,
                            timeSliderSelectedMax : timeSliderSelectedMax
                        })
                        .appendTo($tabsContainer)
                        .css('display', 'none')
                );
            }
            
            // add the tab button
            tabButtonList.push(
                $('<div class="dashboard-tab-button"/>')
                    .button({
                        label : tabTitle
                    })
                    .click(function() {
                        displayTab(i);
                    })
                    .appendTo($tabButtonsDiv)
            );


        });

        displayTab(0);

    }

    function buildFlashDashboard(options) {
        return $(Mustache.to_html(flashDashboardTpl, {
            width             : 940,
            height            : 570,
            swf_path          : options.swf_path,
            config            : options.config
        }));
    }

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard'),
                    settings = $.extend({
                        config : undefined,
                        title  : 'Global Climate Dashboard',
                        assets : '.'
                    }, options);

                window.dashboard.assets = remove_trailing_slash(settings.assets);

                if ( ! data ) {

                    $this.data('dashboard', {
                        initialized : true
                    });

                    if (settings.flash && (settings.flash.force
                                           || (!window.multigraph.core.browserHasCanvasSupport()
                                               &&
                                               !window.multigraph.core.browserHasSVGSupport()))) {
                        // if configured to fall back to flash, do so here
                        if (!settings.flash.config) {
                            // flash config path defaults to regular config path:
                            settings.flash.config = settings.config;
                        }
                        $this.append(buildFlashDashboard(settings.flash));
                    } else {

                        var $dashboardDiv = $(Mustache.to_html(dashboardTpl, {
                            title : settings.title
                        })).appendTo($this);

                        $.ajax({url      : settings.config,
                                dataType : 'text',
                                success  : function (data) {
                                    var $configxml = window.multigraph.parser.jquery.stringToJQueryXMLObj(data);
                                    buildDashboard($dashboardDiv, $configxml);
                                }});
                    }

                }
                return this;
            });
        }
    };

    $.fn.dashboard = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard' );
            return null;
        }    
    };
    
}(jQuery));
