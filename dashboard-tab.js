(function ($) {
    "use strict";

    var dashboardTabTpl = (
        ''
            + '<div class="dashboard-tab">'
            +   '<div class="dashboard-tab-graphslots">'
            +   '</div>'
            +   '<div class="dashboard-tab-timeregion">'
            +     '<div class="dashboard-tab-messagearea">'
            +     '</div>'
            +   '</div>'
            +   '<div class="dashboard-tab-graphbuttons">'
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
                    data                    = $this.data('dashboard_tab'),
                    $firstDashboardGraphDiv = undefined,
                    graphButtonList         = [],
                    graphSlotList           = [],
                    graphList               = [],
                    $graphSlotsDiv,
                    $timeRegionDiv,
                    $graphButtonsDiv,
                    n,
                    settings = $.extend({
                        numSlots : 3
                    }, options);

                function displayGraph(i) {
                    // Display the i-th graph in this tab's first slot, moving any other graphs
                    // down one slot each, with the last graph being removed from any slot entirely,
                    // and updating the states of all the graph buttons to show the currently
                    // displayed graphs.

                    var j, prevGraphIndex, currentGraphIndex;

                    //
                    // If this graph is already in a slot, do nothing
                    //
                    for (j=0; j<settings.numSlots; ++j) {
                        if (graphSlotList[j].data('dashboard-graph-index') === i) {
                            return;
                        }
                    }

                    //
                    // get the index of the graph that is going to become undisplayed,
                    // so that we can alter the state of its button below
                    //
                    var removedGraphIndex = undefined;
                    var lastSlot = graphSlotList[settings.numSlots-1];
                    if ( (lastSlot !== undefined) &&
                         (lastSlot.data('dashboard-graph-index') !== undefined) ) {
                        removedGraphIndex = lastSlot.data('dashboard-graph-index');
                    }

                    //
                    // For each slot except the first, move the graph above it down into it.
                    // This results in the graph that was in the last slot no longer being displayed.
                    //
                    for (j=settings.numSlots-1; j>0; --j) {
                        prevGraphIndex    = graphSlotList[j-1].data('dashboard-graph-index');
                        if (prevGraphIndex !== undefined) {
                            graphSlotList[j].empty().append(graphList[prevGraphIndex]);
                            graphSlotList[j].data('dashboard-graph-index', prevGraphIndex);
                        }
                    }

                    //
                    // Put the given graph into the first slot
                    //
                    graphSlotList[0].empty().append(graphList[i]);
                    graphSlotList[0].data('dashboard-graph-index', i);

                    //
                    // update button states
                    //
                    if (removedGraphIndex !== undefined) {
                        graphButtonList[removedGraphIndex].removeClass("dashboard-button-selected");
                    }
                    graphButtonList[i].addClass("dashboard-button-selected");

                }

                if ( ! data ) {
                    $this.html(Mustache.to_html(dashboardTabTpl, {
                    }));

                    $graphSlotsDiv = $this.find(".dashboard-tab-graphslots");
                    $timeRegionDiv = $this.find(".dashboard-tab-timeregion");
                    $graphButtonsDiv = $this.find(".dashboard-tab-graphbuttons");


                    //
                    // add the requested number of graph slots
                    //
                    for (n=0; n<settings.numSlots; ++n) {
                        graphSlotList.push($('<div class="dashboard-tab-graphslot"/>').appendTo($graphSlotsDiv));
                    }

                    //
                    // create the graphs and graph buttons
                    //
                    $.each(settings.graphs, function (i) {
                        var graph = this;

                        var $graphDiv = $('<div/>').dashboard_graph({
                            title       : graph.title,
                            description : graph.description,
                            legendTitle : graph.legendTitle,
                            legendText  : graph.legendText,
                            legend      : graph.legend,
                            error       : function (e) { throw e; },
                            warning     : function (e) { console.log(e); },
                            width       : 560,
                            height      : 104,
                            muglString  : graph.mugl,
                            mouseOver   : function () {
                                $this.find('.dashboard-tab-messagearea').html("Click and drag any graph to change the timeline.");
                            },
                            mouseOut    : function () {
                                $this.find('.dashboard-tab-messagearea').empty();
                            }
                        });
                        graphList.push($graphDiv);
                        if ($firstDashboardGraphDiv === undefined) {
                            $firstDashboardGraphDiv = $graphDiv;
                        }
                        graphButtonList.push(
                            $('<div class="dashboard-graph-button"/>')
                                .button({
                                    label : graph.shortTitle
                                })
                                //.data('dashboard-button-state', 'unpressed') // don't need this??
                                .click(function() {
                                    displayGraph(i);
                                })
                                .appendTo($graphButtonsDiv)
                        );
                    });

                    //
                    // fill the available graph slots with the first graphs from the list
                    //
                    for (n=settings.numSlots-1; n>=0; --n) {
                        displayGraph(n);
                    }


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
                            $this.find('.dashboard-tab-messagearea').html("Click and drag any graph to change the timeline.");
                        },
                        mouseOut    : function () {
                            $this.find('.dashboard-tab-messagearea').empty();
                        }
                    }));
                    $firstDashboardGraphDiv.dashboard_graph('multigraphDone', function (multigraph) {
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
