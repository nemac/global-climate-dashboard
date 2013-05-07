(function ($) {
    "use strict";

    var timesliderTpl = (
        ''
            + '<div class="dashboard-timeslider-wrapper">'
            +   '<div class="dashboard-timeslider">'
            +     '<div class="label earlier"><img src="{{{assets}}}/left-arrow.png"><span class="text">Earlier</span></div>'
            +     '<div class="label later"><span class="text">Later</span><img src="{{{assets}}}/right-arrow.png"></div>'
            +   '</div>'
            + '</div>'
    );

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('dashboard_timeslider'),
                    settings = $.extend({
                    }, options);
                if ( ! data ) {
                    $this.html(Mustache.to_html(timesliderTpl, {
                        assets : window.dashboard.assets
                    }));
                    $this.find('.dashboard-timeslider').dragslider({
                        animate   : true,   // Works with animation.
                        range     : true,     // Must have a range to drag.
                        rangeDrag : true, // Enable range dragging.
                        min       : settings.min,
                        max       : settings.max,
                        values    : [settings.selectedMin, settings.selectedMax],
                        slide     : function(event, ui) {
                            if (typeof(settings.setRange) === "function") {
                                settings.setRange(ui.values[0], ui.values[1]);
                            }
                        }
                    }).hover(settings.mouseOver, settings.mouseOut);
                    $this.data('dashboard_timeslider', {
                        'foo' : 'bar'
                    });
                }
                return this;
            });
        },

        setRange : function (min, max) {
            $(this).find('.dashboard-timeslider').dragslider('option', 'values', [min,max]);
        }
    };

    $.fn.dashboard_timeslider = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dashboard_timeslider' );
            return null;
        }    
    };
    
}(jQuery));
