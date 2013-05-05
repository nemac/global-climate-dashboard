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
        var $globalMuglOverrides = $configxml.find(">mugloverrides");
        var $timelineMugl = $configxml.find(">timeline mugl");
        var $timelineMuglOverrides = $configxml.find(">timeline mugloverrides");

        var $tabContainer = $container.find(".dashboard-tabs");

        $configxml.find(">tab").each(function() {
            var $tabxml = $(this);
            var $tabMuglOverrides = $tabxml.find(">mugloverrides");
            // for the climateChange2 tab only...
            if ($tabxml.attr('id') == 'climateChange2') {

                var firstDashboardGraphDiv = undefined;


                //
                // add 3 graphs
                //
                var N = 0;
                $tabxml.find('graph').each(function() {
                    var title = $(this).find('>title').text();
                    var description = $(this).find('>description').text();
                    var mugl = applyXMLOverrides($(this).find('mugl'),
                                                 [ $globalMuglOverrides,
                                                   $tabMuglOverrides ]);
                    var dashboardGraphDiv = $('<div/>').dashboard_graph({
                        title       : title,
                        description : description,
                        error       : function (e) { throw e; },
                        warning     : function (e) { console.log(e); },
                        width       : 560,
                        height      : 104,
                        muglString  : mugl
                    }).appendTo($tabContainer);

                    if (firstDashboardGraphDiv === undefined) {
                        firstDashboardGraphDiv = dashboardGraphDiv;
                    }

                    if (++N >= 3) { return false; } else { return true; }
                });

                //
                // add a timeline
                //
                $timelineMugl = applyXMLOverrides($timelineMugl, 
                                                  [ $globalMuglOverrides,
                                                    $tabMuglOverrides,
                                                    $timelineMuglOverrides ]);
                $tabContainer.append($('<div/>').dashboard_timeline({
                        error       : function (e) { throw e; },
                        warning     : function (e) { console.log(e); },
                        width       : 560,
                        height      : 20,
                        muglString  : $timelineMugl
                }));

                firstDashboardGraphDiv.dashboard_graph('multigraphDone', function (multigraph) {
                    var axis = multigraph.graphs().at(0).axes().at(0);
                    var sliderActive = false;
                    var yearFormatter = new window.multigraph.core.DatetimeFormatter("%Y");
                    var timesliderDiv = undefined;
                    axis.addListener('dataRangeSet', function (e) {
                        if (! sliderActive) {
                            var minYear = parseInt(yearFormatter.format(e.min), 10);
                            var maxYear = parseInt(yearFormatter.format(e.max), 10);
                            if (timesliderDiv !== undefined) {
                                timesliderDiv.dashboard_timeslider('setRange', minYear, maxYear);
                            }
                        }
                    });
                    //
                    // add a time slider
                    //
                    var timeSliderMin         = parseInt($timelineMugl.find("horizontalaxis pan").attr('min'), 10);
                    var timeSliderMax         = parseInt($timelineMugl.find("horizontalaxis pan").attr('max'), 10);
                    var timeSliderSelectedMin = parseInt($timelineMugl.find("horizontalaxis").attr('min'), 10);
                    var timeSliderSelectedMax = parseInt($timelineMugl.find("horizontalaxis").attr('max'), 10);

                    timesliderDiv = $('<div/>').dashboard_timeslider({
                        min         : timeSliderMin,
                        max         : timeSliderMax,
                        selectedMin : timeSliderSelectedMin,
                        selectedMax : timeSliderSelectedMax,
                        setRange    : function(min, max) {
                            sliderActive = true;
                            // Force this graph's horiz axis to the given min/max
                            axis.setDataRange(window.multigraph.core.DatetimeValue.parse(''+min),
                                              window.multigraph.core.DatetimeValue.parse(''+max));
                            // Redraw this graph.  We only need to call this one graph's redraw() method
                            // here, because the other ones will be forced to redraw by the axis binding
                            multigraph.redraw();
                            sliderActive = false;
                        }
                    }).appendTo($tabContainer);
                });
                
            };
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
