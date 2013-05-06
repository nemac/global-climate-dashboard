(function ($) {
    "use strict";

    var dashboardTabTpl = (
        ''
            + '<div class="dashboard-singleslot-tab">'
            +   '<div class="dashboard-tab-graphslots">'
            +     '<div class="dashboard-tab-graphslot"/>'
            +   '</div>'
            +   '<div class="dashboard-tab-timeregion">'
            +     '<div class="dashboard-tab-messagearea">'
            +     '</div>'
            +   '</div>'
            + '</div>'
    );

    var graphSlotTpl = (
        ''
            +   '<div class="dashboard-tab-graphslot"/>'
    );

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this                   = $(this),
                    data                    = $this.data('dashboard_singleslot_tab'),
                    $firstDashboardGraphDiv = undefined,
                    $graphSlotDiv,
                    $timeRegionDiv,
                    n,
                    settings = $.extend({
                    }, options);

                if ( ! data ) {
                    $this.html(Mustache.to_html(dashboardTabTpl, {
                    }));

                    $graphSlotDiv = $this.find(".dashboard-tab-graphslot");
                    $timeRegionDiv = $this.find(".dashboard-tab-timeregion");

                    //
                    // create the graph
                    //
                    var $graphDiv = $('<div/>').dashboard_graph({
                        title       : settings.graph.title,
                        description : settings.graph.description,
                        legendTitle : settings.graph.legendTitle,
                        legendText  : settings.graph.legendText,
                        legend      : settings.graph.legend,
                        error       : function (e) { throw e; },
                        warning     : function (e) { console.log(e); },
                        width       : 560,
                        height      : 450,
                        muglString  : settings.graph.mugl,
                        mouseOver   : function () {
                            $this.find('.dashboard-tab-messagearea').html("Click and drag the graph to change the timeline.");
                        },
                        mouseOut    : function () {
                            $this.find('.dashboard-tab-messagearea').empty();
                        }
                    });
                    $graphSlotDiv.append($graphDiv);

                    //
                    // add a timeline
                    //
                    $timeRegionDiv.append($('<div/>').dashboard_timeline({
                        error       : function (e) { throw e; },
                        warning     : function (e) { console.log(e); },
                        width       : 560,
                        height      : 20,
                        muglString  : settings.timelineMugl,
                        mouseOver   : function () {
                            $this.find('.dashboard-tab-messagearea').html("Click and drag the graph to change the timeline.");
                        },
                        mouseOut    : function () {
                            $this.find('.dashboard-tab-messagearea').empty();
                        }
                    }));
                    $graphDiv.dashboard_graph('multigraphDone', function (multigraph) {
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
                        timesliderDiv = $('<div/>').dashboard_timeslider({
                            min         : settings.timeSliderMin,
                            max         : settings.timeSliderMax,
                            selectedMin : settings.timeSliderSelectedMin,
                            selectedMax : settings.timeSliderSelectedMax,
                            setRange    : function(min, max) {
                                sliderActive = true;
                                // Force this graph's horiz axis to the given min/max
                                axis.setDataRange(window.multigraph.core.DatetimeValue.parse(''+min),
                                                  window.multigraph.core.DatetimeValue.parse(''+max));
                                // Redraw this graph.  We only need to call this one graph's redraw() method
                                // here, because the other ones will be forced to redraw by the axis binding
                                multigraph.redraw();
                                sliderActive = false;
                            },
                            mouseOver   : function () {
                                $this.find('.dashboard-tab-messagearea').html("Drag the ends of the amber region to change the graph time scale.");
                            },
                            mouseOut    : function () {
                                $this.find('.dashboard-tab-messagearea').empty();
                            }
                        }).appendTo($timeRegionDiv);
                    });

                    $this.data('dashboard_singleslot_tab', {
                        'foo' : 'bar'
                    });
                }
                return this;
            });
        }

    };

    $.fn.dashboard_singleslot_tab = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_singleslot_tab' );
            return null;
        }    
    };
    
}(jQuery));
