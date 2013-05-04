(function ($) {
    "use strict";

    var dashboardTpl =
            (
                ''
                    + '<div class="dashboard">'
                    + '</div>'
            );

    function xmlObjectToString(obj) {
      if (window.ActiveXObject) {
        return obj.xml;
      }
      return (new XMLSerializer()).serializeToString(obj);
    }

    function applyXMLOverrides($target, $overrides) {
        var i;
        if (! $overrides || $overrides.length === 0) {
            return $target;
        }
        if (window.multigraph.utilityFunctions.typeOf($overrides) === "array") {
            for (i=0; i<$overrides.length; ++i) {
                applyXMLOverrides($target, $overrides[i]);
            }
        } else {
            var $attrs = $overrides.find(">attribute");
            $attrs.each(function() {
                var $this = $(this);
                var attrName = $this.attr('name');
                var attrValue = $this.attr('value');
                $target.attr(attrName, attrValue);
            });
            $overrides.find(">element").each(function() {
                var $this = $(this);
                var elementName   = $this.attr('name');
                var elementAction = $this.attr('action');
                var $targetChildList = $target.find(">"+elementName);
                if ($targetChildList.length === 0) {
                    $target.append($("<"+elementName+">"));
                } else if (elementAction === "empty") {
                    $target.find(">"+elementName).empty();
                }
                applyXMLOverrides($target.find(">"+elementName), $this);
            });
            $overrides.find(">elements").each(function() {
                var $e = $(this);
                var elementName = $e.attr('name');
                $target.find(elementName).each(function() {
                    var $descendant = $(this);
                    $e.find(">attribute").each(function() {
                        var $f = $(this);
                        var name = $f.attr('name');
                        var value = $f.attr('value');
                        $descendant.attr(name, value);
                    });
                });
            });
        }
        return $target;
    }

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
                                var $globalMuglOverrides = $configxml.find(">mugloverrides");
                                $configxml.find(">tab").each(function() {
                                    var $tabxml = $(this);
                                    var $tabMuglOverrides = $tabxml.find(">mugloverrides");
                                    if ($tabxml.attr('id') == 'climateChange2') {
                                        var N = 0;
                                        $tabxml.find('graph').each(function() {
                                            var title = $(this).find('>title').text();
                                            var description = $(this).find('>description').text();
                                            var mugl = applyXMLOverrides($(this).find('mugl'),
                                                                         [ $globalMuglOverrides,
                                                                           $tabMuglOverrides ]);
                                            $dashboardDiv.append($('<div/>').dashboard_graph({
                                                title       : title,
                                                description : description,
                                                error       : function (e) { throw e; },
                                                warning     : function (e) { console.log(e); },
                                                width       : 560,
                                                height      : 104,
                                                muglString  : mugl
                                            }));
                                            if (++N >= 1) { return false; } else { return true; }
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
