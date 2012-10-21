(function ($) {
    "use strict";

    var expandableDashboardGraphTpl = (
        ''
            +  '<div id="{{id}}" class="expandable-dashboard-graph-container">'
            +    '<div class="expandable-dashboard-graph">'
            +      '<span class="expandable-dashboard-graph-openclose-button"></span>'
            +      '<span class="expandable-dashboard-graph-title">{{{title}}}</span>'
            +      '<span class="expandable-dashboard-graph-multigraph"/>'
            +    '</div>'
            +  '</div>'
    );
    
    $.append_expandable_dashboard_graph = function(element,id,title,mugl,initiallyExpanded) {
        
        var expanded = initiallyExpanded,
            
            toggle = function() {
                if (expanded) {
                    collapse();
                } else {
                    expand();
                }
            },

            expand = function() {
                $("#" + id + " .expandable-dashboard-graph-openclose-button").button ("option", "icons", { primary : "ui-icon-minusthick" });
                $('#' + id + ' div.expandable-dashboard-graph').css({
                    'height' : '200px',
                    'cursor' : 'default'
                });
                $('#' + id + ' span.expandable-dashboard-graph-multigraph').css("visibility", "visible");
                expanded = true;
            },

            collapse = function() {
                $('#' + id + ' .expandable-dashboard-graph-openclose-button').button ("option", "icons", { primary : "ui-icon-plusthick" });
                $('#' + id + ' div.expandable-dashboard-graph').css({
                    'height' : '50px',
                    'cursor' : 'pointer'
                });
                $('#' + id + ' span.expandable-dashboard-graph-multigraph').css("visibility", "hidden");
                expanded = false;
            };
        
        $(element).append(Mustache.to_html(expandableDashboardGraphTpl, {
            'id'    : id,
            'title' : title
        }));
        
        window.multigraph.core.Multigraph.createGraph({
            'div'  : $('#' + id + ' .expandable-dashboard-graph-multigraph')[0],
            'mugl' : mugl
        });

        $("#" + id + " .expandable-dashboard-graph-openclose-button").button ({
            icons : {
                primary : "ui-icon-plusthick"
            },
            text: false
        });

        $("#" + id).on('click', ".expandable-dashboard-graph-openclose-button", function (event) {
            event.stopPropagation();
            toggle();
        });

        $('#' + id).on('click', ' div.expandable-dashboard-graph', function (event) {
            if (!expanded) {
                expand();
            }
        });

        if (initiallyExpanded) {
            expand();
        } else {
            collapse();
        }

    };

}(jQuery));
