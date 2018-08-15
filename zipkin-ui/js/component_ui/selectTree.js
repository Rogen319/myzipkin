import {component} from 'flightjs';
import $ from 'jquery';
import {traceTreeTemplate} from "../templates";
import {contextRoot} from '../publicPath';
import '../../libs/layer/layer';
import {showServiceInfo} from './InfoContent';
import {getLogByTraceID, currentTraceId, selectedTraceId} from '../component_data/log';


export default component(function selectTree() {

  this.praseRequestWithTraceID = function(requestWithTraceID){
    var data = [];
    var requestTypeList = requestWithTraceID.requestWithTraceInfoList;
    for (var i = 0; i < requestTypeList.length; i++) {
      var rootNode = {};
      rootNode.title = requestTypeList[i].requestType;
      rootNode.errorCount = requestTypeList[i].errorCount;
      rootNode.exceptionCount = requestTypeList[i].exceptionCount;
      rootNode.normalCount = requestTypeList[i].normalCount;
      rootNode.field = 'root';
      rootNode.candidate = true;
      rootNode.shade = (rootNode.errorCount /(rootNode.exceptionCount + rootNode.errorCount + rootNode.normalCount)) / 0.2;
      var traceTypeList = requestTypeList[i].traceTypeList;
      if(traceTypeList.length > 0){
        rootNode.open = false;
        var allType = [];
        for(var l = 0;l < traceTypeList.length;l++){
          var addNode =  {};
          addNode.title = traceTypeList[l].typeName;
          addNode.errorCount = traceTypeList[l].errorCount;
          addNode.exceptionCount = traceTypeList[l].exceptionCount;
          addNode.normalCount = traceTypeList[l].normalCount;
          addNode.field = 'traceType';
          addNode.candidate = true;
          addNode.shade = (addNode.errorCount /(addNode.exceptionCount + addNode.errorCount + addNode.normalCount)) / 0.2;
          var traceInfoList = traceTypeList[l].traceInfoList;
          if (traceInfoList.length > 0) {
            addNode.open = false;
            var allTrace = [];
            for (var j = 0; j < traceInfoList.length; j++) {
              var secondNode = {};
              secondNode.title = traceInfoList[j].traceId;
              secondNode.errorCount = traceInfoList[j].errorCount;
              secondNode.exceptionCount = traceInfoList[j].exceptionCount;
              secondNode.normalCount = traceInfoList[j].normalCount;
              secondNode.field = 'trace';
              secondNode.candidate = true;
              secondNode.shade = (secondNode.errorCount /(secondNode.exceptionCount + secondNode.errorCount + secondNode.normalCount)) / 0.2;
              var serviceList = traceInfoList[j].serviceWithCounts;
              if (serviceList.length > 0) {
                secondNode.open = false;
                var allService = [];
                for (var k = 0; k < serviceList.length; k++) {
                  var leafNode = {};
                  leafNode.title = serviceList[k].serviceName;
                  leafNode.errorCount = serviceList[k].errorCount;
                  leafNode.exceptionCount = serviceList[k].exceptionCount;
                  leafNode.normalCount = serviceList[k].normalCount;
                  leafNode.field = 'service';
                  leafNode.candidate = true;
                  leafNode.shade = (leafNode.errorCount /(leafNode.exceptionCount + leafNode.errorCount + leafNode.normalCount)) / 0.2;
                  allService[k] = leafNode;
                }
                secondNode.children = allService;
              }
              allTrace[j] = secondNode;
            }
            addNode.children = allTrace;
          }
          allType[l] = addNode;
        }
        rootNode.children = allType;
      }
      data[i] = rootNode;
    }
    return data;
  };

  this.initControlTree = function(){
    var showSelectTree = true;
    $('#selectTree').show();
    $('#controllTreeBtn').bind('click',function () {
      if(showSelectTree){
        showSelectTree = false;
        $('#selectTree').hide();
        $('#controllTree').css('margin-left','-10px');
        $(this).html('显示调用链菜单');
      }
      else{
        showSelectTree = true;
        $('#selectTree').show();
        $('#controllTree').css('margin-left','275px');
        $(this).html('隐藏调用链菜单');
      }
    });
  };

  this.nodeClick = function(box){
    box.find('.tree-node').click(function() {
      // 判断该节点是否开启
      if ($.trim($(this).find('.open').val()) === 'true') {
        // 已开启，则关闭节点
        $(this).next().slideUp(500,function () {
          $(this).children('[data-toggle="tooltip"]').tooltip('hide');
        });
        $(this).find('.open').val('false');
        $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
      }
      else {
        // 开启前关闭节点下的所有节点
        $(this).next().find('.tree-node').each(function() {
          $(this).next().css('display', 'none');
          $(this).find('.open').val('false');
          $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        });

        // 已关闭，则开启节点
        $(this).find('.open').val('true');
        $(this).find('.status').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
        // 开启节点下的节点

        $(this).next().slideDown(500,function () {
          $(this).children('li').each(function () {
            $(this).children('a').children('span').tooltip();
          });
        });
      }
      if ($.trim($(this).find('.field').html()) === 'root'){
        let t = $.trim($(this).find('.title').html());
        $('#trace-tree').find('.tree-node').each(function() {
          if ($.trim($(this).find('.field').html()) === 'root'){
            if ($.trim($(this).find('.title').html()) !== t) {
              $(this).css('color', '');
              $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
              $(this).next().slideUp(500,function () {
                $(this).children('[data-toggle="tooltip"]').tooltip('hide');
              });
              $(this).find('.open').val('false');
              $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
            }
          }
          else if ($.trim($(this).find('.field').html()) === 'trace'){
            $(this).css('color' , '');
            $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
            $(this).next().slideUp(500,function () {
              $(this).children('[data-toggle="tooltip"]').tooltip('hide');
            });
            $(this).find('.open').val('false');
            $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
          }
        });
      }
      // 判断是不是调用链
      if ($.trim($(this).find('.field').html()) === 'trace') {
        let t = $.trim($(this).find('.title').html());
        let allService = [];
        try {
          allService = JSON.parse($.trim($(this).find('.serviceList').html()));
        } catch (e) {
        }
        const allServiceName = [];
        for (let i = 0; i < allService.length; i++) {
          allServiceName[i] = allService[i].title;
        }
        if(selectedTraceId.length >= 2){
          if(selectedTraceId.contains(t)){
            for(let i=0;i<2;i++){
              if(selectedTraceId[i] === t){
                currentTraceId = i;
                break;
              }
            }
          }
          else{
            if(currentTraceId == 0){
              selectedTraceId[1] = t;
              selectedServices[1] = allServiceName;
              currentTraceId = 1;
            }
            else{
              selectedTraceId[0] = t;
              selectedServices[0] = allServiceName;
              currentTraceId = 0;
            }
          }
        }
        else if(selectedTraceId.length === 1){
          if(selectedTraceId[0] !== t){
            selectedTraceId[1] = t;
            selectedServices[1] = allServiceName;
            currentTraceId = 1;
          }
        }
        else {
          selectedTraceId[0] = t;
          selectedServices[0] = allServiceName;
          currentTraceId = 0;
        }

        $(this).parent().parent('ul').parent().find('.tree-node').each(function() {
          if ($.trim($(this).find('.field').html()) === 'trace') {
            if ($.trim($(this).find('.title').html()) !== t) {
              $(this).css('color' , '');
              $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
              $(this).next().slideUp(500,function () {
                $(this).children('[data-toggle="tooltip"]').tooltip('hide');
              });
              $(this).find('.open').val('false');
              $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
            }
            else {
              $(this).css({'background-color': '#777777', 'color': '#FFFFFF'});
            }
          }
        });
        if ($.trim($(this).find('.open').val()) === 'true') {
          this.trigger(document,'hightLightAndShowLog');
          // hightLightAndShowLog();
        }
      }
      else if ($.trim($(this).find('.field').html()) === 'service') {
        const serviceName = $.trim($(this).find('.title').html());
        if(selectedServices.length >= 2){
          if(selectedServices[0].contains(serviceName) && selectedServices[1].contains(serviceName)){
            showServiceInfo(selectedTraceId[currentTraceId],serviceName,1);
          }
          else if(selectedServices[0].contains(serviceName)){
            showServiceInfo(selectedTraceId[0],serviceName,0);
          }
          else if(selectedServices[1].contains(serviceName)){
            showServiceInfo(selectedTraceId[1],serviceName,0);
          }
        }
        else if(selectedServices.length == 1){
          if(selectedServices[0].contains(serviceName)){
            showServiceInfo(selectedTraceId[0],serviceName,0);
          }
        }
      }
    });
  };

  this.initSortClick = function(){
    $('#sortByURI').bind('click',function () {
      if(currentSort == 0){
        $(this).children('i').hide();
        $('#sortByTime').children('i').show();
        currentSort = 1;
        const loading = layer.load(2,{
          shade: 0.3,
          scrollbar: false,
          zIndex: 20000000
        });
        getLogByTraceID(selectedTraceId[currentTraceId],currentSort,loading);
      }
    });
    $('#sortByTime').bind('click',function () {
      if(currentSort === 1){
        $(this).children('i').hide();
        $('#sortByURI').children('i').show();
        currentSort = 0;
        const loading = layer.load(2,{
          shade: 0.3,
          scrollbar: false,
          zIndex: 20000000
        });
        getLogByTraceID(selectedTraceId[currentTraceId],currentSort,loading);
      }
    });
  };

  this.render = function(data, loading) {
    console.log(data);
    const model = {tData:data};
    this.$node.html(traceTreeTemplate({
      contextRoot,
      ...model
    }));
    layer.close(loading);
    $('#controllTree').show();
    $('#trace-tree').children('li').each(function () {
      $(this).children('a').children('span').tooltip();
    });
    this.initControlTree();
    this.nodeClick($('#trace-tree'));
    this.initSortClick();
  };


  this.after('initialize', function afterInitialize() {

    this.on(document, 'receiveLogWithTraceIDByTimeRange', function(ev, data) {
      this.render(this.praseRequestWithTraceID(data.data),data.loading);
    });

  });

});
