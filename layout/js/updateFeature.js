define([
    "./js/map.js",
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/dijit/AttributeInspector",

    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color",
    "esri/renderers/UniqueValueRenderer",

    "esri/config",

    "esri/tasks/query",
    "dojo/dom-construct",
    "dijit/form/Button",

    "dojo/domReady!"
], function(
    myMap, fcpLayer, AttributeInspector,
    SimpleLineSymbol, SimpleMarkerSymbol, Color, UniqueValueRenderer,
    esriConfig,
    Query, domConstruct, Button
) {
    // refer to "Using the Proxy Page" for more information:  https://developers.arcgis.com/javascript/3/jshelp/ags_proxy.html
    //esriConfig.defaults.io.proxyUrl = "/proxy/";

    var updateFeature;
    myMap.on("layers-add-result", initSelectToolbar);


    // var selectionSymbol = new SimpleMarkerSymbol(
    //     SimpleMarkerSymbol.STYLE_CIRCLE, 6,
    //     new SimpleLineSymbol(
    //         "solid",
    //         new Color([255, 0, 0, 0.5]),
    //         4
    //     ),
    //     new Color("#ED3939")
    // );

    // var defaultSymbol = new SimpleMarkerSymbol(
    //     SimpleMarkerSymbol.STYLE_CIRCLE, 7,
    //     null,
    //     new Color([255, 255, 255])
    // );
    // fcpLayer.setSelectionSymbol(selectionSymbol);

    // //Symbolize features by W/L record
    // var recordRenderer = new UniqueValueRenderer(defaultSymbol, "Rd_64_Result");
    // recordRenderer.addValue("W", new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 7, null, new Color([93, 240, 79])));
    // recordRenderer.addValue("L", new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 7, null, new Color([240, 146, 79])));
    // fcpLayer.setRenderer(recordRenderer);

    //map.addLayers([teamsFL]);

    function initSelectToolbar(evt) {
        var fcpLayer = evt.layers[0].layer;
        var selectQuery = new Query();

        myMap.on("click", function(evt) {
            selectQuery.geometry = evt.mapPoint;
            selectQuery.distance = 50;
            selectQuery.units = "miles"
            selectQuery.returnGeometry = true;
            fcpLayer.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW, function(features) {
                if (features.length > 0) {
                    //store the current feature
                    updateFeature = features[0];
                    myMap.infoWindow.setTitle(features[0].getLayer().name);
                    myMap.infoWindow.show(evt.screenPoint, myMap.getInfoWindowAnchor(evt.screenPoint));
                } else {
                    myMap.infoWindow.hide();
                }
            });
        });

        myMap.infoWindow.on("hide", function() {
            fcpLayer.clearSelection();
        });

        var layerInfos = [{
            'featureLayer': fcpLayer,
            'showAttachments': false,
            'isEditable': true,
            'fieldInfos': [
                { 'fieldName': 'PointID', 'isEditable': false, 'label': 'School:' },
                { 'fieldName': 'PointType', 'isEditable': true, 'tooltip': 'Win percentage', 'label': 'Win percentage:' },
                { 'fieldName': 'LON', 'isEditable': false, 'label': 'Rd 1 Venue:' },
                { 'fieldName': 'LAT', 'isEditable': true, 'tooltip': 'First round result (W/L)', 'label': 'Rd 1 Result:' },
                { 'fieldName': 'PAC', 'isEditable': true, 'tooltip': 'First round margin of victory/loss', 'label': 'Rd 1 Margin:' }
            ]
        }];

        //Initialize Attribute Inspector
        var attInspector = new AttributeInspector({
            layerInfos: layerInfos
        }, domConstruct.create("div"));

        //add a save button next to the delete button
        var saveButton = new Button({ label: "Save", "class": "saveButton" }, domConstruct.create("div"));
        domConstruct.place(saveButton.domNode, attInspector.deleteBtn.domNode, "after");

        saveButton.on("click", function() {
            updateFeature.getLayer().applyEdits(null, [updateFeature], null);
        });

        attInspector.on("attribute-change", function(evt) {
            //store the updates to apply when the save button is clicked
            updateFeature.attributes[evt.fieldName] = evt.fieldValue;
        });

        attInspector.on("next", function(evt) {
            updateFeature = evt.feature;
            console.log("Next " + updateFeature.attributes.OBJECTID);
        });

        attInspector.on("delete", function(evt) {
            evt.feature.getLayer().applyEdits(null, null, [evt.feature]);
            myMap.infoWindow.hide();
        });

        myMap.infoWindow.setContent(attInspector.domNode);
        myMap.infoWindow.resize(350, 240);
    }
});