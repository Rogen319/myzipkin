import {component} from 'flightjs';
import $ from 'jquery';
import {contextRoot} from '../publicPath';
import '../../libs/layer/layer';
import {showServiceInfo} from './InfoContent';
import {getLogByTraceID, getCluster} from '../component_data/log';

export default component(function select() {

  const allColor = ['#ffff00',
    '#ff0000',
    '#ff9999',
    '#EE7621',
    '#99ff00',
    '#9900cc',
    '#666600',
    '#3399cc',
    '#BCEE68',
    '#8B4500'];

  this.isInArray = function(arr, value) {
    for (let i = 0; i < arr.length; i++) {
      if (value === arr[i]) {
        return true;
      }
    }
    return false;
  };

  this.initialServiceColor = function() {
    let nodes = document.getElementsByClassName('node enter');
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i].getElementsByTagName('rect')[0];
      node.setAttribute('fill', '#FFF');
    }
  };

  this.highlightServices = function() {
    this.initialServiceColor();
    let nodes = document.getElementsByClassName('node enter');
    for (let i = 0; i < nodes.length; i++) {
      let tn =  nodes[i].getAttribute('data-node');
      if(selectedTraceId.length >= 2){
        if (this.isInArray(selectedServices[currentTraceId],tn)) {
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#0FF0F1');
        }
        let t = currentTraceId === 0 ? 1 : 0;
        if (this.isInArray(selectedServices[t], tn)) {
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#ADFF2F');
        }
        if(this.isInArray(selectedServices[currentTraceId], tn) && this.isInArray(selectedServices[t], tn)){
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#1E90FF');
        }
      }
      else if(selectedTraceId.length == 1){
        if (this.isInArray(selectedServices[currentTraceId],tn)) {
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#0FF0F1');
        }
      }
    }
  };

  this.initServiceClick = function () {
    var ss = $('#dependency-container').find('.node.enter')
    ss.each(function() {
      $(this).unbind('click');
      const serviceName = $(this).find('text').children().eq(0).html();
      if(selectedServices.length >= 2){
        if(selectedServices[0].contains(serviceName) && selectedServices[1].contains(serviceName)){
          $(this).bind('click',function(){
            showServiceInfo(selectedTraceId[currentTraceId],serviceName,1)
          });
        }
        else if(selectedServices[0].contains(serviceName)){
          $(this).bind('click', function (){
            showServiceInfo(selectedTraceId[0],serviceName,0);
          });
        }
        else if(selectedServices[1].contains(serviceName)){
          $(this).bind('click',function (){
            showServiceInfo(selectedTraceId[1],serviceName,0)
          });
        }
      }
      else if(selectedServices.length == 1){
        if(selectedServices[0].contains(serviceName)){
          $(this).bind('click',function (){
            showServiceInfo(selectedTraceId[0],serviceName,0);
          });
        }
      }
    });
  };

  this.locateTraceInSelectTree = function() {
    let nodeList = [];
    $('#selectTree').find('.tree-node').each(function () {
      if ($.trim($(this).find('.field').html()) === 'root'){
        $(this).css('color', '');
        $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
        $(this).next().slideUp(500,function () {
          $(this).children('[data-toggle="tooltip"]').tooltip('hide');
        });
        $(this).find('.open').val('false');
        $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');

        $(this).next().find('.tree-node').each(function () {
          $(this).css('color', '');
          $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
          $(this).next().slideUp(500,function () {
            $(this).children('[data-toggle="tooltip"]').tooltip('hide');
          });
          $(this).find('.open').val('false');
          $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        });
      }
      if ($.trim($(this).find('.field').html()) === 'trace') {
        let t = $.trim($(this).find('.title').html());
        if(t === selectedTraceId[currentTraceId]){
          nodeList[0] = $(this).next();
          nodeList[1] = $(this).parent().parent();
          nodeList[2] = nodeList[1].parent().parent();
        }
      }
    });

    for(let i = 2;i >= 0;i--){
      nodeList[i].find('.open').val('true');
      nodeList[i].find('.status').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
      nodeList[i].slideDown(500,function () {
        $(this).children('li').each(function () {
          $(this).children('a').children('span').tooltip();
        });
      });
    }
    nodeList[0].prev().css({'background-color': '#777777', 'color': '#FFFFFF'});
  };

  this.closeAll = function() {
    $('#selectTree').find('.tree-node').each(function () {
      if ($.trim($(this).find('.field').html()) === 'root'){
        $(this).css('color', '');
        $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
        $(this).next().slideUp(500,function () {
          $(this).children('[data-toggle="tooltip"]').tooltip('hide');
        });
        $(this).find('.open').val('false');
        $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');

        $(this).next().find('.tree-node').each(function () {
          $(this).css('color', '');
          $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
          $(this).next().slideUp(500,function () {
            $(this).children('[data-toggle="tooltip"]').tooltip('hide');
          });
          $(this).find('.open').val('false');
          $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        });
      }
    });

  };

  this.showNoticeWindow = function () {
    let html = '';
    for(let i = 0;i < selectedTraceId.length ;i++){
      html += '<li class="list-group-item">' +
        '          <div class = "color-box pull-left">' +
        '          </div>&nbsp;' +
        selectedTraceId[i] +
        '          <button type="button" class="close pull-right"><span aria-hidden="true">&times;</span></button>' +
        '        </li>';
    }
    if(selectedTraceId.length >= 2){
      html += '<li class="list-group-item">' +
        '          <div class = "color-box pull-left">' +
        '          </div>&nbsp;' +
        '共同Service'+
        '        </li>';
    }
    $('#selectedTrace').html(html);

    $('#selectedTrace').children('li').each(function (i) {
      if(i < 2){
        $(this).bind('click',function () {
          currentTraceId = i;
          // hightLightAndShowLog();
          this.trigger(document,'hightLightAndShowLog');
          this.locateTraceInSelectTree();
        });
        $(this).find('.close').bind('click',function () {
          selectedTraceId.splice(i,1);
          selectedServices.splice(i,1);
          if(selectedTraceId.length >= 1){
            currentTraceId = 0;
            // hightLightAndShowLog();
            this.trigger(document,'hightLightAndShowLog');
            this.locateTraceInSelectTree();
          }
          else {
            $('#logEntrance').hide();
            $('#logVis').hide();
            this.highlightServices();
            $('#selectedTrace').html('');
            this.closeAll();
          }
          //防止冒泡事件
          event.stopPropagation();
        });
        if(i === currentTraceId){
          $(this).css('background-color','#B0C4DE');
          $(this).find('.color-box').css('background-color','#0FF0F1');
        }
        else
          $(this).find('.color-box').css('background-color','#ADFF2F');
      }
      else
        $(this).find('.color-box').css('background-color','#1E90FF');
    });
  };

  //////////////////////////////////////////////////////
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
          getCluster(classifyNumber,loading);
        }
        else{
          layer.msg(2,'分类数量必须在2~10之间');
        }
      }
      return false;
    });
  };

  this.initColor = function(data) {
    this.initialServiceColor();
    for(let i = 0; i < data.clusters.length; i++){
      this.highlightServicesByName(data.clusters[i],allColor[i]);
    }
  };

  this.highlightServicesByName = function(service,color) {
    let nodes = document.getElementsByClassName('node enter');
    for (let i = 0; i < nodes.length; i++) {
      let tn = nodes[i].getAttribute('data-node');
      if (this.isInArray(service,tn)) {
        let node = nodes[i].getElementsByTagName('rect')[0];
        node.setAttribute('fill', color);
      }
    }
  };

  this.showClassifyNoticeWindow = function (data) {
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
          this.initialServiceColor();
          this.highlightServicesByName(data.clusters[i],allColor[i]);
        });
        $(this).find('.color-box').css('background-color',allColor[i]);
      }
      else{
        $(this).bind('click',function () {
          this.showClassifyResult(data);
        });
        $(this).find('.color-box').css('background-color','#FFFFFF');
      }
    });
  };

  this.showClassifyResult = function (data) {
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


  /////////////////////////////////////////////////////////////

  this.after('initialize', function afterInitialize() {

    this.initClassifyListen();
    this.on(document, 'initColor',this.initColor);
    this.on(document, 'showClassifyNoticeWindow',this.showClassifyNoticeWindow);

    this.on(document, 'hightLightAndShowLog', function() {
      this.highlightServices();
      this.initServiceClick();
      this.showNoticeWindow();
      $('#sortByURI').children('i').hide();
      $('#sortByTime').children('i').show();
      const loading = layer.load(2,{
        shade: 0.3,
        scrollbar: false,
        zIndex: 20000000
      });
      getLogByTraceID(selectedTraceId[currentTraceId],1,loading);
    });

  });

});
