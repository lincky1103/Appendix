require(["dijit/registry"],
    function(registry) {

        var tb = new Draw(myMap);
        tb.on("draw-end", addGraphic);


        registry.forEach(function(d) {
            if (d.declaredClass === "dijit.form.Button") {
                d.on("click", activateTool);
            }
        });

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

    });

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