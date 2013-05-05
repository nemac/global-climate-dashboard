(function ($) {
    "use strict";

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

    function xmlObjectToString(obj) {
      if (window.ActiveXObject) {
        return obj.xml;
      }
      return (new XMLSerializer()).serializeToString(obj);
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
                var $targetChildList = $target.find(">"+elementName);
                if ($targetChildList.length === 0) {
                    $target.append($("<"+elementName+">"));
                } else if (elementAction === "empty") {
                    $target.find(">"+elementName).empty();
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

        $configxml.find(">tab").each(function() {
            var $tabxml  = $(this);
            var tabTitle = $tabxml.find(">title").text();
            var tabId    = $tabxml.attr('id');
            var $tabMuglOverrides = $tabxml.find(">mugloverrides");
            var tabGraphs = [];
            $tabxml.find('graph').each(function() {
                var title       = $(this).find('>title').text();
                var shortTitle  = $(this).find('>shorttitle').text();
                var description = $(this).find('>description').text();
                var mugl        = applyXMLOverrides($(this).find('mugl'),
                                                    [ $globalMuglOverrides,
                                                      $tabMuglOverrides ]);
                tabGraphs.push({'title'       : title,
                                'shortTitle'  : shortTitle,
                                'description' : description,
                                'mugl'        : mugl});
            });
            $timelineMugl = applyXMLOverrides($timelineMugl, 
                                              [ $globalMuglOverrides,
                                                $tabMuglOverrides,
                                                $timelineMuglOverrides ]);
            var timeSliderMin         = parseInt($timelineMugl.find("horizontalaxis pan").attr('min'), 10);
            var timeSliderMax         = parseInt($timelineMugl.find("horizontalaxis pan").attr('max'), 10);
            var timeSliderSelectedMin = parseInt($timelineMugl.find("horizontalaxis").attr('min'), 10);
            var timeSliderSelectedMax = parseInt($timelineMugl.find("horizontalaxis").attr('max'), 10);

            // for the climateChange2 tab only...
            var $tabDiv = undefined;
            if (tabId === 'climateChange2') {
                $tabDiv = $('<div class="dashboard-tab-wrapper">').dashboard_tab({
                    graphs                : tabGraphs,
                    timelineMugl          : $timelineMugl,
                    timeSliderMin         : timeSliderMin,
                    timeSliderMax         : timeSliderMax,
                    timeSliderSelectedMin : timeSliderSelectedMin,
                    timeSliderSelectedMax : timeSliderSelectedMax
                }).appendTo($tabsContainer);
            };

            // add the tab button
            tabButtonList.push(
                $('<div class="dashboard-tab-button"/>')
                    .button({
                        label : tabTitle
                    })
                    .click(function() {
                        displayTab($tabDiv);
                    })
                    .appendTo($tabButtonsDiv)
            );


        });

    }

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard'),
                    settings = $.extend({
                        config : undefined,
                        title : 'Global Climate Dashboard'
                    }, options);
                if ( ! data ) {

                    var $dashboardDiv = $(Mustache.to_html(dashboardTpl, {
                        title : settings.title
                    })).appendTo($this);

                    $this.data('dashboard', {
                        //
                    });

                    $.ajax({url      : settings.config,
                            dataType : 'text',
                            success  : function (data) {
                                var $configxml = window.multigraph.parser.jquery.stringToJQueryXMLObj(data);
                                buildDashboard($dashboardDiv, $configxml);
                            }});

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
