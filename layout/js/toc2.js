/*********封装接口************/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "esri/map",
    "esri/layers/WMTSLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/FeatureLayer"
], function(Declare, Lang, Map, WMTSLayer, ArcGISDynamicMapServiceLayer, FeatureLayer) {
    return Declare("AIMapToc", null, {
        map: null,
        ztree: null,
        layerIds: null,
        allChildrenIds: null,

        constructor: function(_map) {
            this.map = _map;

            // 控制服务及图层当前比例尺是否可见
            map.on("zoom-end", Lang.hitch(this, function() {

                // 更新图层树
                this.updateTree();

            }));
        },
        createTree: function(domId) {

            if (this.ztree != null) {

                // 重置ztree，因为跟踪map的addlayer事件，需要重新读取地图图层数据建立图层面板
                this.ztree = null;
                $('#' + domId).empty();
            }

            var layerAutoNodes = []; // ztree节点集合
            this.layerIds = this.map.layerIds; // 动态图层
            var graphicsIds = this.map.graphicsLayerIds; // 几何图层
            this.layerIds = this.layerIds.concat(graphicsIds);
            var currentScale = this.map.getScale(); // 当前比例尺
            var isServiceScale = true; // 服务在当前比例尺下是否可见
            var isLayerScale = true; // 图层在当前比例尺下是否可见
            var check = false; //  节点选中情况

            // 遍历所有的图层，构造ztree
            for (var i = 0, len = this.layerIds.length; i < len; i++) {


                var layer = this.map.getLayer(this.layerIds[i]);
                if (layer instanceof WMTSLayer) { // 底图不加入图层面板

                    continue;
                } else {


                    if (layer instanceof ArcGISDynamicMapServiceLayer) { //动态地图服务


                        isServiceScale = (!layer.minScale || currentScale >= layer.maxScale && currentScale <= layer.minScale); // 不设置图层显示比例尺范围时minScale等于0
                        var layerInfos = layer.layerInfos;
                        isCheck = layer.visible;
                        layerAutoNodes.push({ "name": "地图服务" + i, "id": i, "pId": -1, "checked": isCheck, "chkDisabled": !isServiceScale });
                        if (layerInfos && layerInfos.length > 0) {
                            // 遍历服务的所有子图层
                            for (var j = 0, len2 = layerInfos.length; j < len2; j++) {

                                isLayerScale = (!layerInfos[j].minScale || currentScale >= layerInfos[j].maxScale && currentScale <= layerInfos[j].minScale);
                                isCheck = layerInfos[j].defaultVisibility;
                                var pId = layerInfos[j].parentLayerId;
                                if (pId == -1) { // 一级子图层设置父id为当前服务序号
                                    layerAutoNodes.push({ "name": layerInfos[j].name, "id": (layerInfos[j].id + (i + 1) * 1000), "pId": i, "checked": isCheck, "chkDisabled": !isLayerScale });
                                } else { // 大于一级子图层设置父id为(pId + (i+1) * 1000)，主要是为了防止不同服务的子图层id重复，以后用的时候解密到自然id
                                    layerAutoNodes.push({ "name": layerInfos[j].name, "id": (layerInfos[j].id + (i + 1) * 1000), "pId": (pId + (i + 1) * 1000), "checked": isCheck, "chkDisabled": !isLayerScale });
                                }

                            }
                        }

                    } else if (layer instanceof FeatureLayer) { // 要素地图服务
                        isServiceScale = (!layer.minScale || currentScale >= layer.maxScale && currentScale <= layer.minScale);
                        check = layer.visible;
                        layerAutoNodes.push({ "name": "要素服务" + i, "id": i, "pId": -1, "checked": isCheck, "chkDisabled": !isServiceScale });

                    } else { // 其他图层类型忽略（有待扩展）
                        continue;
                    }
                }
            }

            // ztree 初始化设置
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox"
                },
                view: {
                    dblClickExpand: true
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pId",
                        rootPId: -1
                    }
                },
                callback: {
                    onCheck: Lang.hitch(this, this.layersOnCheck)
                }
            };
            $('#' + domId).append("<div id='maptree' class='tree_info tree_right'><div id='layertree' class='ztree'></div></div>");
            this.ztree = $.fn.zTree.init($("#layertree"), setting, layerAutoNodes);
            this.ztree.expandAll(true);
            // 主动触发一次，去除子节点都禁用时父节点未禁用的情况
            this.updateTree();
        },
        // 节点点击操作函数
        layersOnCheck: function(event, treeId, treeNode) {

            var id = treeNode.id; // 节点加密id
            var pid = treeNode.pId; // 节点加密父id
            var checked = treeNode.checked; // 节点选中情况
            var layer = null; // 地图服务图层
            var visibleLayers = []; // 可视化图层数组
            this.allChildrenIds = []; // 节点的所有子节点自然序号
            var layerId = null; // 图层id
            var layerSeq = null; // 地图服务序号
            if (pid == -1) { // 地图服务节点

                layerSeq = id;
                layerId = this.layerIds[layerSeq];
                layer = this.map.getLayer(layerId);
                // 设置图层可见情况
                layer.setVisibility(checked);


            } else if (!treeNode.isParent) { // 叶子图层节点
                var node = treeNode;
                // 寻找这是第几个地图服务
                var pnodes = []; // 存储当前节点的所有父节点，不包括服务根节点
                while (node.getParentNode()) {
                    node = node.getParentNode();
                    pnodes.push(node);
                }
                pnodes.pop(); // 删除服务根节点，不计入考虑
                layerSeq = node.id;
                layerId = this.layerIds[layerSeq];
                layer = this.map.getLayer(layerId);
                visibleLayers = layer.visibleLayers;
                if (checked) {
                    // 从可视化图层数组中添加当前节点
                    visibleLayers.push(treeNode.id - 1000 * (layerSeq + 1));

                } else {
                    // 从可视化图层数组中删除所有父节点
                    for (var j in pnodes) {
                        var pnode = pnodes[j];
                        for (var i in visibleLayers) {
                            if (visibleLayers[i] == (pnode.id - 1000 * (layerSeq + 1))) {
                                visibleLayers.splice(i, 1);
                                break;
                            }
                        }
                    }
                    // 从可视化图层数组中删除当前节点
                    for (var i in visibleLayers) {
                        if (visibleLayers[i] == (treeNode.id - 1000 * (layerSeq + 1))) {
                            visibleLayers.splice(i, 1);
                            break;
                        }
                    }

                    // 从可视化图层数组中清空
                    if (visibleLayers.length == 0) {
                        visibleLayers.push(-1);
                    }
                }

                // 设置可见子图层
                layer.setVisibleLayers(visibleLayers);


            } else { //  非根非叶子节点的情况

                var node = treeNode;
                // 寻找这是第几个地图服务
                var pnodes = []; // 存储当前节点的所有父节点，不包括服务根节点
                while (node.getParentNode()) {
                    node = node.getParentNode();
                    pnodes.push(node);
                }
                pnodes.pop(); // 删除服务根节点，不计入考虑
                layerSeq = node.id;
                // 寻找所有子节点的自然序号
                this.findAllChildren(treeNode, layerSeq);

                layerId = this.layerIds[layerSeq];
                layer = this.map.getLayer(layerId);
                visibleLayers = layer.visibleLayers;
                if (checked) {
                    visibleLayers = visibleLayers.concat(this.allChildrenIds);

                } else {
                    // 从可视化图层数组中删除所有父节点
                    for (var j in pnodes) {
                        var pnode = pnodes[j];
                        for (var i in visibleLayers) {
                            if (visibleLayers[i] == (pnode.id - 1000 * (layerSeq + 1))) {
                                visibleLayers.splice(i, 1);
                                break;
                            }
                        }
                    }
                    // 从可视化图层数组中删除当前节点
                    for (var i in visibleLayers) {
                        if (visibleLayers[i] == (treeNode.id - 1000 * (layerSeq + 1))) {
                            visibleLayers.splice(i, 1);
                            break;
                        }
                    }
                    // 从可视化图层数组中删除子节点
                    for (var j in this.allChildrenIds) {
                        for (var i in visibleLayers) {
                            if (this.allChildrenIds[j] == visibleLayers[i]) {
                                visibleLayers.splice(i, 1);
                                break;
                            }
                        }

                    }
                    // 从可视化图层数组中清空
                    if (visibleLayers.length == 0) {
                        visibleLayers.push(-1);
                    }
                }
                // 设置可见子图层
                layer.setVisibleLayers(visibleLayers);
            }
        },
        // 更新图层树
        updateTree: function() {

            var currentScale = this.map.getScale(); // 当前比例尺
            var layerId = null; // 图层id
            var layerSeq = null; // 地图服务序号
            var layer = null; // 地图服务图层
            var isServiceScale = true; // 服务在当前比例尺下是否可见
            var isLayerScale = true; // 图层在当前比例尺下是否可见
            // 获取ztree对象
            var treeObj = $.fn.zTree.getZTreeObj("layertree");
            //获取所有服务节点
            var nodes = treeObj.getNodes();

            // 广度遍历获取所有节点（利用队列的非递归方式）
            var queue = []; // 队列
            var arr = []; // 遍历结果
            for (var i in nodes) {
                queue.push(nodes[i]);
            }
            var tnode = queue.shift();
            arr.push(tnode);
            while (tnode) {
                var tnodes = tnode.children;
                for (var j in tnodes) {
                    queue.push(tnodes[j]);
                }
                tnode = queue.shift();
                if (tnode) {
                    arr.push(tnode);
                }

            }

            // 倒序处理数组（从树的底层向上遍历）
            for (var i = arr.length - 1; i >= 0; i--) {
                var node = arr[i];
                // 寻找这是第几个地图服务
                var pnode = node.getParentNode();
                while (node.getParentNode()) {
                    node = node.getParentNode();
                }
                layerSeq = node.id;
                layerId = this.layerIds[layerSeq];
                layer = this.map.getLayer(layerId);
                if (layer instanceof ArcGISDynamicMapServiceLayer) { //动态服务

                    var layerInfos = layer.layerInfos;
                    if (!arr[i].isParent) { //叶子节点
                        var k = arr[i].id - 1000 * (layerSeq + 1);
                        isLayerScale = (!layerInfos[k].minScale || currentScale >= layerInfos[k].maxScale && currentScale <= layerInfos[k].minScale);
                        treeObj.setChkDisabled(arr[i], !isLayerScale);

                    } else { // 非叶子节点
                        var cnodes = arr[i].children;
                        chkDisabled = true;
                        for (var j in cnodes) {
                            chkDisabled = chkDisabled && cnodes[j].chkDisabled;
                        }
                        treeObj.setChkDisabled(arr[i], chkDisabled);
                    }
                } else { // 要素服务
                    isServiceScale = (!layer.minScale || currentScale >= layer.maxScale && currentScale <= layer.minScale);
                    treeObj.setChkDisabled(arr[i], !isServiceScale);
                }

            }

        },
        // 寻找所有子节点的自然序号
        findAllChildren: function(treeNode, layerSeq) {

            // 递归寻找子节点
            if (treeNode.children && treeNode.children.length > 0) {
                var nodes = treeNode.children;
                for (var i = 0, len = nodes.length; i < len; i++) {
                    // 解密成自然序号
                    this.allChildrenIds.push(nodes[i].id - 1000 * (layerSeq + 1));
                    // 加入集合
                    this.findAllChildren(nodes[i], layerSeq);
                }

            }
        }

    });
});