(function ($) {
    "use strict";

    var dashboardTabTpl = (
        ''
            + '<div class="dashboard-tab">'
            + '</div>'
    );

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard_tab'),
                    settings = $.extend({
                    }, options);
                if ( ! data ) {
                    $this.html(Mustache.to_html(dashboardTabTpl, {
                    }));
                    var $tabDiv = $this.find(".dashboard-tab");

                    var firstDashboardGraphDiv = undefined;

                    //
                    // add 3 graphs
                    //
                    var N = 0;
                    $.each(settings.graphs, function () {
                        var graph = this;
                        var dashboardGraphDiv = $('<div/>').dashboard_graph({
                            title       : graph.title,
                            description : graph.description,
                            error       : function (e) { throw e; },
                            warning     : function (e) { console.log(e); },
                            width       : 560,
                            height      : 104,
                            muglString  : graph.mugl
                        }).appendTo($tabDiv);
                        if (firstDashboardGraphDiv === undefined) {
                            firstDashboardGraphDiv = dashboardGraphDiv;
                        }
                        if (++N >= 3) { return false; } else { return true; }
                    });

                    //
                    // add a timeline
                    //
                    $tabDiv.append($('<div/>').dashboard_timeline({
                        error       : function (e) { throw e; },
                        warning     : function (e) { console.log(e); },
                        width       : 560,
                        height      : 20,
                        muglString  : settings.timelineMugl
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
                            }
                        }).appendTo($tabDiv);
                    });

                    $this.data('dashboard_tab', {
                        'foo' : 'bar'
                    });
                }
                return this;
            });
        }

    };

    $.fn.dashboard_tab = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_tab' );
            return null;
        }    
    };
    
}(jQuery));
