(function ($) {
    "use strict";

    var dashboardTabTpl = (
        ''
            + '<div class="dashboard-tab">'
            +   '<div class="dashboard-tab-graphslots">'
            +   '</div>'
            +   '<div class="dashboard-tab-timeregion">'
            +   '</div>'
            +   '<div class="dashboard-tab-graphbuttons">'
            +   '</div>'
            + '</div>'
    );

    var methods = {
        init : function(options) {
            return this.each(function() {
                function setButtonSelected(button) {
                    $.each(graphButtonList, function() {
                        $(this).removeClass("dashboard-button-selected");
                    });
                    $(button).addClass("dashboard-button-selected");
                }

                var $this = $(this),
                    data = $this.data('dashboard_tab'),
                    settings = $.extend({
                    }, options);
                if ( ! data ) {
                    $this.html(Mustache.to_html(dashboardTabTpl, {
                    }));
                    var $graphSlots = $this.find(".dashboard-tab-graphslots");
                    var $timeRegion = $this.find(".dashboard-tab-timeregion");
                    var $graphButtons = $this.find(".dashboard-tab-graphbuttons");

                    var firstDashboardGraphDiv = undefined;

                    var graphButtonList = [];

                    //
                    // add 3 graphs
                    //
                    var N = 0;
                    $.each(settings.graphs, function () {
                        var graph = this;
                        if (N++ < 3) {
                            var dashboardGraphDiv = $('<div/>').dashboard_graph({
                                title       : graph.title,
                                description : graph.description,
                                error       : function (e) { throw e; },
                                warning     : function (e) { console.log(e); },
                                width       : 560,
                                height      : 104,
                                muglString  : graph.mugl
                            }).appendTo($graphSlots);
                            if (firstDashboardGraphDiv === undefined) {
                                firstDashboardGraphDiv = dashboardGraphDiv;
                            }
                        }
                        graphButtonList.push(
                            $('<div class="dashboard-graph-button"/>')
                                .button({
                                    label : graph.shortTitle
                                })
                                .data('dashboard-button-state', 'unpressed')
                                .click(function() {
                                    console.log(graph.shortTitle + ' button clicked; state is: ' +
                                                $(this).data('dashboard-button-state'));
                                    setButtonSelected(this);
                                })
                                .appendTo($graphButtons)
                        );
                    });

                    //
                    // add a timeline
                    //
                    $timeRegion.append($('<div/>').dashboard_timeline({
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
                        }).appendTo($timeRegion);
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
