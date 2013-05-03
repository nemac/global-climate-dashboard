(function ($) {
    "use strict";

    var dashboardTpl =
            (
                ''
                    + '<div class="dashboard">'
                    + '</div>'
            );

    // 
    //   function xmlObjectToString(obj) {
    //     if (window.ActiveXObject) {
    //       return obj.xml;
    //     }
    //     return (new XMLSerializer()).serializeToString(obj);
    //   }
    // 

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

                    var $dashboardDiv = $(Mustache.to_html(dashboardTpl, {
                        title : settings.title
                    })).appendTo($this);

                    $this.data('dashboard', {
                        //
                    });

                    $.ajax({url      : settings.config,
                            dataType : 'text',
                            success  : function (data) {
                                var $configxml = window.multigraph.parser.jquery.stringToJQueryXMLObj(data);
                                $configxml.find(">tab").each(function() {
                                    if ($(this).attr('id') == 'climateChange2') {
                                        var N = 0;
                                        $(this).find('graph').each(function() {
                                            var title = $(this).find('>title').text();
                                            var description = $(this).find('>description').text();
                                            var muglString = ($(this).find('mugl'))[0]
                                            $dashboardDiv.append($('<div/>').dashboard_graph({
                                                title       : title,
                                                description : description,
                                                error       : function (e) { throw e; },
                                                warning     : function (e) { console.log(e); },
                                                width       : 560,
                                                height      : 104,
                                                muglString  : muglString
                                            }));
                                            if (++N >= 3) { return false; } else { return true; }
                                        });
                                    }
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
