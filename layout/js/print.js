define(["./js/map.js", "dojo/on", "esri/map", "esri/toolbars/draw",
    "esri/tasks/PrintTask", "esri/tasks/PrintParameters", "esri/tasks/PrintTemplate",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/LayerDrawingOptions",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol", "esri/graphic", "esri/InfoTemplate",
    "esri/renderers/ClassBreaksRenderer", "esri/config",
    "dojo/_base/array", "esri/Color", "dojo/parser",
    "dojo/query", "dojo/dom-construct",
    "dijit/form/Button",
    "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
], function(myMap, on, Map, Extent,
    SpatialReference, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, Draw,
    PrintTask, PrintTemplate, PrintParameters,
    ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,
    LayerDrawingOptions, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
    Graphic, InfoTemplate, ClassBreaksRenderer, esriConfig, arrayUtils, Color, parser,
    query, domConstruct, Button
) {
    //parser.parse();

    //esriConfig.defaults.io.proxyUrl = "/proxy";

    var template = new PrintTemplate();
    template.format = "jpg";
    template.layout = "A4 Landscape";
    template.layoutOptions = {
        "titleText": "点位示意图",
        "scalebarUnit": "Kilometers",
        "copyrightText": "湖北省地图院",
        "showAttribution": true,
        "legendLayers": []
    }

    template.preserveScale = false;
    //template.exportOptions = { dpi: 300 };
    template.outScale = 24000;

    var params = new PrintParameters();
    params.map = myMap;
    params.template = template;

    var printTask = new esri.tasks.PrintTask("http://localhost:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task", {
        mode: "async"
    });

    // var printTask = new esri.tasks.PrintTask("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task", {
    //     mode: "async"
    // });

    var basemap = myMap.getLayer("天地图底图");
    if ((myMap.getScale() - basemap.maxScale) < 1) {
        template.outScale = basemap.maxScale + 1;
        template.preserveScale = true;
    }

    // var printbutton = new Button({
    //     label: '打印',
    //     onClick: function() {
    //         printTask.execute(params, printResult);
    //     }
    // }, document.getElementById("printButton"));

    on(document.getElementById("print"), "click", printStart);

    function printResult(result) {
        window.open(result.url, "_blank");
    }

    function printError(error) {
        alert(error);
    }

    function printStart() {
        printTask.execute(params, printResult, printError);
    }
});