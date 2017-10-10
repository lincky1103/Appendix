define([
        "dojo/parser",
        'dojo/_base/declare',
        "esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/toolbars/navigation",
        "dojo/query",
        'dojo/_base/fx',
        "dojo/fx/easing",
        "dojo/domReady!"
    ],
    function(parser,
        declare,
        Map,
        ArcGISTiledMapServiceLayer,
        Navigation,
        query,
        fx,
        easing) {
        parser.parse();
        var myMap;
        var toc;

        var navToolbar;
        var navOption; // 当前选择的操作

        //湖北省矩形框范围， 2000 坐标系
        var initExtent = new esri.geometry.Extent({
            "xmin": 108.003,
            "ymin": 28.395,
            "xmax": 116.425,
            "ymax": 33.854,
            "spatialReference": {
                "wkid": 4490
            }
        });
        myMap = new Map("map", {
            extent: initExtent,
            logo: false,
            sliderStyle: "large"
        })
        var baseMap0 = new esri.layers.ArcGISTiledMapServiceLayer("http://localhost:6080/arcgis/rest/services/cpm/TDT_BaseMap/MapServer", {
            id: "天地图底图",
            visible: true
        });
        var baseMap1 = new esri.layers.ArcGISTiledMapServiceLayer("http://localhost:6080/arcgis/rest/services/cpm/TDT_BaseAnno/MapServer", {
            id: "天地图注记",
            visble: true
        });
        var cpLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/cpm/MAP_BOUND/MapServer", {
            id: "湖北省影像控制点"
        });

        var aLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/cpm/MAP_ANNO/MapServer", {
            id: "注记层"
        });

        var fcpLayer = new esri.layers.FeatureLayer("http://localhost:6080/arcgis/rest/services/cpm/MyMapPoint/MapServer/0", {
            mode: esri.layers.FeatureLayer.MODE_ONDEMAND, // 模式，请参考上一篇文章介绍
            outFields: ["*"] // 字段
        });



        //添加多层
        myMap.addLayer(baseMap0);
        myMap.addLayer(baseMap1);
        myMap.addLayer(cpLayer);
        myMap.addLayer(aLayer);
        myMap.addLayers([fcpLayer]);
        //fcpLayer.setVisibility(false);

        // myMap.addLayers([cpLayer, fcpLayer]);

        //myMap.addLayers([fcpLayer]);
        //fcpLayer.setVisibility(false);
        myMap.reorderLayer(baseMap0, 0);
        //导航操作
        myMap.on('load', setupNavBar);

        //显示经纬度范围
        dojo.connect(myMap, "onExtentChange", showExtent);

        //显示比例尺
        myMap.on('extent-change', showScaleInfo);

        //当前鼠标位置
        //myMap.on("mouse-move", showPointInfo);

        function setupNavBar() {
            navToolbar = new Navigation(myMap);

            query(".navItem img").onmouseover(function(evt) {
                fx.anim(evt.target.parentNode, {
                    backgroundColor: '#CCCCCC'
                }, 200, easing.bounceOut);
            }).onmouseout(function(evt) {
                if (evt.target.parentNode.id != navOption) {
                    fx.anim(evt.target.parentNode, {
                        backgroundColor: '#FFFFFF'
                    });
                } else {
                    fx.anim(evt.target.parentNode, {
                        backgroundColor: '#DADADA'
                    });
                }
            }).onclick(function(evt) {

                fx.anim(evt.target.parentNode, {
                    backgroundColor: '#999999'
                }, 200, easing.linear, function() {
                    dojo.anim(evt.target.parentNode, {
                        backgroundColor: '#CCCCCC'
                    }, 0);
                });
                navEvent(evt.target.parentNode.id);
            });

            //将漫游设置为默认操作
            navEvent('deactivate');
        }

        function navEvent(id) {
            switch (id) {
                case 'pan':
                    map.enablePan();
                    navToolbar.activate(Navigation.PAN);

                    if (navOption) {
                        fx.anim(document.getElementById(navOption), {
                            backgroundColor: '#FFFFFF'
                        });
                    }
                    navOption = id;
                    break;
                case 'zoomprev':
                    navToolbar.zoomToPrevExtent();
                    break;
                case 'zoomnext':
                    navToolbar.zoomToNextExtent();
                    break;
                case 'extent':
                    // navToolbar.zoomToFullExtent();
                    myMap.setExtent(initExtent);
                    break;
                case 'zoomin':
                    navToolbar.activate(Navigation.ZOOM_IN);
                    if (navOption) {
                        fx.anim(document.getElementById(navOption), {
                            backgroundColor: '#FFFFFF'
                        });
                    }
                    navOption = id;
                    break;
                case 'zoomout':
                    navToolbar.activate(Navigation.ZOOM_OUT);
                    if (navOption) {
                        fx.anim(document.getElementById(navOption), {
                            backgroundColor: '#FFFFFF'
                        });
                    }
                    navOption = id;
                    break;
                case 'deactivate':
                    navToolbar.deactivate();
                    if (navOption) {
                        fx.anim(document.getElementById(navOption), {
                            backgroundColor: '#FFFFFF'
                        });
                    }
                    navOption = id;
                    break;
            }
        }

        function showExtent(extent) {
            var s = "";
            s = "当前范围 东: " + extent.xmin + "&nbsp;" +
                "南: " + extent.ymin + "&nbsp;" +
                "西: " + extent.xmax + "&nbsp;" +
                "北: " + extent.ymax;
            //showExtent函数的最后一行显示在页面上添加完成字符串的“info”DIV坐标
            dojo.byId("dataSource").innerHTML = s;
        }

        function showScaleInfo(evt) {
            var scaletext = myMap.getScale();
            document.getElementById("scaleInfo").innerHTML = '比例尺 1：' + scaletext;
        }

        function showPointInfo(evt) {
            var curPoint = evt.mapPoint;
            document.getElementById("pointInfo").innerHTML = '当前经纬度：' + curPoint.x + ',' + curPoint.y;
        }


        dojo.connect(myMap, "onLayersAddResult", function(results) {
            // 所有图层使用map.addLayers方法添加到地图后触发
            //dojo.keys.copyKey maps to CTRL on windows and Cmd on Mac.
            var snapManager = myMap.enableSnapping({ // 激活按键，默认是ctrl键
                snapKey: dojo.keys.copyKey
            });
            var layerInfos = [{
                layer: fcpLayer
            }];
            snapManager.setLayerInfos(layerInfos);

            var measurement = new esri.dijit.Measurement({ // 测量工具
                map: myMap
            }, dojo.byId('measurementDiv'));
            measurement.startup(); // 开启

        });

        // var resizeTimer;
        // dojo.connect(myMap, 'onLoad', function(theMap) {
        //     dojo.connect(dijit.byId('map'), 'resize', function() { //resize the map if the div is resized
        //         clearTimeout(resizeTimer);
        //         resizeTimer = setTimeout(function() {
        //             map.resize();
        //             map.reposition();
        //         }, 500);
        //     });
        // });

        var h = dojo.connect(myMap, 'onLayersAddResult', function(results) {
            // overwrite the default visibility of service.
            // TOC will honor the overwritten value.
            cpLayer.setVisibleLayers([2]);
            aLayer.setVisibleLayers([]);
            try {
                toc = new agsjs.dijit.TOC({
                    map: myMap,
                    layerInfos: [{
                            layer: baseMap0,
                            title: "TDT_BaseMap",
                            collapsed: true
                        },
                        {
                            layer: baseMap1,
                            title: "TDT_BaseAnno",
                            collapsed: true
                        },
                        {
                            layer: fcpLayer,
                            title: "控制点层"
                        },
                        {
                            layer: cpLayer,
                            title: "辅助图层",
                            collapsed: false
                                //collapsed: false, // whether this root layer should be collapsed initially, default false.
                                //slider: false // whether to display a transparency slider.
                        }, {
                            layer: aLayer,
                            title: "注记层",
                            collapsed: true
                        }, {}
                    ]
                }, 'tocDiv');
                toc.startup();
                dojo.connect(toc, 'onLoad', function() {
                    if (console)
                        console.log('TOC loaded');
                    dojo.byId("ChangeFeatureRenderer").disabled = false;
                    dojo.byId("SetVisibleLayersProgramatically").disabled = false;
                    dojo.byId("FindNodeByLayer").disabled = false;
                    dojo.byId("InsertNewLayer").disabled = false;
                });
                dojo.connect(toc, 'onTOCNodeChecked', function(rootLayer, serviceLayer, checked) {
                    if (console) {
                        console.log("TOCNodeChecked, rootLayer:" +
                            (rootLayer ? rootLayer.id : 'NULL') +
                            ", serviceLayer:" + (serviceLayer ? serviceLayer.id : 'NULL') +
                            " Checked:" + checked);

                    }
                });
                dojo.disconnect(h);
            } catch (e) {
                //alert(e);
            }

        });
        // return declare([], { a: 123 });

        // return declare([], {
        //     map: myMap,
        //     center: function() {
        //         myMap.setExtent(initExtent);
        //     }

        // })
        // debugger
        return myMap;
    });