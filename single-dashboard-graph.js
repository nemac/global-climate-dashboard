(function ($) {
    "use strict";

    var singleDashboardGraphTpl =
            (
                ''
                    +  '<div class="single-dashboard-graph-container">'
                    +    '<div class="single-dashboard-graph">'
                    +      '<span class="single-dashboard-graph-title">{{{title}}}</span>'
                    +      '<span class="single-dashboard-graph-multigraph"></span>'
                    +      '<div class="single-dashboard-graph-legendbox">'
                    +        '<div class="single-dashboard-graph-legend"></div>'
                    +        '<div class="single-dashboard-graph-legendtitle">{{{legendTitle}}}</div>'
                    +        '<div class="single-dashboard-graph-legendtext">{{{legendText}}}</div>'
                    +        '<span class="single-dashboard-graph-link"><a href="#">Learn more &gt;&gt;</a></span>'
                    +      '</div>'
                    +    '</div>'
                    +  '</div>'
            ),

    legendItemTpl =
            (
                ''
                    +  '<div class="single-dashboard-graph-legend-item">'
                    +    '<img src="{{img_src}}" class="single-dashboard-graph-legend-item-icon"></img>'
                    +    '<span class="single-dashboard-graph-legend-item-text">{{{text}}}</span>'
                    +  '</span>'
            );


    var methods = {
        multigraph : function() {
            return $(this).data('single_dashboard_graph').multigraph;
        },

        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('single_dashboard_graph'),
                    settings = $.extend({
                    }, options);
                if ( ! data ) {

                    console.log(settings.legend.item);

                    $this.html(Mustache.to_html(singleDashboardGraphTpl, {
                        title       : settings.title,
                        legendTitle : settings.legend.title,
                        legendText  : settings.legend.text
                    }));

                    $.each(settings.legend.item, function () {
                        $(Mustache.to_html(legendItemTpl, {
                            img_src     : this.img_src,
                            text        : this.text
                        })).appendTo($this.find('.single-dashboard-graph-legend'));
                    });

                    $this.data('single_dashboard_graph', {
                        multigraph : window.multigraph.core.Multigraph.createGraph({
                            'div'  : $(this).find('.single-dashboard-graph-multigraph')[0],
                            'mugl' : settings.mugl
                        })
                    });
                }

                return this;
            });
        }
    };

    $.fn.single_dashboard_graph = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.single_dashboard_graph' );
            return null;
        }    
    };
    
}(jQuery));
