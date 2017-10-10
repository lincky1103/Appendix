var map;
require(["./js/map.js", "dojo/on", "esri/map", "esri/geometry/Extent",
        "esri/SpatialReference", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Point",
        "esri/tasks/FindTask", "esri/tasks/FindParameters", "esri/InfoTemplate",
        "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/Color",
        "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
    ],
    function(myMap, on, Map, Extent,
        SpatialReference, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, Point,
        FindTask, FindParameters, InfoTemplate,
        SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color) {




        // 实例化FindTask
        var findTask = new FindTask("http://localhost:6080/arcgis/rest/services/cpm/MyMapPoint/MapServer");
        // FindTask的参数
        var findParams = new FindParameters();
        // 返回Geometry
        findParams.returnGeometry = true;
        // 查询的图层id
        findParams.layerIds = [0];
        // 查询字段
        findParams.searchFields = ["PointID", "MAPID_5", "PAC", "LON", "LAT"];

        var ptSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
        var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1);
        var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

        on(document.getElementById("findBtn"), "click", function() {
            execute(document.getElementById('searchText').value);
        });

        on(document.getElementById("clearBtn"), "click", clear);

        // 根据输入的关键字进行findTask操作
        function execute(searchText) {
            findParams.searchText = searchText;
            findTask.execute(findParams, showResults);
        }

        function clear() {
            document.getElementById('searchText').value = '';
            document.getElementById("contentsContainer").innerHTML = '';
        }

        // 显示findTask的结果
        function showResults(results) {
            // 清除上一次的高亮显示
            // myMap.graphics.clear();

            var innerHtml = "";
            var symbol;
            for (var i = 0; i < results.length; i++) {
                var curFeature = results[i];
                var graphic = curFeature.feature;
                var infoTemplate = null;

                // 根据类型设置显示样式
                switch (graphic.geometry.type) {
                    case "point":
                        symbol = ptSymbol;
                        infoTemplate = new InfoTemplate("详细信息：", "${*}");
                        infoTemplate.setTitle("详细信息：");
                        var imgSrc = './tif/${GUIDE_1}.jpg'
                        var img = '<br /><img width="255" height="255" src=' + imgSrc + ' />';
                        var anchor = '<br /><a target="_blank" href="' + imgSrc + '">查看大图</a>';
                        infoTemplate.setContent("点号： ${PointID},<br/>类型： ${PointType},<br/>分辨率： ${ImgResolut}<br />" + img + anchor);
                        break;
                    case "polyline":
                        var symbol = lineSymbol;
                        break;
                    case "polygon":
                        var symbol = polygonSymbol;
                        break;
                }
                // 设置显示样式
                graphic.setSymbol(symbol);
                graphic.setInfoTemplate(infoTemplate);
                // 添加到graphics进行高亮显示
                myMap.graphics.add(graphic);

                if (curFeature.layerId === 0) {
                    innerHtml += "<a href='javascript:positionFeature(" + graphic.attributes.OBJECTID + ")'>" + graphic.attributes.PointID + "</a><br>";
                } else if (curFeature.layerId === 1) {
                    innerHtml += "<a href='javascript:positionFeature(" + graphic.attributes.OBJECTID + ")'>" + graphic.attributes.MAPID_5 + "</a><br>";
                } else {
                    innerHtml += "<a href='javascript:positionFeature(" + graphic.attributes.OBJECTID + ")'>" + graphic.attributes.PAC + "</a><br>";
                }
            }

            document.getElementById("contentsContainer").innerHTML = innerHtml;
        }

        window.positionFeature = function(id) {
            var sGrapphic;
            //遍历地图的图形查找FID和点击行的FID相同的图形
            for (var i = 0; i < myMap.graphics.graphics.length; i++) {
                var cGrapphic = myMap.graphics.graphics[i];
                if ((cGrapphic.attributes) && cGrapphic.attributes.OBJECTID == id) {
                    sGrapphic = cGrapphic;
                    break;
                }
            }

            var sGeometry = sGrapphic.geometry;
            // 当点击的名称对应的图形为点类型时进行地图中心定位显示
            if (sGeometry.type == "point") {
                var cPoint = new Point();
                cPoint.x = sGeometry.x;
                cPoint.y = sGeometry.y;
                var gsvc = new esri.tasks.GeometryService("http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
                outSR = new esri.SpatialReference({ wkid: 4490 });

                gsvc.project([cPoint], outSR, function(projected) {
                    dojo.forEach(projected, function(p) {
                        myMap.centerAt(p);
                    });
                });



                // myMap.centerAt(cPoint, new SpatialReference({ wkid: 4490 }));

                var p = myMap.toScreen(sGrapphic.geometry);
                var iw = myMap.infoWindow;
                iw.setTitle(sGrapphic.getTitle());
                iw.setContent(sGrapphic.getContent());
                iw.show(p, myMap.getInfoWindowAnchor(p));
            }
            //当点击的名称对应的图形为线或面类型时获取其范围进行放大显示
            else {
                var sExtent = sGeometry.getExtent();
                sExtent = sExtent.expand(2);
                myMap.setExtent(sExtent);
            }
        };
    });