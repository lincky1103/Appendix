define(
    ["./js/map.js", "dojo/on", "esri/map", "esri/geometry/Extent",
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

        on(document.getElementById("clearBtn"), "click", setPane);

        // 根据输入的关键字进行findTask操作
        function execute(searchText) {
            var dictPAC = {
                '河南省1': '411326',
                '河南省2': '411328',
                '江岸区': '420102',
                '江汉区': '420103',
                '硚口区': '420104',
                '汉阳区': '420105',
                '武昌区': '420106',
                '青山区': '420107',
                '洪山区': '420111',
                '东西湖区': '420112',
                '汉南区': '420113',
                '蔡甸区': '420114',
                '江夏区': '420115',
                '黄陂区': '420116',
                '新洲区': '420117',
                '黄石市': '420200',
                '黄石港区': '420202',
                '西塞山区': '420203',
                '下陆区': '420204',
                '铁山区': '420205',
                '阳新县': '420222',
                '大冶市': '420281',
                '茅箭区': '420302',
                '张湾区': '420303',
                '郧阳区': '420321',
                '郧西县': '420322',
                '竹山县': '420323',
                '竹溪县': '420324',
                '房县': '420325',
                '丹江口市': '420381',
                '西陵区': '420502',
                '伍家岗区': '420503',
                '点军区': '420504',
                '猇亭区': '420505',
                '夷陵区': '420506',
                '远安县': '420525',
                '兴山县': '420526',
                '秭归县': '420527',
                '长阳土家族自治县': '420528',
                '五峰土家族自治县': '420529',
                '宜都市': '420581',
                '当阳市': '420582',
                '枝江市': '420583',
                '襄城区': '420602',
                '樊城区': '420606',
                '襄州区': '420607',
                '南漳县': '420624',
                '谷城县': '420625',
                '保康县': '420626',
                '老河口市': '420682',
                '枣阳市': '420683',
                '宜城市': '420684',
                '梁子湖区': '420702',
                '华容区': '420703',
                '鄂城区': '420704',
                '东宝区': '420802',
                '掇刀区': '420803',
                '京山县': '420821',
                '沙洋县': '420822',
                '钟祥市': '420881',
                '孝南区': '420902',
                '孝昌县': '420921',
                '大悟县': '420922',
                '云梦县': '420923',
                '应城市': '420923',
                '安陆市': '420982',
                '汉川市': '420984',
                '沙市区': '421002',
                '荆州区': '421003',
                '公安县': '421022',
                '监利县': '421023',
                '江陵县': '421024',
                '石首市': '421081',
                '洪湖市': '421083',
                '松滋市': '421087',
                '黄州区': '421102',
                '团风县': '421121',
                '红安县': '421122',
                '罗田县': '421123',
                '英山县': '421124',
                '浠水县': '421125',
                '蕲春县': '421126',
                '黄梅县': '421127',
                '麻城市': '421181',
                '武穴市': '421182',
                '咸安区': '421202',
                '嘉鱼县': '421221',
                '通城县': '421222',
                '崇阳县': '421223',
                '通山县': '421224',
                '赤壁市': '421281',
                '曾都区': '421302',
                '随县': '421321',
                '广水市': '421381',
                '恩施市': '422801',
                '利川市': '422802',
                '建始县': '422822',
                '巴东县': '422823',
                '宣恩县': '422825',
                '咸丰县': '422826',
                '来凤县': '422827',
                '鹤峰县': '422828',
                '仙桃市': '429004',
                '潜江市': '429005',
                '天门市': '429006',
                '神农架林区': '429021',
                '湖南省': '430623'
            }
            if (/.*[\u4e00-\u9fa5]+.*$/.test(searchText)) {
                // findParams.searchText = dictPAC[searchText];
                // alert("!");

                //debugger
                for (var i in dictPAC) {
                    //alert(dictPAC[i]);
                    if (i.indexOf(searchText) >= 0) {
                        alert(dictPAC[i]);
                        findParams.searchText = dictPAC[i];

                        break;

                    } else { continue; }
                }

            } else {
                findParams.searchText = searchText;
            }
            findTask.execute(findParams, showResults);
        }

        function clear() {
            myMap.graphics.clear();
            myMap.infoWindow.hide();
            document.getElementById('searchText').value = '';
            document.getElementById("contentsContainer").innerHTML = '';
        }

        function setPane() {
            cPane = dojo.dijit.registry.byId("rightPane");
            cPane.set("title", "111");
            document.getElementById("rightPane").style.width = "10%";
            main = dojo.dijit.registry.byId("mainWindow");
            // domGeom.setContentSize(cPane, { w: 50 });
            main.layout();
        }


        // 显示findTask的结果
        function showResults(results) {
            // 清除上一次的高亮显示
            myMap.graphics.clear();

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