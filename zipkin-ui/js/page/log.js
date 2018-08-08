import moment from 'moment';
import {component} from 'flightjs';
import $ from 'jquery';
import queryString from 'query-string';
import DependencyData from '../component_data/dependency';
import LogGraphUI from '../component_ui/logGraphy';
import ServiceDataModal from '../component_ui/serviceDataModal';
import TimeStampUI from '../component_ui/timeStamp';
import GoToLogUI from '../component_ui/goToLog';
import SelectTree from '../component_ui/selectTree';
import {logTemplate} from '../templates';
import {i18nInit} from '../component_ui/i18n';
import '../../libs/layer/layer';

const LogPageComponent = component(function LogPage() {
  this.after('initialize', function() {
    const loading = layer.load(2,{
      shade: 0.3,
      scrollbar: false,
      zIndex: 20000000
    });
    try {
      window.document.title = 'Zipkin - Log';
      this.trigger(document, 'navigate', {route: 'zipkin/log'});

      this.$node.html(logTemplate());
      const {startTs, endTs} = queryString.parse(location.search);
      $('#endTs').val(endTs || moment().valueOf());
      // When #1185 is complete, the only visible granularity is day
      $('#startTs').val(startTs || moment().valueOf() - 86400000);
      DependencyData.attachTo('#dependency-container');
      LogGraphUI.attachTo('#dependency-container', {config: this.attr.config});
      ServiceDataModal.attachTo('#service-data-modal-container');
      TimeStampUI.attachTo('#end-ts');
      TimeStampUI.attachTo('#start-ts');
      GoToLogUI.attachTo('#dependency-query-form');
      SelectTree.attachTo('#select-tree-area');
      i18nInit('dep');
      $(document.body).css('overflow-y','hidden');
      getRequestWithTraceIDByTimeRange(loading);
    } catch (e) {
      layer.close(loading);
    }
  });
});

var currentTraceId = 0;
var selectedTraceId = [];
var selectedServices = [];
var address = 'http://10.141.212.25';
//var serviceInstanceNames = new Array();
//var globeTraceLogData = {};
var currentSort = 1;

Array.prototype.contains = function(element) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == element) {
      return true;
    }
  }
  return false;
};

function showSelectTree(requestWithTraceID) {
  let html = '<div id="trace-tree">';
  var data = praseRequestWithTraceID(requestWithTraceID);
  html += loadTree(data).html();
  html += '</div>';
  $('#selectTree').html(html);
  $('#controllTree').show();
  $('#trace-tree').children('li').each(function () {
    $(this).children('a').children('span').tooltip();
  });
  nodeClick($('#trace-tree'));
  initSortClick();
  initControlTree();
}
function initControlTree(){
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
}
function initSortClick() {
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
}

function loadTree(tData) {
  var ul = $('<ul>');
  for (var i = 0; i < tData.length; i++) {
    var li = $('<li>').appendTo(ul);
    var node = $('<a>').appendTo(li);
    var icon = $('<i>').css('margin-right', '5').appendTo(node);
    let title = $('<span>').addClass('title').html(tData[i].title).appendTo(node);
    $('<div></div>').addClass('field').html(tData[i].field).css('display','none').appendTo(node);
    if(tData[i].field !== 'service')
      title.attr('data-toggle', 'tooltip').attr('data-placement', 'right').attr('title', 'Error:' + tData[i].errorCount + ' Exception:' + tData[i].exceptionCount +" Normal:"+tData[i].normalCount);
    else
      title.attr('data-toggle', 'tooltip').attr('data-placement', 'bottom').attr('title', 'Error:' + tData[i].errorCount + ' Exception:' + tData[i].exceptionCount +" Normal:"+tData[i].normalCount);
      let shade = (tData[i].errorCount /(tData[i].exceptionCount + tData[i].errorCount + tData[i].normalCount)) / 0.2;
      node.css('background-color','rgba(242,222,222,'+ shade +')');
      node.hover(function () {
        node.css('background-color','#cccccc');
      },function () {
        node.css('background-color','rgba(242,222,222,'+ shade +')');
      });
      $('<div></div>').addClass('shade').html(shade).css('display','none').appendTo(node);
    // }
    if (tData[i].field === 'trace') {
      $('<div></div>').addClass('serviceList').html(JSON.stringify(tData[i].children)).css('display', 'none').appendTo(node);
    }
      // 处理有子节点的
    if (tData[i].children != undefined) {
        // 添加图标样式
      icon.addClass(tData[i].open ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o');
      icon.addClass('status');
      node.addClass('tree-node');

        // 添加标记节点是否打开
      $('<input>').addClass('open').val(tData[i].open).css('display', 'none').appendTo(node);

        // 递归遍历子节点
      var $child = loadTree(tData[i].children);
      if (tData[i].open) {
        $child.show().appendTo(li);
      } else {
        $child.hide().appendTo(li);
      }
    }
    else {
      icon.addClass('fa fa-building-o').attr('aria-hidden','true');
      node.addClass('tree-node');
        // 叶子节点新增是否可选
      //$('<input>').addClass('candidate').val(tData[i].candidate).css('display', 'none').appendTo(li);
    }
  }
  return ul;
}

function nodeClick(box) {
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
      initServiceClick();
      if ($.trim($(this).find('.open').val()) === 'true') {
        hightLightAndShowLog();
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
}

function hightLightAndShowLog() {
  highlightServices();
  showNoticeWindow();
  $('#sortByURI').children('i').hide();
  $('#sortByTime').children('i').show();
  const loading = layer.load(2,{
    shade: 0.3,
    scrollbar: false,
    zIndex: 20000000
  });
  getLogByTraceID(selectedTraceId[currentTraceId],1,loading);
}

function showNoticeWindow() {
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
        hightLightAndShowLog();
        locateTraceInSelectTree();
      });
      $(this).find('.close').bind('click',function () {
        selectedTraceId.splice(i,1);
        selectedServices.splice(i,1);
        if(selectedTraceId.length >= 1){
          currentTraceId = 0;
          hightLightAndShowLog();
          locateTraceInSelectTree();
        }
        else {
          $('#logEntrance').hide();
          $('#logVis').hide();
          highlightServices();
          $('#selectedTrace').html('');
          closeAll();
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
}

function locateTraceInSelectTree() {
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
}

function closeAll() {
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

}

function praseRequestWithTraceID(requestWithTraceID) {
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
}

// 高亮
function highlightServices() {
  initialServiceColor();
  let nodes = document.getElementsByClassName('node enter');
  for (let i = 0; i < nodes.length; i++) {
    let tn =  nodes[i].getAttribute('data-node');
    if(selectedTraceId.length >= 2){
      if (isInArray(selectedServices[currentTraceId],tn)) {
        let node = nodes[i].getElementsByTagName('rect')[0];
        node.setAttribute('fill', '#0FF0F1');
      }
      let t = currentTraceId === 0 ? 1 : 0;
      if (isInArray(selectedServices[t], tn)) {
        let node = nodes[i].getElementsByTagName('rect')[0];
        node.setAttribute('fill', '#ADFF2F');
      }
      if(isInArray(selectedServices[currentTraceId], tn) && isInArray(selectedServices[t], tn)){
        let node = nodes[i].getElementsByTagName('rect')[0];
        node.setAttribute('fill', '#1E90FF');
      }
    }
    else if(selectedTraceId.length == 1){
      if (isInArray(selectedServices[currentTraceId],tn)) {
        let node = nodes[i].getElementsByTagName('rect')[0];
        node.setAttribute('fill', '#0FF0F1');
      }
    }
  }
}

function isInArray(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (value === arr[i]) {
      return true;
    }
  }
  return false;
}

function initialServiceColor() {
  let nodes = document.getElementsByClassName('node enter');
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i].getElementsByTagName('rect')[0];
    node.setAttribute('fill', '#FFF');
  }
}

function getRequestWithTraceIDByTimeRange(loading) {
  let time = {};
  let parm = window.location.search;
  if (parm.length > 1){
    parm = parm.substring(1,parm.length);
    time.endTime = Number(parm.split('&')[0].split('=')[1]) ;
    time.lookback = time.endTime - Number(parm.split('&')[1].split('=')[1]) ;
  }
  else{
    time.endTime = (new Date()).getTime();
    time.lookback = 86400000;
  }
  $.ajax({
    async: true,
    url: address + ':17319/getRequestWithTraceIDByTimeRange',
    type: 'post',
    data: JSON.stringify(time),
    dataType: 'json',
    contentType: "application/json",
    success: function (data) {
      showSelectTree(data);
      layer.close(loading);
    },
    error: function (event) {
      layer.msg('获取调用信息失败',{icon:2});
    }
  });
}

function getLogByTraceID(traceId,type,loading) {
  $.ajax({
    async: true,
    url: address + ':16319/getLogByTraceId/'+traceId+"/"+type,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      initLogVis(data,loading);
      // globeTraceLogData = result;
    },
    error: function (event) {
      layer.msg('获取调用链日志失败',{icon:2});
    }
  });
}

function initLogVis(traceLog,loading) {
  let html = '';
  //globeTraceLogData = traceLog;
  let logs = traceLog.logs;
  for (let i = 0;i < logs.length;i++) {
    html += '<tr>'+
      ' <td class = "col-sm-1 col-md-1">'+
      '   <button class="btn btn-default nodeBtn">' +
      logs[i].serviceInfo.node.name +
      '     <div class = "nodeInfo">'+ JSON.stringify(logs[i].serviceInfo.node) +'</div>'+
      '   </button>'+
      '</td>'+
      ' <td class = "col-sm-1 col-md-1">' + logs[i].serviceInfo.serviceName +'</td>'+
      ' <td class = "col-sm-2 col-md-2">'+
      '   <button class="btn btn-default serviceInstanceBtn">' +
            logs[i].serviceInfo.instanceInfo.instanceName +
      '     <div class = "serviceInstanceInfo">'+ JSON.stringify(logs[i].serviceInfo.instanceInfo) +'</div>'+
      '   </button>'+
      ' </td>' +
      ' <td class = "col-sm-1 col-md-1">'+ logs[i].uri +'</td>'+
      ' <td class = "col-sm-1 col-md-1">'+ logs[i].logType +'</td>'+
      ' <td class = "col-sm-1 col-md-1" style="text-align: left">'+ logs[i].timestamp +'</td>'+
      ' <td class = "col-sm-5 col-md-5 ';
    if(logs[i].isError == 1)
      html += 'bg-danger';
    else if (logs[i].isError == 2)
      html += 'bg-warning';
      html+= '" style="text-align: left">'+ logs[i].logInfo +'</td>'+
      '</tr>';
      layer.close(loading);
  }

  if(logs.length > 0) {
    $('#logVis').css('height', window.screen.height * 0.3 + 'px');
    $('#selectTree').css('height', window.screen.height * 0.39 + 'px');
    $('#errorCount').html(traceLog.errorCount);
    $('#exceptionCount').html(traceLog.exceptionCount);
    $('#normalCount').html(traceLog.normalCount);
    $('#logEntrance').css('bottom', window.screen.height * 0.3 + 'px');
    $('#logTable').html(html);
    $('#logEntrance').show();
    $('#logVis').show();
    listenMove($('#logVis'),$('#logEntrance'));
    initControlLogVis();
    keepTraceOn();
    optTableStyle();
    $('#logTable').find('.nodeBtn').each(function () {
      let node = JSON.parse($(this).find('.nodeInfo').html());
      $(this).click(function () {
          showNodeInfo(node);
      });
    });
    $('#logTable').find('.serviceInstanceBtn').each(function () {
      let serviceInstance = JSON.parse($(this).find('.serviceInstanceInfo').html());
      $(this).click(function () {
        showServiceInstanceInfo(serviceInstance);
      });
    });
  }
}

function keepTraceOn() {
  let tbody = $('#logTable').children('tr').eq(0);
  let thead = $('#logHead').children('tr').eq(0);
  for (let i = 0; i < tbody.children('td').length; i++) {
    let thWidth = tbody.children('td').eq(i).css('width');
    thead.children('th').eq(i).css('width', thWidth+'');
  }
  let thHeight = thead.children('th').eq(0).css('height');
  $('#logTable').css('padding-top', thHeight+'');
}

function initControlLogVis() {
  var showLogVis = false;
  $('#controlLogVis').html('隐藏调用链日志');
  $('#controlLogVis').bind('click',function () {
    if(showLogVis){
      $('#logVis').css('height', window.screen.height * 0.3 + 'px');
      $('#logEntrance').css('bottom', window.screen.height * 0.3 + 'px');
      $(this).html('隐藏调用链日志');
      showLogVis = false;
    }
    else{
      $('#logVis').css('height', '0');
      $('#logEntrance').css('bottom', '0');
      $(this).html('显示调用链日志');
      showLogVis = true;
    }
  })
}

function listenMove(el,bn) {
  var y = 0;
  $(el).mousedown(function (e) {
    y = e.clientY + $('#logVis').height();
    el.setCapture ? (
      el.setCapture(),
        el.onmousemove = function (ev)
        {
          mouseMove(ev || event);
        },
        el.onmouseup = mouseUp
    ) : (
      $(document).bind('mousemove', mouseMove).bind('mouseup', mouseUp)
    );
    e.preventDefault();
  });
  function mouseMove(e){
    el.css('height', y - e.clientY + 'px');
    bn.css('bottom', y - e.clientY + 'px');
    keepTraceOn();
  }
  function mouseUp()
  {
    el.releaseCapture ? (
      el.releaseCapture(),
        el.onmousemove = el.onmouseup = null
    ) : (
      $(document).unbind('mousemove', mouseMove).unbind('mouseup', mouseUp)
    );
  }
}

function optTableStyle() {
  let content = [];
  let cell = [];
  $('#logTable').children('tr').each(function (i) {
    $(this).children('td').each(function (j) {
      let temp = $.trim($(this).text());
      if(content[j] === undefined || content[j] == null || content[j] === '' || i <= 0){
        content[j] = temp;
        $(this).attr('rowSpan','1');
        cell[j] = $(this);
      }
      else {
        if(temp === content[j]){
          $(this).hide();
          let temp2 = Number(cell[j].attr('rowSpan')) + 1;
          cell[j].attr('rowSpan', temp2+'');
        }
        else{
          content[j] = temp;
          $(this).attr('rowSpan', '1');
          cell[j] = $(this);
          for(let k=j+1;k<6;k++) {
            content[k] = '';
          }
        }
      }
    });

  });
}

function showNodeInfo(node) {
  let html = '<div class="container node-info">' +
    '    <table class="table table-striped">' +
    '      <tr>' +
    '        <th>Role</th>' +
    '        <td>'+ node.role +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Name</th>' +
    '        <td>'+ node.name +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>IP</th>' +
    '        <td>'+ node.ip +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Status</th>' +
    '        <td>'+ node.status +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>kubeProxyVersion</th>' +
    '        <td>'+ node.kubeProxyVersion +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>kubeletVersion</th>' +
    '        <td>' + node.kubeletVersion +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>operatingSystem</th>' +
    '        <td>'+ node.operatingSystem +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>osImage</th>' +
    '        <td>' + node.osImage +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>containerRuntimeVersion</th>' +
    '        <td>' + node.containerRuntimeVersion +'</td>' +
    '      </tr>' +
    '    </table>' +
    '</div>';
  layer.open({
    type: 1,
    title: 'Node Info',
    content: html,
    area: ['370px','410px'],
    resize: false,
    shadeClose: true
  });
}

function showServiceInstanceInfo(serviceInstance) {
  let ports = "";
  for(let i=0;i<serviceInstance.container.ports.length;i++){
    if (i !== 0)
      ports += ',';
    ports += serviceInstance.container.ports[i].containerPort + '/' + serviceInstance.container.ports[i].protocol;
  }
  let html = '<div class="container node-info">' +
    '    <table class="table table-striped">' +
    '      <tr>' +
    '        <th>InstanceName</th>' +
    '        <td>'+ serviceInstance.instanceName +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Status</th>' +
    '        <td>'+ serviceInstance.status +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Container Name</th>' +
    '        <td>'+ serviceInstance.container.name +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Container Image Name</th>' +
    '        <td>'+ serviceInstance.container.imageName +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Container Image Version</th>' +
    '        <td>'+ serviceInstance.container.imageVersion +'</td>' +
    '      </tr>' +
    '      <tr>' +
    '        <th>Container Ports</th>' +
    '        <td>' + ports +'</td>' +
    '      </tr>' +
    '    </table>' +
    '</div>';
  layer.open({
    type: 1,
    title: 'Service Instance Info',
    content: html,
    area: ['380px','350px'],
    resize: false,
    shadeClose: true
  });
}

function initServiceClick() {
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
}

function showServiceInfo(traceId,serviceName,type){
  let html1 = '<div class="container-fluid deOffset">'+
      '<div class="row">'+
        '<div class="col-md-2" >'+
          // '<p class="lead">Instances</p>'+
          '<div id = "instanceList1"></div>'+
        '</div>'+
        '<div class="col-md-10">'+
          '<div id = "instanceInformation1"></div>'+
        '</div>'+
      '</div>'+
    '</div>';
  let html2 = '<div class="container-fluid deOffset">'+
    '<div class="row">'+
    '<div class="col-md-2" >'+
    // '<p class="lead">Instances</p>'+
    '<div id = "instanceList2"></div>'+
    '</div>'+
    '<div class="col-md-10">'+
    '<div id = "instanceInformation2"></div>'+
    '</div>'+
    '</div>'+
    '</div>';

  let content = [];
  let temp = {};
  temp.title = traceId;
  temp.content = html1;
  content[0] = temp;
  if(type === 1){
    let temp2 = {};
    temp2.title = currentTraceId === 0 ? selectedTraceId[1]:selectedTraceId[0];
    temp2.content = html2;
    content[1] = temp2;
  }

  layer.tab({
    shade: 0.3,
    shadeClose: true,
    area: ['1250px', '600px'],
    closeBtn: 1,
    anim: 0,
    fixed: false,
    tab: content
  });
  const loading = layer.load(2,{
    shade: 0.3,
    scrollbar: false,
    zIndex: 20000000
  });
  let domMark1 = [];
  domMark1[0] = $('#instanceList1');
  domMark1[1] = $('#instanceInformation1');
  getLogByTraceIDAndServiceName(domMark1,traceId,serviceName,loading);
  if(type === 1){
    $('.layui-layer-tabmain').eq(0).children().each(function (i) {
      if(i === 1)
        $(this).hide();
    });
    let domMark2 = [];
    domMark2[0] = $('#instanceList2');
    domMark2[1] = $('#instanceInformation2');
    getLogByTraceIDAndServiceName(domMark2,currentTraceId === 0 ? selectedTraceId[1]:selectedTraceId[0],serviceName,loading);
  }
}

function getLogByTraceIDAndServiceName(el,traceId,serviceName,loading) {
  let info = {};
  info.serviceName = serviceName;
  info.traceId = traceId;
  $.ajax({
    async: true,
    url: address + ':16319/getLogByServiceNameAndTraceId',
    type: 'post',
    data: JSON.stringify(info),
    contentType: "application/json",
    dataType: 'json',
    success: function (data) {
      layer.close(loading);
      initialInfo(el,data,0);
    },
    error: function (event) {
      layer.msg('获取服务日志失败',{icon:2});
    }
  });
}


function initialInfo(el,data,chosen) {
  let instanceWithLogList = data.instanceWithLogList;
  if(instanceWithLogList.length <= 0){
    let html = "<h3>不存在日志信息</h3>";
    el[1].html(html);
    return;
  }
  let instanceName = [];
  for(let i = 0;i < instanceWithLogList.length; i++)
    instanceName[i] = instanceWithLogList[i].serviceInfo.instanceInfo.instanceName;
  initialInstanceList(el[0],data,instanceName,chosen);
  initialInstanceLog(el[1],instanceWithLogList[chosen]);
}

function initialInstanceList(el,data,instanceName,chosen) {
  let html = '<ul class="list-group">';
  for(let i = 0; i < instanceName.length; i++) {
    html += '<li class="list-group-item ';
    if(i === chosen)
      html += 'active';
    html += '">' + instanceName[i] + '</li>';
  }
  html += '</ul>';
  el.html(html);
  el.children('ul').eq(0).children('li').each(function(i) {
    $(this).bind('click', function() {
      initialInfo(type,data, i);
    });
  });
}

function initialInstanceLog(el,data) {
  let ports = "";
  for(let i=0;i<data.serviceInfo.instanceInfo.container.ports.length;i++){
    if (i !== 0)
      ports += ',';
    ports += data.serviceInfo.instanceInfo.container.ports[i].containerPort + '/' + data.serviceInfo.instanceInfo.container.ports[i].protocol;
  }
  let html = '<div class="container-fluid serviceInfoTable">' +
    '<div class="row">' +
    '<div class="col-sm-6 col-md-6">' +
    '<div class="lead">Instance Information</div>' +
    '<table class="table table-hover table-condensed">' +
    '<tr>'+
    '   <th colspan="2" class="col-sm-4 col-md-4">Instance Name</th>' +
    '   <td class="col-sm-8 col-md-8">'+data.serviceInfo.instanceInfo.instanceName+'</td>' +
    '</tr>' +
    '<tr>' +
    '   <th colspan="2" class="col-sm-4 col-md-4">Service Name</th>' +
    '   <td class="col-sm-8 col-md-8">'+data.serviceInfo.serviceName+'</td>' +
    '</tr>' +
    '<tr>' +
    '   <th colspan="2" class="col-sm-4 col-md-4">Status</th>' +
    '   <td class="col-sm-8 col-md-8">' + data.serviceInfo.instanceInfo.status + '</td>' +
    '</tr>' +
    '<tr>' +
    '   <th rowspan="4" class="col-sm-2 col-md-2">Container</th>' +
    '   <th class="col-sm-2 col-md-2">Name</th>' +
    '   <td class="col-sm-8 col-md-8">' + data.serviceInfo.instanceInfo.container.name + '</td>' +
    '</tr>'+
    '<tr>' +
    '   <th class="col-sm-2 col-md-2">ImageName</th>' +
    '   <td class="col-sm-8 col-md-8">' + data.serviceInfo.instanceInfo.container.imageName + '</td>' +
    '</tr>'+
    '<tr>' +
    '   <th class="col-sm-2 col-md-2">ImageVersion</th>' +
    '   <td class="col-sm-8 col-md-8">' + data.serviceInfo.instanceInfo.container.imageVersion + '</td>' +
    '</tr>'+
    '<tr>' +
    '   <th  class="col-sm-2 col-md-2">Ports</th>' +
    '   <td class="col-sm-8 col-md-8">' + ports + '</td>' +
    '</tr>'+
    '</table>' +
    '</div>' +
    '<div class="col-sm-6 col-md-6">' +
    '<div class="lead">Node Information</div>' +
    '<table class="table table-hover table-condensed col-sm-6 col-md-6">' +
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">Role</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.role + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">Name</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.name + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">IP</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.ip + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">Status</th>'+
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.status + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">kubeProxyVersion</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.kubeProxyVersion + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">kubeletVersion</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.kubeletVersion + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">operatingSystem</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.osImage + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">osImage</th>' +
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.role + '</td>' +
    '   </tr>'+
    '   <tr>' +
    '       <th class="col-sm-4 col-md-4">containerRuntimeVersion</th>'+
    '       <td class="col-sm-8 col-md-8">' + data.serviceInfo.node.containerRuntimeVersion + '</td>' +
    '   </tr>'+
    '</table>' +
    '</div>' +
    '</div> '+
    '</div>' +
    '<hr/>' +
    '<div class="container-fluid">'+
    '<p class="lead">Log Information</p>'+
    '<table class="table table-hover table-condensed table-bordered keepIn">'+
    '<tr>'+
    '   <th class="col-sm-2 col-md-2">Time</th>'+
    '   <th class="col-sm-2 col-md-2">logType</th>'+
    '   <th class="col-sm-2 col-md-2">Uri</th>'+
    '   <th class="col-sm-6 col-md-6">logInfo</th>'+
    '</tr>';
  for(let i = 0;i < data.logs.length; i++){
    html += '<tr>' +
      '  <td class="col-sm-2 col-md-2">' +
          data.logs[i].timestamp +
      '  </td>' +
      '  <td class="col-sm-2 col-md-2">' +
          data.logs[i].logType +
      '  </td>' +
      '  <td class="col-sm-2 col-md-2">' +
          data.logs[i].uri +
      '  </td>' +
      '  <td class="col-sm-6 col-md-6 ';
    if(data.logs[i].isError === 1)
      html += 'bg-danger';
    else if (data.logs[i].isError === 2)
      html += 'bg-warning';
    html += '">' +
          data.logs[i].logInfo +
      '  </td>' +
      '</tr>';
  }
  html +=  '</table>' +
    '</div>';
  el.html(html);
}


// function getInstanceInfo(data, serviceName){
//   let instanceInfos = new Map();
//   let serviceInstanceNames2 = new Array();
//   for (let i = 0; i < data.logs.length; i++) {
//     let log = data.logs[i];
//
//     if (logs.serviceInfo.serviceName === serviceName) {
//       if(!serviceInstanceNames2.contains(log.serviceInfo.instanceInfo.instanceName)){
//         serviceInstanceNames2.push(log.serviceInfo.instanceInfo.instanceName);
//         let instanceInfo = {};
//         let traceInfo = {};
//         let serviceInfo = {};
//         let nodeInfo = {};
//         let logInfo = {}
//         let logInfos = new Array();
//
//         traceInfo.traceId = log.traceInfo.traceId;
//         traceInfo.spanId = log.traceInfo.spanId;
//         traceInfo.parentSpanId = log.traceInfo.parentSpanId;
//
//         serviceInfo.serviceName = log.serviceInfo.serviceName;
//         serviceInfo.instanceName = log.serviceInfo.instanceInfo.instanceName;
//         serviceInfo.instanceStatus = log.serviceInfo.instanceInfo.status;
//         serviceInfo.containerName = log.serviceInfo.instanceInfo.container.name;
//         serviceInfo.imageName = log.serviceInfo.instanceInfo.container.imageName;
//         serviceInfo.imageVersion = log.serviceInfo.instanceInfo.container.imageVersion;
//         serviceInfo.containerPort = log.serviceInfo.instanceInfo.container.ports[0].containerPort;
//         serviceInfo.containerPrococol = log.serviceInfo.instanceInfo.container.ports[0].protocol;
//
//         nodeInfo.role = log.serviceInfo.node.role;
//         nodeInfo.name = log.serviceInfo.node.name;
//         nodeInfo.ip = log.serviceInfo.node.ip;
//         nodeInfo.status = log.serviceInfo.node.status;
//         nodeInfo.kubeProxyVersion = log.serviceInfo.node.kubeProxyVersion;
//         nodeInfo.kubeletVersion = log.serviceInfo.node.kubeletVersion;
//         nodeInfo.operatingSystem = log.serviceInfo.node.operatingSystem;
//         nodeInfo.osImage = log.serviceInfo.node.osImage;
//         nodeInfo.containerRuntimeVersion = log.serviceInfo.node.containerRuntimeVersion;
//
//         logInfo.time = log.timestamp;
//         logInfo.logType = log.logType;
//         logInfo.requestType = log.requestType;
//         logInfo.uri = log.uri;
//         logInfo.message = log.logInfo;
//         logInfos.push(logInfo);
//
//         instanceInfo.traceInfo = traceInfo;
//         instanceInfo.serviceInfo = serviceInfo;
//         instanceInfo.nodeInfo = nodeInfo;
//         instanceInfo.logInfos = logInfos;
//
//         instanceInfos.set(log.serviceInfo.instanceInfo.instanceName, instanceInfo);
//       }
//       else {
//         let instanceInfo = instanceInfos.get(log.serviceInfo.instanceInfo.instanceName);
//         let logInfo = {};
//
//         logInfo.time = log.timestamp;
//         logInfo.logType = log.logType;
//         logInfo.requestType = log.requestType;
//         logInfo.message = log.logInfo;
//
//         instanceInfo.logInfos.push(logInfo);
//       }
//     }
//   }
//
//   console.log(instanceInfos);
//   return instanceInfos;
// }
//
// function constructLogArea(instanceName, instanceInfoMap){
//   let instanceInfo = instanceInfoMap.get(instanceName);
//   let logInfos = instanceInfo.logInfos;
//   let logHtml = '';
//   for(let i = 0; i < logInfos.length; i++){
//     let logInfo = logInfos[i];
//     logHtml += '<tr>';
//     logHtml += '<td>'+logInfo.time+'</td>';
//     logHtml += '<td>'+logInfo.logType+'</td>';
//     logHtml += '<td>'+logInfo.uri+'</td>';
//     logHtml += '<td>'+logInfo.message+'</td>';
//     logHtml += '</tr>';
//   }
//   return logHtml;
// }
//
// function setServiceInstanceNames(data, serviceName){
//   for (let i = 0; i < data.logs.length; i++) {
//     let log = data.logs[i];
//     if (log.serviceInfo.serviceName == serviceName) {
//       if(!serviceInstanceNames.contains(log.serviceInfo.instanceInfo.instanceName)){
//         serviceInstanceNames.push(log.serviceInfo.instanceInfo.instanceName);
//       }
//     }
//   }
// }
//
// function constuctButtonArea(serviceInstanceNames){
//   let html = '';
//   html+='<div class="list-group">'
//   for (let i = serviceInstanceNames.length - 1; i >= 0; i--) {
//     let buttonName = serviceInstanceNames[i];
//     html+='<button type="button" class="list-group-item list-group-item-info instance-button">' + buttonName + '</button>';
//   }
//   html+='</div>';
//   return html;
// }
//
// function constructServiceArea(instanceName, instanceInfoMap){
//   let instanceInfo = instanceInfoMap.get(instanceName);
//   let serviceInfo = instanceInfo.serviceInfo;
//   let html = '';
//   html += '<tr>';
//   html+='<td>'+serviceInfo.serviceName+'</td>';
//   html+='<td>'+serviceInfo.instanceName+'</td>';
//   html+='<td>'+serviceInfo.instanceStatus+'</td>';
//   html+='<td><dl class="dl-horizontal">';
//   html+='<dt>name</dt><dd>'+serviceInfo.containerName+'</dd>';
//   html+='<dt>imageName</dt><dd>'+serviceInfo.imageName+'</dd>';
//   html+='<dt>imageVersion</dt><dd>'+serviceInfo.imageVersion+'</dd>';
//   html+='<dt>port</dt><dd>'+serviceInfo.containerPort+'</dd>';
//   html+='<dt>protocol</dt><dd>'+serviceInfo.containerPrococol+'</dd>';
//   html+='</dl></td>';
//   html+='</tr>';
//   return html;
// }
//
// function constructNodeArea(instanceName, instanceInfoMap){
//   let instanceInfo = instanceInfoMap.get(instanceName);
//   let nodeInfo = instanceInfo.nodeInfo;
//   let html = '';
//   html += '<tr>';
//   html += '<td>' + nodeInfo.role + '</td>';
//   html += '<td>' + nodeInfo.name + '</td>';
//   html += '<td>' + nodeInfo.ip + '</td>';
//   html += '<td>' + nodeInfo.status + '</td>';
//   html += '<td>' + nodeInfo.kubeProxyVersion + '</td>';
//   html += '<td>' + nodeInfo.kubeletVersion + '</td>';
//   html += '<td>' + nodeInfo.operatingSystem + '</td>';
//   html += '<td>' + nodeInfo.osImage + '</td>';
//   html += '<td>' + nodeInfo.containerRuntimeVersion + '</td>';
//   html += '</tr>';
//   return html;
//
// }
//
// function constructTraceArea(instanceName, instanceInfoMap){
//   let instanceInfo = instanceInfoMap.get(instanceName);
//   let traceInfo = instanceInfo.traceInfo;
//   let html = '';
//   html += '<tr>';
//   html += '<td>'+traceInfo.traceId+'</td>'
//   html += '<td>'+traceInfo.spanId+'</td>'
//   html += '<td>'+traceInfo.parentSpanId+'</td>'
//   html += '</tr>';
//   return html;
// }
//
// function loadLogInfo(serviceName){
//   setServiceInstanceNames(globeTraceLogData,serviceName);
//   let html =        '<div> '
//     +   '<div class="container">'
//     +       '<div class="row">'
//     +          '<div class="col-md-2" >'
//     +              '<p class="lead">Instances</p>'
//     +              constuctButtonArea(serviceInstanceNames)
//     +          '</div>'
//     +          '<div class="col-md-10">'
//     +              '<p class="lead">Instance Information</p>'
//     +              '<div id = "instanceInformation">'
//     +              '</div>'
//   +          '</div>'
//   +       '</div>'
//   +   '</div>'
//   + '</div>';
//   return html;
// }
//
// function loadRightInfo(instanceNameLocal, instanceInfoMap){
//   let html = '';
//   html +=                            '<table class="table table-hover table-condensed table-striped table-bordered">';
//   html +=                                        '<tr>';
//   html +=                                           '<th>Service Name</th>';
//   html +=                                           '<th>Instance Name</th>';
//   html +=                                           '<th>Status</th>';
//   html +=                                           '<th>Container</th>';
//   html +=                                        '</tr>';
//   html +=                                        constructServiceArea(instanceNameLocal, instanceInfoMap);
//   html +=               			  '</table>';
//   html +=                             '<p class="lead">Node Information</p>';
//   html +=                             '<table class="table table-hover table-condensed table-striped table-bordered">';
//   html +=                                        '<tr>';
//   html +=                                           '<th>Role</th>';
//   html +=                                           '<th>Name</th>';
//   html +=                                           '<th>IP</th>';
//   html +=                                           '<th>Status</th>';
//   html +=                                           '<th>kubeProxyVersion</th>';
//   html +=                                           '<th>kubeletVersion</th>';
//   html +=                                           '<th>operatingSystem</th>';
//   html +=                                           '<th>osImage</th>';
//   html +=                                           '<th>containerRuntimeVersion</th>';
//   html +=                                        '</tr>';
//   html +=                        				 constructNodeArea(instanceNameLocal, instanceInfoMap);
//   html +=               			 '</table>';
//   html +=                             '<p class="lead">Log Information</p>';
//   html +=                             '<table class="table table-hover table-condensed table-striped table-bordered keepIn">';
//   html +=                                        '<tr>';
//   html +=                                           '<th>Time</th>';
//   html +=                                           '<th>logType</th>';
//   html +=                                           '<th>Uri</th>';
//   html +=                                           '<th>logInfo</th>';
//   html +=                                        '</tr>';
//   html +=                                        constructLogArea(instanceNameLocal, instanceInfoMap);
//   html +=               			  '</table>';
//   return html;
// }
//
// function initialInfo(traceId, instanceName, serviceName){
//   $("#instanceInformation").html(loadRightInfo(instanceName, getInstanceInfo(getLogByTraceIDAndServiceName(traceId,serviceName,instanceName), serviceName)));
// }

export default function initializeLog(config) {
  LogPageComponent.attachTo('.content', {config});
}
