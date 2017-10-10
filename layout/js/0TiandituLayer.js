define(["dojo/_base/declare", "esri/layers/TiledMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/layers/TileInfo"],
    function(declare, TiledMapServiceLayer, Extent, SpatialReference, TileInfo) {
        return declare(TiledMapServiceLayer, {
            // ���캯��
            constructor: function(properties) {
                this.spatialReference = new SpatialReference({
                    wkid: 4490
                        //2000大地坐标系
                });

                // 图层提供的起始显示范围以及整个图层的地理范围，这里定arcmap视图中的湖北省范围
                this.fullExtent = new Extent(107.7829404508033, 28.23120242588708, 116.7116494809547, 34.07381403957674, this.spatialReference);
                this.initialExtent = new Extent(107.7829404508033, 28.23120242588708, 116.7116494809547, 34.07381403957674, this.spatialReference);
                // 图层提供的切片信息
                this.tileInfo = new TileInfo({
                    "rows": 256,
                    "cols": 256,
                    "compressionQuality": 0,
                    "origin": {
                        "x": 107.7829404508033,
                        "y": 28.23120242588708
                    },
                    "spatialReference": {
                        "wkid": 4490
                    },
                    "lods": [
                        // { "level": 0, "resolution": 156543.033928, "scale": 591657527.591555 },
                        // { "level": 1, "resolution": 78271.5169639999, "scale": 295828763.795777 },
                        // { "level": 2, "resolution": 39135.7584820001, "scale": 147914381.897889 },
                        // { "level": 3, "resolution": 19567.8792409999, "scale": 73957190.948944 },
                        // { "level": 4, "resolution": 9783.93962049996, "scale": 36978595.474472 },
                        // { "level": 5, "resolution": 4891.96981024998, "scale": 18489297.737236 },
                        // { "level": 6, "resolution": 2445.98490512499, "scale": 9244648.868618 },
                        { "level": 7, "resolution": 0.010986328125000003, "scale": 4617149.8915429693 },
                        { "level": 8, "resolution": 0.0054931640625000017, "scale": 2308574.9457714846 },
                        { "level": 9, "resolution": 0.0027465820312500009, "scale": 1154287.4728857423 },
                        { "level": 10, "resolution": 0.0013732910156250004, "scale": 577143.73644287116 },
                        { "level": 11, "resolution": 0.00068664550781250022, "scale": 288571.86822143558 },
                        { "level": 12, "resolution": 0.00034332275390625011, "scale": 144285.93411071779 },
                        { "level": 13, "resolution": 0.00017166137695312505, "scale": 72142.967055358895 },
                        { "level": 14, "resolution": 0.000085830688476562527, "scale": 36071.483527679447 }
                        // { "level": 15, "resolution": 4.77731426794937, "scale": 18055.954822 },
                        // { "level": 16, "resolution": 2.38865713397468, "scale": 9027.977411 },
                        // { "level": 17, "resolution": 1.19432856685505, "scale": 4513.988705 },
                        // { "level": 18, "resolution": 0.597164283559817, "scale": 2256.994353 },
                        // { "level": 19, "resolution": 0.298582141647617, "scale": 1128.497176 }
                    ]
                });

                // ����ͼ���loaded���ԣ�������onLoad�¼�
                this.loaded = true;
                this.onLoad(this);
            },

            getTileUrl: function(level, row, col) {
                //alert("显示信息1");  
                return "http://localhost:6080/arcgis/rest/services/cpm/BaseMap1w/MapServer" +
                    "L" + dojo.string.pad(level, 2, '0') + "/" +
                    "R" + dojo.string.pad(row.toString(16), 8, '0') + "/" +
                    "C" + dojo.string.pad(col.toString(16), 8, '0') + "." +
                    "png";
            }
        });
    }
)