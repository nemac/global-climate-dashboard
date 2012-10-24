(function ($) {
    "use strict";

    var dashboardTpl =
            (
                ''
                + '<div class="dashboard">'
                +   '<h2>{{{title}}}</h2>'
                +   '<div class="dashboard-graphs"></div>'
                + '</div>'
            );

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard'),
                    settings = $.extend({
                        config : undefined,
                        title : 'Dashboard'
                    }, options);
                if ( ! data ) {

                    $this.html(Mustache.to_html(dashboardTpl, {
                        title : settings.title
                    }));

                    $this.data('dashboard', {
                        //
                    });

                    $.ajax({url      : settings.config,
                            dataType : 'text',
                            success  : function (data) {
                                var configxml = window.multigraph.parser.jquery.stringToJQueryXMLObj(data);
                                configxml.find("graph").each(function() {
                                    var id = $(this).attr('id');
                                    var initiallyExpanded = ( $(this).attr('expanded') === "true" );
                                    var mugl = $(this).find('mugl').attr('url');
                                    var title = $(this).find('>title').text();
                                    var stats = {
                                        color : '#ffffff',
                                        stat  : []
                                    };
                                    var statscolor = $(this).find('stats').attr('color');
                                    if (statscolor !== undefined) {
                                        stats.color = statscolor;
                                    }
                                    $(this).find('stats stat').each(function () {
                                        var title = $(this).find('title').text();
                                        var value = $(this).find('value').text();
                                        stats.stat.push( { title : title, value : value } );
                                    });
                                    $('<div>', {
                                        class : 'EDG ' + (initiallyExpanded ? 'initiallyExpanded' : '')
                                    }).appendTo($this.find('div.dashboard-graphs')).expandable_dashboard_graph({
                                        title             : title,
                                        mugl              : mugl,
                                        initiallyExpanded : false,
                                        stats             : stats
                                    });
                                });
                                $('div.EDG.initiallyExpanded').each(function () {
                                    var that = this;
                                    $(this).expandable_dashboard_graph('multigraph').done(function(multigraph) {
                                        $(that).expandable_dashboard_graph('expand');
                                    });
                                });

                            }});
                }
                return this;
            });
        }
    };

    $.fn.dashboard = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard' );
            return null;
        }    
    };
    
}(jQuery));
