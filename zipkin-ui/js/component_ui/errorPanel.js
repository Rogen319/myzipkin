import {component} from 'flightjs';
import $ from 'jquery';
import '../../libs/layer/layer';
import echarts from 'echarts';

export default component(function errorRate() {

  this.showErrorPie = function(e, data) {
    if(data.requestWithTraceInfoList.length > 0){
      $('#errorPieVis').css('height', window.screen.height * 0.4 + 'px');
      $('#selectTree').css('height', window.screen.height * 0.39 + 'px');
      $('#maShiRo').css('bottom', window.screen.height * 0.4 + 'px');
      $('#maShiRo').show();
      this.initControlMaShiRo();
      this.initPie(data.requestWithTraceInfoList,1);
      this.initVerticalBar(data.requestWithTraceInfoList,1);
      $('#errorPieVis').show();
    }
  };

  this.initControlMaShiRo = function() {
    var showMaShiRo = false;
    $('#controlMaShiRo').html('隐藏错误率分析');
    $('#controlMaShiRo').bind('click',function () {
      if(showMaShiRo){
        $('#errorPieVis').css('height', window.screen.height * 0.4 + 'px');
        $('#maShiRo').css('bottom', window.screen.height * 0.4 + 'px');
        $(this).html('隐藏错误率分析');
        showMaShiRo = false;
      }
      else{
        $('#errorPieVis').css('height', '0');
        $('#maShiRo').css('bottom', '0');
        $(this).html('显示错误率分析');
        showMaShiRo = true;
      }
    });
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
      backgroundColor: 'white',
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
          center: ['50%', '60%'],
          data: pieData,
        }
      ]
    };
    errorPie.setOption(options);

    if(type === 1){
      errorPie.on('click', function (params) {
        $('#errorPie').trigger('locateRequestTypeInSelectTree', params.data.name);
        $('#errorPie').trigger('initPie', {data:data[params.dataIndex].traceTypeList, type:2});
        // this.locateRequestTypeInSelectTree(params.data.name);
        // this.initPie(data[params.dataIndex].traceTypeList,2);
        $('#errorBar').html('');
      });
    }
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
    this.on(document, 'showErrorPie', this.showErrorPie);
    this.on( 'locateRequestTypeInSelectTree', this.locateRequestTypeInSelectTree);
    this.on( 'initPie', this.initP);
  })

})
