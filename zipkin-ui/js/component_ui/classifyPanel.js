import {component} from 'flightjs';
import $ from 'jquery';
import '../../libs/layer/layer';
import {initialServiceColor, isInArray, } from './publicOperation';
import echarts from 'echarts';


export default component(function classify() {

  const allColor = [
    '#CC0000',
    '#ffd700',
    '#228B22',
    '#5F9EA0',
    '#ff6347',
    '#6495ed',
    '#EE7621',
    '#32cd32',
    '#7b68ee',
    '#1e90ff',
    '#87cefa',
    '#ff6666',
    '#778899',
    '#ba55d3',
    '#D87093'
    ];

  this.initH = function(e,d){
    this.highlightServicesByName(d.service, d.color);
  };

  this.initClassifyListen = function() {
    $('#classify').bind('click',function () {
      const classifyNumber = $('#classifyNumber').val();
      if(classifyNumber !== undefined && classifyNumber != null){
        if(classifyNumber >= 2 && classifyNumber <=10){
          const loading = layer.load(2,{
            shade: 0.3,
            scrollbar: false,
            zIndex: 20000000
          });
          $(this).trigger('getCluster',{classifyNumber:classifyNumber, loading:loading});
          // LogData.getCluster(classifyNumber,loading);
        }
        else{
          layer.msg(2,'分类数量必须在2~10之间');
        }
      }
      return false;
    });
  };

  this.initColor = function(e, data) {
    initialServiceColor();
    for(let i = 0; i < data.clusters.length; i++){
      this.highlightServicesByName(data.clusters[i],allColor[i]);
    }
  };

  this.highlightServicesByName = function(service,color) {
    let nodes = document.getElementsByClassName('node enter');
    for (let i = 0; i < nodes.length; i++) {
      let tn = nodes[i].getAttribute('data-node');
      if (isInArray(service,tn)) {
        let node = nodes[i].getElementsByTagName('rect')[0];
        node.setAttribute('fill', color);
      }
    }
  };


  this.showClassifyNoticeWindow = function (e, data) {
    let html = '';
    for(let i = 0;i < data.clusters.length ;i++){
      html += '<li class="list-group-item">' +
        '          <div class = "color-box pull-left">' +
        '          </div>&nbsp;' +
        'cluster ' + (i+1).toString() +
        '        </li>';
    }
    html += '<li class="list-group-item">' +
      '          <div class = "color-box pull-left">' +
      '          </div>&nbsp;' +
      '聚类数据分析'+
      '        </li>';

    $('#selectedTrace').html(html);

    $('#selectedTrace').children('li').each(function (i) {
      if(i < data.clusterCount){
        $(this).bind('click',function () {
          initialServiceColor();
          // this.highlightServicesByName(data.clusters[i],allColor[i]);
          $(this).trigger('highlightServicesByName',{service:data.clusters[i],color:allColor[i]});
        });
        $(this).find('.color-box').css('background-color',allColor[i]);
      }
      else{
        $(this).bind('click',function () {
          // this.showClassifyResult(data);
          $(this).trigger('showClassifyResult', data);
        });
        $(this).find('.color-box').css('background-color','#FFFFFF');
      }
    });
  };

  this.showClassifyResult = function (e, data) {
    let html = '<div class="container">' +
      ' <div class="row">' +
      '   <div class="col-sm-6 col-md-6 col-lg-6">' +
      '     <div id = "pieResult">' +
      '     </div>' +
      '   </div>' +
      '   <div class="col-sm-6 col-md-6 col-lg-6">' +
      '     <div id = "barResult">' +
      '     </div>' +
      '   </div>' +
      ' </div> ' +
      '</div>';
    layer.open({
      type: 1,
      shade: 0.3,
      shadeClose: true,
      area: ['1250px', '600px'],
      closeBtn: 1,
      anim: 0,
      fixed: false,
      title: '聚类结果统计',
      content: html
    });
    this.initPieResult(data);
    this.initBarResult(data);
  };

  this.initPieResult = function(data) {
    let pieResult = echarts.init(document.getElementById('pieResult'));
    let pieData = [];
    let typeName = [];
    for(let i = 0; i < data.clusterCount; i++){
      typeName[i] = 'Type' + (i+1).toString();
      let dataItem = {};
      dataItem.value = data.clusters[i].length;
      dataItem.name = typeName[i];
      dataItem.itemStyle = {};
      dataItem.itemStyle.normal = {};
      dataItem.itemStyle.normal.color = allColor[i];
      dataItem.itemStyle.emphasis = {};
      dataItem.itemStyle.emphasis.shadowBlur = 10;
      dataItem.itemStyle.emphasis.shadowOffsetX = 0;
      dataItem.itemStyle.emphasis.shadowColor = 'rgba(0, 0, 0, 0.5)';
      pieData[i] = dataItem;
    }
    let options = {
      backgroundColor: 'white',
      title: {
        text: '聚类结果分析',
        left: 'center',
        top: 20,
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: typeName
      },
      series: [
        {
          name: '聚类结果饼图',
          type: 'pie',
          clockwise: 'true',
          startAngle: '0',
          radius : '55%',
          center: ['50%', '60%'],
          data: pieData,
        }
      ]
    };
    pieResult.setOption(options);
  };

  this.initBarResult = function(data) {
    let barResult = echarts.init(document.getElementById('barResult'));
    let barData = [];
    let typeName = [];
    for(let i = 0; i < data.clusterCount; i++){
      let dataItem = {};
      dataItem.value = data.clusters[i].length;
      dataItem.itemStyle = {};
      dataItem.itemStyle.color = allColor[i];
      typeName[i] = 'Type' + (i+1).toString();
      barData[i] = dataItem;
    }
    let options = {
      backgroundColor: 'white',
      title: {
        text: '聚类结果分析',
        left: 'center',
        top: 20,
      },
      xAxis: {
        type: 'category',
        data: typeName
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: barData,
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: '#000'
              }
            }
          }
        },
        type: 'bar'
      }]
    };
    barResult.setOption(options);
  };


  this.after('initialize', function afterInitialize() {
    this.initClassifyListen();
    this.on(document, 'initColor',this.initColor);
    this.on(document, 'showClassifyNoticeWindow',this.showClassifyNoticeWindow);
    this.on(document, 'highlightServicesByName',this.initH);
    this.on(document, 'showClassifyResult',this.showClassifyResult);
  })

})
