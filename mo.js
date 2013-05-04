(function($) {

    function xmlObjectToString(obj) {
        if (window.ActiveXObject) {
            return obj.xml;
        }
        var s = new XMLSerializer();
        return s.serializeToString(obj[0]);
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


    $(document).ready(function() {

        $.ajax({url      : 'config/d.xml',
                dataType : 'text',
                success  : function (data) {
                    var $configxml = window.multigraph.parser.jquery.stringToJQueryXMLObj(data);
                    var $globalMuglOverrides = $configxml.find(">mugloverrides");
                    var $tempgraphxml = $configxml.find("graph[id=temperature2] mugl");
                    var $foo = applyXMLOverrides($tempgraphxml, $globalMuglOverrides);
                    console.log(xmlObjectToString($foo));
                }});

    });
})(window.multigraph.jQuery);
