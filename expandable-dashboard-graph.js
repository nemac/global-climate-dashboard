(function ($) {
    "use strict";

    var expandableDashboardGraphTpl =
            (
                ''
                    +  '<div id="{{id}}" class="expandable-dashboard-graph-container">'
                    +    '<div class="expandable-dashboard-graph">'
                    +      '<span class="expandable-dashboard-graph-openclose-button"></span>'
                    +      '<span class="expandable-dashboard-graph-title">{{{title}}}</span>'
                    +      '<span class="expandable-dashboard-graph-stats">{{{stats}}}</span>'
                    +      '<span class="expandable-dashboard-graph-link"><a href="#">Learn more &gt;&gt;</a></span>'
                    +      '<span class="expandable-dashboard-graph-multigraph"/>'
                    +    '</div>'
                    +  '</div>'
            ),
        statTpl =
            (
                ''
                    + '<span class="expandable-dashboard-graph-stat-item"><span class="expandable-dashboard-graph-stat-title">{{{title}}}:</span>'
                    + '<span class="expandable-dashboard-graph-stat-value">{{{value}}}</span></span>'
            );

    var methods = {
        multigraph : function() {
            return $(this).data('expandable_dashboard_graph').multigraph;
        },

        expanded : function() {
            return $(this).data('expandable_dashboard_graph').expanded;
        },

        expand : function(animationspeed) {
            return this.each(function() {
                var data = $(this).data('expandable_dashboard_graph');
                $("#" + data.id + " .expandable-dashboard-graph-openclose-button").button(
                    "option",
                    "icons", {
                        primary : "ui-icon-minusthick"
                    }
                );

                if (animationspeed === undefined) {
                    animationspeed = 300;
                }

                if (animationspeed <= 0) {
                    $('#' + data.id + ' div.expandable-dashboard-graph') .
                        removeClass('expandable-dashboard-graph-collapsed') .
                        addClass('expandable-dashboard-graph-expanded');
                } else {
                    $('#' + data.id + ' div.expandable-dashboard-graph').animate({
                        height : "100px"
                    }, animationspeed, function () {
                        $('#' + data.id + ' div.expandable-dashboard-graph') .
                            removeClass('expandable-dashboard-graph-collapsed') .
                            addClass('expandable-dashboard-graph-expanded');
                    });
                }

                data.expanded = true;
            });
        },
          
        collapse : function(animationspeed) {
            return this.each(function() {
                var data = $(this).data('expandable_dashboard_graph');
                $('#' + data.id + ' .expandable-dashboard-graph-openclose-button').button(
                    "option",
                    "icons", {
                        primary : "ui-icon-plusthick"
                    }
                );

                if (animationspeed === undefined) {
                    animationspeed = 300;
                }

                $('#' + data.id + ' div.expandable-dashboard-graph') .
                    removeClass('expandable-dashboard-graph-expanded') .
                    addClass('expandable-dashboard-graph-collapsed');
                if (animationspeed >= 0) {
                    $('#' + data.id + ' div.expandable-dashboard-graph').css('height', '100px');
                    $('#' + data.id + ' div.expandable-dashboard-graph').animate({
                        height : "30px"
                    }, animationspeed);
                }

                data.expanded = false;
            });
        },

        toggle : function() {
            return this.each(function() {

                var data = $(this).data('expandable_dashboard_graph');
                if (data.expanded) {
                    $(this).expandable_dashboard_graph('collapse', 300);
                } else {
                    $(this).expandable_dashboard_graph('expand', 300);
                }
            });
        },

        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('expandable_dashboard_graph'),
                    settings = $.extend({
                        initiallyExpanded : false,
                        stats             : []
                    }, options),
                    statsarray = [];
                if ( ! data ) {

                    $.each(settings.stats.stat, function() {
                        statsarray.push(Mustache.to_html(statTpl, {
                            title : this.title,
                            value : this.value
                        }));
                    });

                    $this.html(Mustache.to_html(expandableDashboardGraphTpl, {
                        'id'    : settings.id,
                        'title' : settings.title,
                        'stats' : statsarray.join("")
                    }));

                    $('#' + settings.id + ' .expandable-dashboard-graph-stat-value').css({
                        color : settings.stats.color
                    });

                    $this.data('expandable_dashboard_graph', {
                        expanded : settings.initiallyExpanded,
                        id : settings.id,
                        multigraph : window.multigraph.core.Multigraph.createGraph({
                            'div'  : $('#' + settings.id + ' .expandable-dashboard-graph-multigraph')[0],
                            'mugl' : settings.mugl
                        })
                    });
                    $("#" + settings.id + " .expandable-dashboard-graph-openclose-button").button ({
                        icons : {
                            primary : "ui-icon-plusthick"
                        },
                        text: false
                    });
                    $("#" + settings.id + ' .expandable-dashboard-graph-openclose-button').bind(
                        'click.expandable_dashboard_graph', function (event) {
                            event.stopPropagation();
                            $this.expandable_dashboard_graph('toggle');
                        }
                    );
                    $('#' + settings.id + ' div.expandable-dashboard-graph').bind(
                        'click.expandable_dashboard_graph', function (event) {
                            if (!$this.data('expandable_dashboard_graph').expanded) {
                                $this.expandable_dashboard_graph('expand');
                            }
                        }
                    );
                    if (settings.initiallyExpanded) {
                        $this.expandable_dashboard_graph('expand', 0);
                    } else {
                        $this.expandable_dashboard_graph('collapse', 0);
                    }
                }

                return this;
            });
        }
    };

    $.fn.expandable_dashboard_graph = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.expandable_dashboard_graph' );
            return null;
        }    
    };
    
}(jQuery));
