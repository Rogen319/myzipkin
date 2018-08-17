import {component} from 'flightjs';
import $ from 'jquery';
import {traceTreeTemplate} from "../templates";
import {contextRoot} from '../publicPath';
import '../../libs/layer/layer';
import {showServiceInfo} from './infoContent';
import {globalVar} from '../component_data/log';


export default component(function selectTree() {

  Array.prototype.contains = function(element) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == element) {
        return true;
      }
    }
    return false;
  };

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
      rootNode.traceTypeList = requestTypeList[i].traceTypeList;
      rootNode.traceTypeListString = JSON.stringify(requestTypeList[i].traceTypeList);
      rootNode.shade = (rootNode.errorCount /(rootNode.exceptionCount + rootNode.errorCount + rootNode.normalCount)) / 0.2;
      rootNode.isService = false;
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
          addNode.traceInfoList = traceTypeList[l].traceInfoList;
          addNode.traceInfoListString = JSON.stringify(traceTypeList[l].traceInfoList);
          addNode.shade = (addNode.errorCount /(addNode.exceptionCount + addNode.errorCount + addNode.normalCount)) / 0.2;
          addNode.isService = false;
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
              secondNode.isService = false;
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
                  leafNode.isService = true;
                  allService[k] = leafNode;
                }
                secondNode.children = allService;
                secondNode.serviceListString = JSON.stringify(secondNode.children);
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

        //图表联动
        if($.trim($(this).find('.field').html()) === 'root'){
          $(this).trigger('returnLastLevel');
        }
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

        //图表联动
        if($.trim($(this).find('.field').html()) === 'root'){
          $(this).trigger('initPie',{data:JSON.parse($.trim($(this).find('.traceTypeList').html())), type:2});
          // initPie(JSON.parse($.trim($(this).find('.traceTypeList').html())),2);
          $('#errorBar').hide();
          // $('#errorBar').html('');
        }

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
        if(globalVar.getSelectedTraceId().length >= 2){
          if(globalVar.getSelectedTraceId().contains(t)){
            for(let i=0;i<2;i++){
              if(globalVar.getSelectedTraceId()[i] === t){
                globalVar.setCurrentTraceId(i);
                break;
              }
            }
          }
          else{
            if(globalVar.getCurrentTraceId() == 0){
              // globalVar.getSelectedTraceId()[1] = t;
              globalVar.setSelectedTraceId(1, t);
              // globalVar.getSelectedServices()[1] = allServiceName;
              globalVar.setSelectedServices(1, allServiceName);
              globalVar.setCurrentTraceId(1) ;
            }
            else{
              // globalVar.getSelectedTraceId()[0] = t;
              globalVar.setSelectedTraceId(0, t);
              // globalVar.getSelectedServices()[0] = allServiceName;
              globalVar.setSelectedServices(0, allServiceName);
              globalVar.setCurrentTraceId(0) ;
            }
          }
        }
        else if(globalVar.getSelectedTraceId().length === 1){
          if(globalVar.getSelectedTraceId()[0] !== t){
            // globalVar.getSelectedTraceId()[1] = t;
            globalVar.setSelectedTraceId(1, t);
            // globalVar.getSelectedServices()[1] = allServiceName;
            globalVar.setSelectedServices(1, allServiceName);
            globalVar.setCurrentTraceId(1);
          }
        }
        else {
          // globalVar.getSelectedTraceId()[0] = t;
          globalVar.setSelectedTraceId(0, t);
          // globalVar.getSelectedServices()[0] = allServiceName;
          globalVar.setSelectedServices(0, allServiceName);
          globalVar.setCurrentTraceId(0);
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
          $(this).trigger('hightLightAndShowLog');
          // hightLightAndShowLog();
        }
      }
      else if ($.trim($(this).find('.field').html()) === 'service') {
        const serviceName = $.trim($(this).find('.title').html());
        if(globalVar.getSelectedServices().length >= 2){
          if(globalVar.getSelectedServices()[0].contains(serviceName) && globalVar.getSelectedServices()[1].contains(serviceName)){
            showServiceInfo(globalVar.getSelectedTraceId()[globalVar.getCurrentTraceId()],serviceName,1);
          }
          else if(globalVar.getSelectedServices()[0].contains(serviceName)){
            showServiceInfo(globalVar.getSelectedTraceId()[0],serviceName,0);
          }
          else if(globalVar.getSelectedServices()[1].contains(serviceName)){
            showServiceInfo(globalVar.getSelectedTraceId()[1],serviceName,0);
          }
        }
        else if(globalVar.getSelectedServices().length == 1){
          if(globalVar.getSelectedServices()[0].contains(serviceName)){
            showServiceInfo(globalVar.getSelectedTraceId()[0],serviceName,0);
          }
        }
      }
    });
  };

  this.render = function(data) {
    const model = {tData:data};
    this.$node.html(traceTreeTemplate({
      contextRoot,
      ...model
    }));
    $('#controllTree').show();
    $('#trace-tree').children('li').each(function () {
      $(this).children('a').children('span').tooltip();
    });
    this.trigger('closeAll');
    this.nodeClick($('#trace-tree'));
    // this.initSortClick();
    this.initControlTree();
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


  this.after('initialize', function afterInitialize() {

    this.on(document, 'closeAll', this.closeAll);

    this.on(document, 'receiveLogWithTraceIDByTimeRange', function(ev, data) {
      this.render(this.praseRequestWithTraceID(data));
    });

  });

});
