(function ($) {
    "use strict";

    var expandableDashboardGraphTpl =
            (
                ''
                    +  '<div class="expandable-dashboard-graph-container">'
                    +    '<div class="expandable-dashboard-graph">'
                    +      '<span class="expandable-dashboard-graph-drag-handle"></span>'
                    +      '<span class="expandable-dashboard-graph-openclose-button"></span>'
                    +      '<span class="expandable-dashboard-graph-title-stats">'
                    +        '<span class="expandable-dashboard-graph-title">{{{title}}}</span>'
                    +        '<span class="expandable-dashboard-graph-stats">{{{stats}}}</span>'
                    +      '</span>'
                    +      '<span class="expandable-dashboard-graph-link"><a href="#">Learn more &gt;&gt;</a></span>'
                    +      '<span class="expandable-dashboard-graph-multigraph"></span>'
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
                var data = $(this).data('expandable_dashboard_graph'),
                    that = this;
                $(this).find(".expandable-dashboard-graph-openclose-button").button(
                    "option",
                    "icons", {
                        primary : "ui-icon-minusthick"
                    }
                );

                if (animationspeed === undefined) {
                    animationspeed = 300;
                }

                if (animationspeed <= 0) {
                    $(this).find('div.expandable-dashboard-graph') .
                        removeClass('expandable-dashboard-graph-collapsed') .
                        addClass('expandable-dashboard-graph-expanded');
                } else {
                    $(this).find('div.expandable-dashboard-graph').animate({
                        height : "100px"
                    }, animationspeed, function () {
                        $(that).find('div.expandable-dashboard-graph') .
                            removeClass('expandable-dashboard-graph-collapsed') .
                            addClass('expandable-dashboard-graph-expanded');
                    });
                }

                data.expanded = true;
            });
        },
        
        collapse : function(animationspeed) {
            return this.each(function() {
                var data = $(this).data('expandable_dashboard_graph'),
                    that = this;
                $(this).find('.expandable-dashboard-graph-openclose-button').button(
                    "option",
                    "icons", {
                        primary : "ui-icon-plusthick"
                    }
                );

                if (animationspeed === undefined) {
                    animationspeed = 300;
                }

                $(this).find('div.expandable-dashboard-graph') .
                    removeClass('expandable-dashboard-graph-expanded') .
                    addClass('expandable-dashboard-graph-collapsed');
                if (animationspeed >= 0) {
                    $(this).find('div.expandable-dashboard-graph').css('height', '100px');
                    $(this).find('div.expandable-dashboard-graph').animate({
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
                        'title' : settings.title,
                        'stats' : statsarray.join("")
                    }));

                    $(this).find('.expandable-dashboard-graph-stat-value').css({
                        color : settings.stats.color
                    });

                    $this.data('expandable_dashboard_graph', {
                        expanded : settings.initiallyExpanded,
                        multigraph : window.multigraph.core.Multigraph.createGraph({
                            'div'  : $(this).find('.expandable-dashboard-graph-multigraph')[0],
                            'mugl' : settings.mugl
                        })
                    });
                    $(this).find('.expandable-dashboard-graph-openclose-button').button ({
                        icons : {
                            primary : "ui-icon-plusthick"
                        },
                        text: false
                    });
                    $(this).find('.expandable-dashboard-graph-drag-handle').button ({
                        icons : {
                            primary : "ui-icon-arrow-4"
                        },
                        text: false
                    }).click(function (event) {
                        event.stopPropagation();
                    });
                    $(this).find('.expandable-dashboard-graph-openclose-button').bind(
                        'click.expandable_dashboard_graph', function (event) {
                            event.stopPropagation();
                            $this.expandable_dashboard_graph('toggle');
                        }
                    );
                    $(this).find('div.expandable-dashboard-graph').bind(
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
