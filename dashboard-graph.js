(function ($) {
    "use strict";

//
// NOTE: the html template below includes divs for both a description ("dashboard-graph-description")
// and a legend ("dashboard-graph-legend"), but only one of them is ever displayed.  By default,
// the description is displayed and the legend is not.  If the `legendTitle` property of the options
// object is set when the plugin is invoked, though, the description is hidden and the legend
// is displayed instead.
//

    var dashboardGraphTpl = (
        ''
            + '<div class="dashboard-graph">'
            +   '<div class="dashboard-graph-title">{{{title}}}</div>'
            +   '<div class="dashboard-graph-description">{{{description}}}</div>'
            +   '<div class="dashboard-graph-legend dashboard-displaynone">'
            +     '<div class="dashboard-graph-legend-title">{{{legendTitle}}}</div>'
            +     '<div class="dashboard-graph-legend-content"/>'
            +     '<div class="dashboard-graph-legend-text">{{{legendText}}}</div>'
            +   '</div>'
            +   '<div class="dashboard-graph-link">Learn More &gt;&gt;</div>'
            +   '<div class="dashboard-graph-multigraph-wrapper">'
            +     '<div class="dashboard-graph-multigraph"></div>'
            +   '</div>'
            + '</div>'
    );

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard_graph'),
                    multigraphDiv = undefined,
                    settings = $.extend({
                    }, options);
                if ( ! data ) {
                    $this.html(Mustache.to_html(dashboardGraphTpl, {
                        title       : settings.title,
                        description : settings.description,
                        legendTitle : settings.legendTitle,
                        legendText  : settings.legendText
                    }));
                    if (settings.legendTitle) {
                        $this.find('.dashboard-graph-link').addClass('dashboard-singleslot-graph-link');
                        $this.find('.dashboard-graph-description').addClass('dashboard-displaynone');
                        $this.find('.dashboard-graph-legend').removeClass('dashboard-displaynone');
                        $this.find('.dashboard-graph-legend-content').append(settings.legend);
                    }
                    multigraphDiv = $this.find('.dashboard-graph-multigraph')
                        .multigraph(settings)
                        .hover(settings.mouseOver, settings.mouseOut);
                    $this.data('dashboard_graph', {
                        title             : settings.title,
                        description       : settings.description,
                        multigraphDiv     : multigraphDiv
                    });
                }
                return this;
            });
        },

        multigraphDone : function(callback) {
            $(this).data('dashboard_graph').multigraphDiv.multigraph('done', callback);
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
