(function ($) {
    "use strict";

    var dashboardGraphTpl =
            (
                ''
                    +  '<div class="dashboard-graph">'
                    +    '<div class="dashboard-graph-multigraph-wrapper"><div class="dashboard-graph-multigraph"></div></div>'
                    +  '</div>'
            );

    var methods = {
        multigraph : function() {
            return $(this).data('dashboard_graph').multigraph;
        },

        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard_graph'),
                    settings = $.extend({
                    }, options);
                if ( ! data ) {

                    $this.html(Mustache.to_html(dashboardGraphTpl, {
                        //'title' : settings.title
                    }));


                    $this.find('.dashboard-graph-multigraph').multigraph({
                        mugl : settings.mugl
                    });


                }

                return this;
            });
        }
    };

    $.fn.dashboard_graph = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_graph' );
            return null;
        }    
    };
    
}(jQuery));
