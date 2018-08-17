import {component} from 'flightjs';
import $ from 'jquery';
import '../../libs/layer/layer';
import echarts from 'echarts';
import {errorRatePanelTemplate} from "../templates";
import {contextRoot} from "../publicPath";

export default component(function errorRate() {

  var showMaShiRo = false;
  var rawData;

  this.closeErrorPanel = function(){
    $('#errorPieVis').css('height', '0');
    $('#maShiRo').css('bottom', '0');
    $('#controlMaShiRo').html('显示错误率分析');
    $('#returnLastLevel').css('display','none');
    showMaShiRo = true;
  };

  this.initControlMaShiRo = function() {
    $('#controlMaShiRo').html('隐藏错误率分析');
    $('#controlMaShiRo').bind('click',function () {
      if(showMaShiRo){
        $('#errorPieVis').css('height', window.screen.height * 0.4 + 'px');
        $('#maShiRo').css('bottom', window.screen.height * 0.4 + 'px');
        $('#returnLastLevel').css('display','block');
        $(this).html('隐藏错误率分析');
        showMaShiRo = false;
      }
      else{
        $('#errorPieVis').css('height', '0');
        $('#maShiRo').css('bottom', '0');
        $('#returnLastLevel').css('display','none');
        $(this).html('显示错误率分析');
        showMaShiRo = true;
      }
    });
  };

  this.showErrorPie = function(data) {
    rawData = data.requestWithTraceInfoList;
    if(data.requestWithTraceInfoList.length > 0){
      $('#errorPieVis').css('height', window.screen.height * 0.4 + 'px');
      $('#selectTree').css('height', window.screen.height * 0.39 + 'px');
      $('#maShiRo').css('bottom', window.screen.height * 0.4 + 'px');
      $('#maShiRo').show();
      this.initControlMaShiRo();
      this.initPie(data.requestWithTraceInfoList,1);
      this.initVerticalBar(data.requestWithTraceInfoList,1);
      $('#errorPieVis').show();
      $('#returnLastLevel').on('click', function(){
         $(this).trigger('returnLastLevel');
      });
    }
  };

  //返回上一级的错误率图
  this.returnLastLevel = function(){
    $('#errorPie').trigger('closeAll');
    $('#errorPie').trigger('initPie', {data:rawData, type:1});
    $('#errorPie').trigger('initVerticalBar', {data:rawData, type:1});
    $('#errorBar').show();
  };


  this.initP = function(e, d){
    this.initPie(d.data, d.type);
  };

  this.initPie = function(data, type) {
    let errorPie = echarts.init(document.getElementById('errorPie'));
    let pieData = [];
    let typeName = [];
    for(let i = 0; i < data.length; i++){
      if(type == 1){
        typeName[i] = data[i].requestType;
      }
      else if(type == 2){
        typeName[i] = data[i].typeName;
      }
      let dataItem = {};
      dataItem.value = ((data[i].errorCount / (data[i].errorCount + data[i].exceptionCount + data[i].normalCount)) * 100).toFixed(2);
      dataItem.name = typeName[i];
      dataItem.itemStyle = {};
      dataItem.itemStyle.emphasis = {};
      dataItem.itemStyle.emphasis.shadowBlur = 10;
      dataItem.itemStyle.emphasis.shadowOffsetX = 0;
      dataItem.itemStyle.emphasis.shadowColor = 'rgba(0, 0, 0, 0.5)';
      pieData[i] = dataItem;
    }
    let options = {
      backgroundColor: 'rgba(0,0,0,0)',
      title: {
        text: '错误率分布图',
        left: 'center',
        top: 20,
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c}% ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: typeName
      },
      series: [
        {
          name: '错误率分布图',
          type: 'pie',
          clockwise: 'true',
          startAngle: '0',
          radius : '55%',
          center: ['65%', '50%'],
          data: pieData,
        }
      ]
    };
    errorPie.setOption(options);

    if(type === 1){
      $('#returnLastLevel').hide();
      errorPie.on('click', function (params) {
        $('#errorPie').trigger('locateRequestTypeInSelectTree', params.data.name);
        $('#errorPie').trigger('initPie', {data:rawData[params.dataIndex].traceTypeList, type:2});
        $('#errorBar').hide();
        // $('#errorBar').html('');
      });
    }

    if(type == 2){
      $('#returnLastLevel').show();
    }

  };

  this.initV = function(e, d){
    this.initVerticalBar(d.data, d.type);
  };

  this.initVerticalBar = function (data,type) {
    let errorBar = echarts.init(document.getElementById('errorBar'));
    let barData = [];
    let typeName = [];
    for(let i = 0; i < data.length; i++){
      if(type == 1){
        typeName[i] = data[i].requestType;
      }
      else if(type == 2){
        typeName[i] = data[i].typeName;
      }
      let dataItem = {};
      dataItem.value = ((data[i].errorCount / (data[i].errorCount + data[i].exceptionCount + data[i].normalCount)) * 100).toFixed(2);
      dataItem.name = typeName[i];
      barData[i] = dataItem;
    }
    let options = {
      backgroundColor: 'white',
      title: {
        text: '错误率分布图',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: "{a} <br/> {b} : {c}%",
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '22%'
      },
      legend: {
        data: typeName
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: typeName
      },
      series: [
        {
          name: '错误率分布图',
          type: 'bar',
          data: barData,
        }
      ]
    };
    errorBar.setOption(options);
  };

  this.locateRequestTypeInSelectTree = function(e, requestTypeName) {
    $('#selectTree').find('.tree-node').each(function () {
      if ($.trim($(this).find('.field').html()) === 'root' && $.trim($(this).find('.title').html()) == requestTypeName){
        $(this).css('color', '');
        $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
        $(this).next().slideDown(500,function () {
          $(this).children('[data-toggle="tooltip"]').tooltip('show');
        });
        $(this).find('.open').val('true');
        $(this).find('.status').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
      }
    });
  };


  this.after('initialize', function afterInitialize() {
    this.on(document, 'showErrorPie', function (e, data){
      this.$node.html(errorRatePanelTemplate({
        contextRoot
      }));
      this.showErrorPie(data);
    });
    this.on( document,'locateRequestTypeInSelectTree', this.locateRequestTypeInSelectTree);
    this.on( document,'initPie', this.initP);
    this.on( document,'initVerticalBar', this.initV);
    this.on( document, 'closeErrorPanel', this.closeErrorPanel);
    this.on( document, 'returnLastLevel', this.returnLastLevel);
  })

})
