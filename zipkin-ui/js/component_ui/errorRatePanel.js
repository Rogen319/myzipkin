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
    // $('#errorBar').show();
    this.initVerticalBar(rawData,1);
  };


  this.initP = function(e, d){
    this.initPie(d.data, d.type);
  };

  this.initPie = function(data, type) {
    let errorPie = echarts.init(document.getElementById('errorPie'));
    let pieData = [];
    let typeName = [];
    let errorTotal = 0;
    for(let i = 0; i < data.length; i++){
      errorTotal += data[i].errorTraceCount;
    }
    for(let i = 0; i < data.length; i++){
      if(type == 1){
        typeName[i] = data[i].requestType;
      }
      else if(type == 2){
        typeName[i] = data[i].typeName;
      }
      let dataItem = {};
      // dataItem.value = ((data[i].errorCount / (data[i].errorCount + data[i].exceptionCount + data[i].normalCount)) * 100).toFixed(2);
      if(errorTotal == 0){
        dataItem.value = 0;
      } else {
        dataItem.value = ((data[i].errorTraceCount / errorTotal) * 100).toFixed(2);
      }
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
          center: ['55%', '50%'],
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
        $('#errorPie').trigger('getServiceWithInstanceOfTSCByRequestType', params.data.name);
        // $('#errorBar').hide();
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
    errorBar.clear();
    let barData = [];
    let typeName = [];
    let errorTotal = 0;
    for(let i = 0; i < data.length; i++){
      errorTotal += data[i].errorTraceCount;
    }
    for(let i = 0; i < data.length; i++){
      if(type == 1){
        typeName[i] = data[i].requestType;
      }
      else if(type == 2){
        typeName[i] = data[i].typeName;
      }
      let dataItem = {};
      // dataItem.value = ((data[i].errorCount / (data[i].errorCount + data[i].exceptionCount + data[i].normalCount)) * 100).toFixed(2);
      if(errorTotal == 0){
        dataItem.value = 0;
      } else {
        dataItem.value = ((data[i].errorTraceCount / errorTotal) * 100).toFixed(2);
      }
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

  this.receiveServiceInstance = function(e, d){
    let errorBar = echarts.init(document.getElementById('errorBar'));
    errorBar.clear();

    let list = d.list || [];
    // console.log(list);
    let x =[], y = [], maxInstanceNum = 0;
    list.forEach(function(l, index){
      x[index] = l.serviceName;
      let instanceList = l.siwtscList || [];
      instanceList.forEach(function(i){
        // console.log(i.instanceNum);
        y[i.instanceNum - 1] = y[i.instanceNum - 1] ||
          {
            name:'instance:' + i.instanceNum,
            type:'bar',
            data:[],
            markPoint : {
              data : [
                {type : 'max', name: '最大值'},
                {type : 'min', name: '最小值'}
              ]
            }
          };
        let errorRate = (i.errorTraceCount/ (i.errorTraceCount + i.normalTraceCount)).toFixed(2);
        y[i.instanceNum - 1].data[index] = errorRate;
      });
    });

    // console.log("x=" );
    // console.log(JSON.stringify(x));
    // console.log("y=");
    // console.log(JSON.stringify(y));

    let options = {
      title : {
        text: '服务实例-错误率'
      },
      tooltip : {
        trigger: 'axis'
      },
      toolbox: {
        show : true,
        feature : {
          dataView : {show: true, readOnly: false},
          magicType : {show: true, type: ['line', 'bar']},
          restore : {show: true},
          saveAsImage : {show: true}
        }
      },
      calculable : true,
      xAxis : [
        {
          type : 'category',
          data : x,
          axisLabel: {
            interval:0,
            rotate:40
          }
        }
      ],
      yAxis : [
        {
          type : 'value',
          name : '错误率'
        }
      ],
      dataZoom: [
        {
          show: true,
          start: 0,
          end: 100
        },
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          show: true,
          yAxisIndex: 0,
          filterMode: 'empty',
          width: 30,
          height: '80%',
          showDataShadow: false,
          left: '93%'
        }
      ],
      series : y
    };

    errorBar.setOption(options);

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

    this.on( document, 'receiveServiceInstance', this.receiveServiceInstance);
  })

})
