define([
        "./js/map.js", "esri/geometry/Point",
        "dijit/registry", 'dojo/on', "esri/map", "esri/geometry/Extent", "esri/SpatialReference", "esri/InfoTemplate", "esri/layers/ArcGISTiledMapServiceLayer", "esri/graphic", "esri/toolbars/draw",
        "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/Color",
        "esri/tasks/QueryTask", "esri/tasks/query", "dojo/_base/array", "dojo/data/ItemFileReadStore", "dojox/grid/DataGrid",
        "dijit/form/Button", "dojo/domReady!"
    ],
    function(myMap, Point, registry, on, Map, Extent, SpatialReference, InfoTemplate, ArcGISTiledMapServiceLayer, Graphic, Draw,
        PictureMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color,
        QueryTask, Query, array, ItemFileReadStore
    ) {

        var tb = new Draw(myMap);
        tb.on("draw-end", addGraphic);

        registry.forEach(function(d) {
            if (d.declaredClass === "dijit.form.Button") {
                d.on("click", activateTool);
            }
        });

        //Listen for row clicks in the dojo table
        gridWidget.on("RowClick", onTableRowClick);

        //Populate table with headers
        setGridHeader();

        //info template for points returned
        myMap.infoWindow.resize(300, 320);
        // myMap.infoWindow.show();
        // myMap.infoWindow.hide();
        var resultTemplate = new InfoTemplate();
        resultTemplate.setTitle("详细信息：");
        var imgSrc = './tif/${GUIDE_1}.jpg'
        var img = '<br /><img width="255" height="255" src=' + imgSrc + ' />';
        var anchor = '<br /><a target="_blank" href="' + imgSrc + '">查看大图</a>';
        resultTemplate.setContent("点号： ${PointID},<br/>类型： ${PointType},<br/>分辨率： ${ImgResolut}<br />" + img + anchor);

        // resultTemplate.setContent("点号： ${PointID},<br/>类型： ${PointType},<br/>分辨率： ${ImgResolut}");


        var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));
        var pntSym1 = new PictureMarkerSymbol("images/CircleBlue16.png", 16, 16);
        var pntSym2 = new PictureMarkerSymbol("images/CircleBlue24.png", 24, 24);
        var pntSym3 = new PictureMarkerSymbol("images/CircleRed32.png", 32, 32);

        // 初始化查询任务与查询参数   
        var queryTask = new QueryTask("http://localhost:6080/arcgis/rest/services/cpm/MyMapPoint/MapServer/0");
        queryTask.on("complete", showResult);
        var query = new Query();
        query.returnGeometry = true;
        query.outFields = ["OBJECTID", "PointID", "PointType", "ImgResolut", "LON", "LAT", "GUIDE_1"];

        function activateTool() {
            var tool = null;
            if (this.label == "删除选择结果") {
                remove();
            } else {
                switch (this.label) {
                    case "多边形":
                        tool = "POLYGON";
                        break;
                    case "徒手多边形":
                        tool = "FREEHAND_POLYGON";
                        break;
                }
                tb.activate(Draw[tool]);
                myMap.hideZoomSlider();
            }
        }

        function setGridHeader() {
            var layout = [
                { field: 'PointID', name: '点号', width: "100px", headerStyles: "text-align:center;" },
                { field: 'PointType', name: '类型', width: "100px", headerStyles: "text-align:center;" },
                { field: 'ImgResolut', name: '分辨率', width: "100px", headerStyles: "text-align:center;" }
            ];

            gridWidget.setStructure(layout);
        }


        //Draw a dojox table using an array as input
        function drawTable(features) {
            var items = []; //all items to be stored in data store

            //items = dojo.map(features, function(feature) {return feature.attributes});
            items = array.map(features, "return item.attributes");

            //Create data object to be used in store
            var data = {
                identifier: "OBJECTID", //This field needs to have unique values
                label: "OBJECTID", //Name field for display. Not pertinent to a grid but may be used elsewhere.
                items: items
            };
            var store = new ItemFileReadStore({ data: data });

            gridWidget.setStore(store);
            gridWidget.setQuery({ PointID: '*' });
        }

        //Set drawing properties and add polygon to map
        function addGraphic(geometry) {
            var handgraphic = new Graphic(geometry, symbol);
            myMap.graphics.add(handgraphic);

            // 改变信息窗口的大小
            myMap.infoWindow.resize(300, 320);

            // 将用户绘制的几何对象传入查询参数
            query.geometry = handgraphic.geometry;
            queryTask.execute(query);
        }

        function showResult(evt) {
            var resultFeatures = evt.featureSet.features;
            for (var i = 0, il = resultFeatures.length; i < il; i++) {
                var graphic = resultFeatures[i];

                //Assign a symbol sized based on populuation
                setTheSymbol(graphic);

                graphic.setInfoTemplate(resultTemplate);
                myMap.graphics.add(graphic);
            }

            // var totalPopulation = sumPopulation(evt.featureSet);
            // var r = "<i>" + totalPopulation + "</i>";
            // document.getElementById('totalPopulation').innerHTML = r;

            document.getElementById("numberOfPoints").innerHTML = resultFeatures.length;

            drawTable(resultFeatures);

            tb.deactivate();
        }

        //Set the symbol based on population
        function setTheSymbol(graphic) {
            if (graphic.attributes['PointType'] == "加密点") {
                return graphic.setSymbol(pntSym1);
            } else if (graphic.attributes['PointType'] == "采集点") {
                return graphic.setSymbol(pntSym3);
            } else {
                return graphic.setSymbol(pntSym2);
            }
        }

        //calculate the total population using a featureSet
        // function sumPopulation(fset) {
        //     var features = fset.features;
        //     var popTotal = 0;
        //     var intHolder = 0;
        //     for (var x = 0; x < features.length; x++) {
        //         popTotal = popTotal + features[x].attributes['POP2000'];
        //     }
        //     return popTotal;
        // }

        //On row click
        function onTableRowClick(evt) {
            var rowData = gridWidget.getItem(evt.rowIndex);
            var tifName = rowData.GUIDE_1;
            var clickedId = rowData.OBJECTID;
            var lon = rowData.LON;
            var lat = rowData.LAT;
            var graphic;
            for (var i = 0, il = myMap.graphics.graphics.length; i < il; i++) {
                var currentGraphic = myMap.graphics.graphics[i];
                if ((currentGraphic.attributes) && currentGraphic.attributes.OBJECTID == clickedId) {
                    graphic = currentGraphic;
                    break;
                }
            }

            var p = myMap.toScreen(graphic.geometry);
            var iw = myMap.infoWindow;
            iw.setTitle(graphic.getTitle());
            var imgSrc = './tif/' + tifName + '.jpg'
            var img = '<br /><img width="255" height="255" src=' + imgSrc + ' />';
            var anchor = '<br /><a target="_blank" href="' + imgSrc + '">查看大图</a>';
            if (graphic.getContent().indexOf('img') == -1) {
                iw.setContent(graphic.getContent() + img + anchor);
            } else {
                iw.setContent(graphic.getContent());
            }
            iw.resize(300, 320);
            iw.show(p, myMap.getInfoWindowAnchor(p));
            myMap.centerAt(new Point(lon[0], lat[0], new SpatialReference({ wkid: 4490 })));

            // var point = new Point(lon[0], lat[0]);
            // gsvc = new esri.tasks.GeometryService("http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
            // outSR = new esri.SpatialReference({ wkid: 4490 });

            // gsvc.project([point], outSR, function(projected) {
            //     dojo.forEach(projected, function(p) {
            //         myMap.centerAndZoom(projected, 14);
            //     });
            // });
        }

        function remove() {
            //clear all graphics from map
            myMap.graphics.clear();
            myMap.infoWindow.hide();

            //Reset the divs to display 0
            var r = "0";
            dojo.byId('numberOfPoints').innerHTML = r;
            //dojo.byId('totalPopulation').innerHTML = r;

            drawTable();
        }
    });