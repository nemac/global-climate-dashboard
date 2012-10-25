(function ($) {
    "use strict";

    var dashboardTpl =
            (
                ''
                    + '<div class="dashboard">'
                    +   '<div class="dashboard-header">'
                    +     '<div class="dashboard-title">'
                    +       '<h2>{{{title}}}</h2>'
                    +     '</div>'
                    +     '<div class="dashboard-tab-buttons">'
                    +     '</div>'
                    +   '</div>'
                    +   '<div class="dashboard-tabs"></div>'
                    + '</div>'
            ),

        tabTpl =
            (
                ""
                    + '<div id="{{id}}" class="dashboard-tab" style="display: none"></div>'
            ),

        tabButtonTpl =
            (
                ""
                    + '<input type="radio" name="tab" id="{{id}}">'
                    +   '<label for="{{id}}">{{{title}}}</label>'
                    + '</input>'
            );

    var graphXmlToDashboardGraphOptions = function(graphXml) {
        // no longer used: $(graphXml).attr('id');
        return {
            initiallyExpanded : ( $(graphXml).attr('expanded') === "true" ),
            title             : $(graphXml).find('>title').text(),
            mugl              : $(graphXml).find('mugl').attr('url'),
            stats : {
                color : $(graphXml).find('stats').attr('color') || '#ffffff',
                stat  : $(graphXml).find('stats stat').map(function () {
                    return {
                        title : $(this).find('title').text(),
                        value : $(this).find('value').text()
                    };
                }).get()
            },
            legend : {
                title  : $(graphXml).find('legendtitle').text(),
                text   : $(graphXml).find('legendtext').text(),
                item   : $(graphXml).find('legend item').map(function () {
                    return {
                        img_src : $(this).find('img').attr('src'),
                        text    : $(this).find('text').text()
                    };
                }).get()
            }
        };
    };

    var insertGraphs = function($xml, $graphContainer) {
        if ($xml.find("graph").length > 1) {
            $xml.find("graph").each(function() {
                var options = graphXmlToDashboardGraphOptions(this);
                var classes = 'EDG ' + (options.initiallyExpanded ? 'initiallyExpanded' : '');
                options.initiallyExpanded = false;
                var div = $('<div>', {
                    'class' : classes
                }).appendTo($graphContainer).expandable_dashboard_graph(options);
            });
            $('div.EDG.initiallyExpanded').each(function () {
                var that = this;
                $(this).expandable_dashboard_graph('multigraph').done(function(multigraph) {
                    $(that).expandable_dashboard_graph('expand');
                });
            });
            $graphContainer.sortable({
                axis : 'y',
                handle : $graphContainer.find('.expandable-dashboard-graph-drag-handle')
            });
        } else {
            $xml.find("graph").each(function() {
                var options = graphXmlToDashboardGraphOptions(this);
                $('<div>').appendTo($graphContainer).single_dashboard_graph(options);
            });
        }
    };

    var selectTab = function(tab_num) {
        $('.dashboard-tab-buttons input').button({
            icons : {
                primary : "ui-icon-triangle-1-e"
            }
        });
        $('.dashboard-tabs .dashboard-tab').css('display', 'none');
        $('#dashboard-tab-button-' + tab_num).attr('checked','checked').button("refresh");
        $('#dashboard-tab-button-' + tab_num).button({
            icons : {
                primary : "ui-icon-triangle-1-s"
            }
        });
        $('#dashboard-tab-' + tab_num).css('display', 'block');
    };


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

                    $this.append(Mustache.to_html(dashboardTpl, {
                        title : settings.title
                    }));

                    $this.data('dashboard', {
                        //
                    });

                    $.ajax({url      : settings.config,
                            dataType : 'text',
                            success  : function (data) {
                                var $configxml = window.multigraph.parser.jquery.stringToJQueryXMLObj(data);
                                var tab_num = 0;
                                var selected_tab_num = 1;
                                $configxml.find(">tab").each(function() {
                                    tab_num += 1;
                                    var title = $(this).find('>title').text();
                                    if ($(this).attr('selected') === "true") {
                                        selected_tab_num = tab_num;
                                    }

                                    var $tab = $(Mustache.to_html(tabTpl, {
                                        id : 'dashboard-tab-' + tab_num
                                    })).appendTo($('.dashboard-tabs'));

                                    insertGraphs($(this), $tab);

                                    $(Mustache.to_html(tabButtonTpl, {
                                        id : 'dashboard-tab-button-' + tab_num,
                                        title : title
                                    })).appendTo('.dashboard-tab-buttons').data('tab_num', tab_num);

                                });


                                $('.dashboard-tab-buttons input').button({
                                    icons : {
                                        primary : "ui-icon-triangle-1-e"
                                    }
                                }).click(function (event) {
                                    selectTab($(this).data('tab_num'));
                                });

                                selectTab(selected_tab_num);

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
