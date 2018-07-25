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
    const loading = layer.load(2);
    try {
      window.document.title = 'Zipkin - Log';
      this.trigger(document, 'navigate', {route: 'zipkin/log'});

      this.$node.html(logTemplate());

      $('#logVis').css('height', window.screen.height * 0.3 + '');
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
      getRequestWithTraceIDByTimeRange();
      layer.close(loading);
    } catch (e) {
      layer.close(loading);
    }
  });
});

var currentTraceId = '';
var serviceInstanceNames = new Array();
var globeTraceLogData = {};
function showSelectTree(requestWithTraceID) {
  let html = '<div class="container-fluid" id="trace-tree">';
  var data = praseRequestWithTraceID(requestWithTraceID);
  html += loadTree(data).html();
  html += '</div>';
  $('#selectTree').html(html);
  nodeClick($('#trace-tree'));
}

function loadTree(tData) {
  var ul = $('<ul>');
  for (var i = 0; i < tData.length; i++) {
    var li = $('<li>').appendTo(ul);
    var node = $('<a>').appendTo(li);
    var icon = $('<i>').css('margin-right', '5').appendTo(node);
    $('<span>').addClass('title').html(tData[i].title).appendTo(node);
    $('<div></div>').addClass('field').html(tData[i].field).css('display','none').appendTo(node)
    if (tData[i].field === 'trace') {
      $('<div></div>').addClass('serviceList').html(JSON.stringify(tData[i].children)).css('display', 'none').appendTo(node);
    }
      // 处理有子节点的
    if (tData[i].children != undefined) {
        // 添加图标样式
      icon.addClass(tData[i].open ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o');
      var ic;
      if (tData[i].field === 'root') {
        ic = $('<i>').addClass('fa fa-folder-open-o');
      }
      else if (tData[i].field === 'root') {
        ic = $('<i>').addClass('fa fa-folder-open-o');
      }
      else {
        ic = $('<i>').addClass('fa fa-folder-open-o');
      }
      icon.after(ic).addClass('status');
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
      icon.addClass('fa fa-file-text-o');
      node.addClass('tree-node');
        // 叶子节点新增是否可选
      //$('<input>').addClass('candidate').val(tData[i].candidate).css('display', 'none').appendTo(li);
    }
  }
  return ul;
}

function nodeClick(box) {
  box.find('.tree-node').click(function() {
    layer.load(2);
    try {
      // 判断该节点是否开启
      if ($.trim($(this).find('.open').val()) === 'true') {
          // 已开启，则关闭节点
        $(this).next().slideUp(500);
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

        $(this).next().slideDown(500);
      }
      // 判断是不是调用链
      if ($.trim($(this).find('.field').html()) === 'trace') {
        let t = $.trim($(this).find('.title').html());
        currentTraceId = t;
        globeTraceLogData = getLogByTraceID(currentTraceId);
        $(this).parent().parent('ul').parent().parent().find('.tree-node').each(function() {
          if($.trim($(this).find('.field').html()) === 'trace') {
            if ($.trim($(this).find('.title').html()) !== t) {
              $(this).css({'background-color': '', 'color' : ''});
              $(this).next().css('display', 'none');
              $(this).find('.open').val('false');
              $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
            }
            else {
              $(this).css({'background-color': '#777777', 'color': '#FFFFFF'});
            }
          }
        });
        const allService = JSON.parse($.trim($(this).find('.serviceList').html()));
        const allServiceName = [];
        for (let i = 0; i < allService.length; i++) {
          allServiceName[i] = allService[i].title;
        }
        initServiceClick(allServiceName);
        if ($.trim($(this).find('.open').val()) === 'true') {
          highlightServices(allServiceName);
          initLogVis($.trim($(this).find('.title').html()));
        }
      }
      else if ($.trim($(this).find('.field').html()) === 'service') {
        showServiceInfo($.trim($(this).find('.title').html()));
      }
      layer.closeAll('loading');
    }catch (e) {
      layer.closeAll('loading');
    }
  });
}

function praseRequestWithTraceID(requestWithTraceID) {
  var data = [];
  var requestTypeList = requestWithTraceID.requestWithTraceInfoList;
  for (var i = 0; i < requestTypeList.length; i++) {
    var rootNode = {};
    rootNode.title = requestTypeList[i].requestType;
    rootNode.field = 'root';
    rootNode.candidate = true;
    var traceInfoList = requestTypeList[i].traceInfoList;
    if (traceInfoList.length > 0) {
      rootNode.open = false;
      var allTrace = [];
      for (var j = 0; j < traceInfoList.length; j++) {
        var secondNode = {};
        secondNode.title = traceInfoList[j].traceId;
        secondNode.field = 'trace';
        secondNode.candidate = true;
        var serviceList = traceInfoList[j].serviceName;
        if (serviceList.length > 0) {
          secondNode.open = false;
          var allService = [];
          for (var k = 0; k < serviceList.length; k++) {
            var leafNode = {};
            leafNode.title = serviceList[k];
            leafNode.field = 'service';
            leafNode.candidate = true;
            allService[k] = leafNode;
          }
          secondNode.children = allService;
        }
        allTrace[j] = secondNode;
      }
      rootNode.children = allTrace;
    }
    data[i] = rootNode;
  }
  return data;
}

// 高亮
function highlightServices(services) {
  initialServiceColor();
  let nodes = document.getElementsByClassName('node enter');
  for (let i = 0; i < nodes.length; i++) {
    if (isInArray(services, nodes[i].getAttribute('data-node'))) {
      let node = nodes[i].getElementsByTagName('rect')[0];
      node.setAttribute('fill', '#0FF0F1');
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

function getRequestWithTraceID() {
  var result;
  $.ajax({
    async: false,
    url: 'http://10.141.212.24:17319/getRequestWithTraceID',
    type: 'get',
    dataType: 'json',
    success: function (data) {
      result = data;
    },
    error: function (event) {
      layer.msg('获取调用信息失败',{icon:2});
    }
  });
  return result;
}

function getRequestWithTraceIDByTimeRange() {
  let result;
  let time = {};
  let parm = window.location.search;
  if (parm.length > 1){
    parm = parm.substring(1,parm.length);
    time.endTime = parseInt(parm.split('&')[0].split('=')[1]);
    time.lookback = time.endTime - parm.split('&')[1].split('=')[1];
  }
  else{
    time.endTime = (new Date()).getTime();
    time.lookback = 86400000 ;
  }
  $.ajax({
    async: true,
    url: 'http://10.141.212.24:17319/getRequestWithTraceIDByTimeRange',
    type: 'post',
    data: JSON.stringify(time),
    dataType: 'json',
    contentType: "application/json",
    success: function (data) {
      result = data;
      showSelectTree(result);
    },
    error: function (event) {
      layer.msg('获取调用信息失败',{icon:2});
    }
  });
}

function getLogByTraceID(traceId) {
  var result = '';
  $.ajax({
    async: false,
    url: 'http://10.141.212.24:16319/getLogByTraceId/'+traceId,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      result = data;
    },
    error: function (event) {
      layer.msg('获取调用链日志失败',{icon:2});
    }
  });
  return result;
}


function initLogVis(traceId) {
  let html = '';
  let traceLog = getLogByTraceID(traceId);
  globeTraceLogData = traceLog;
  let logs = traceLog.logs;
  for (let i = 0;i < logs.length;i++) {
    html += '<tr>'+
      ' <td>'+ logs[i].timestamp +'</td>'+
      ' <td>' + logs[i].serviceInfo.serviceName +'</td>'+
      ' <td>'+
      '   <button class="btn btn-default serviceInstanceBtn">' +
            logs[i].serviceInfo.instanceInfo.instanceName +
      '     <div class = "serviceInstanceInfo">'+ JSON.stringify(logs[i].serviceInfo.instanceInfo) +'</div>'+
      '   </button>'+
      ' </td>' +
      ' <td>'+
      '   <button class="btn btn-default nodeBtn">' +
      logs[i].serviceInfo.node.name +
      '     <div class = "nodeInfo">'+ JSON.stringify(logs[i].serviceInfo.node) +'</div>'+
      '   </button>'+
      '</td>'+
      ' <td>'+ logs[i].logType +'</td>'+
      ' <td>'+ logs[i].logInfo +'</td>'+
      '</tr>';
  }

  if(logs.length > 0) {
    $('#logTable').html(html);
    $('#logVis').css('display', 'block');
    let tbody = $('#logTable').children('tr').eq(0);
    let thead = $('#logHead').children('tr').eq(0);
    for (let i = 0; i < tbody.children('td').length; i++) {
      let thWidth = tbody.children('td').eq(i).css('width');
      thead.children('th').eq(i).css('width', thWidth+'');
    }
    let thHeight = thead.children('th').eq(0).css('height');
    $('#logTable').css('padding-top', thHeight+'');
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

function initServiceClick(allServiceName) {
  var ss = $('#dependency-container').find('.node.enter')
  ss.each(function() {
    $(this).unbind('click');
    let serviceName = $(this).find('text').children().eq(0).html();
    if(allServiceName.contains(serviceName)){
      $(this).click(function () {
        showServiceInfo(serviceName);
      });
    }
  });
}

function showServiceInfo(serviceName){
  layer.open({
    type: 1,
    title: 'Service Instance Log',
    shade: 0,
    shadeClose: false,
    area: ['1250px', '600px'],
    closeBtn: 1,
    anim: 0,
    fixed: false,
    content: loadLogInfo(serviceName),
    end: function () {
      serviceInstanceNames = [];
    }
  });
  initialInfo(serviceInstanceNames[0], serviceName);
  $(".instance-button").click(function(){
    let a = $(this).html();
    $("#instanceInformation").html(loadRightInfo(a, getInstanceInfo(globeTraceLogData, serviceName)));
  });
}


Array.prototype.contains = function(element) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == element) {
      return true;
    }
  }
  return false;
}


function getInstanceInfo(data, serviceName){
  let instanceInfos = new Map();
  let serviceInstanceNames2 = new Array();
  for (let i = 0; i < data.logs.length; i++) {
    let log = data.logs[i];

    if (log.serviceInfo.serviceName == serviceName) {
      if(!serviceInstanceNames2.contains(log.serviceInfo.instanceInfo.instanceName)){
        serviceInstanceNames2.push(log.serviceInfo.instanceInfo.instanceName);
        let instanceInfo = {};
        let traceInfo = {};
        let serviceInfo = {};
        let nodeInfo = {};
        let logInfo = {}
        let logInfos = new Array();

        traceInfo.traceId = log.traceInfo.traceId;
        traceInfo.spanId = log.traceInfo.spanId;
        traceInfo.parentSpanId = log.traceInfo.parentSpanId;

        serviceInfo.serviceName = log.serviceInfo.serviceName;
        serviceInfo.instanceName = log.serviceInfo.instanceInfo.instanceName;
        serviceInfo.instanceStatus = log.serviceInfo.instanceInfo.status;
        serviceInfo.containerName = log.serviceInfo.instanceInfo.container.name;
        serviceInfo.imageName = log.serviceInfo.instanceInfo.container.imageName;
        serviceInfo.imageVersion = log.serviceInfo.instanceInfo.container.imageVersion;
        serviceInfo.containerPort = log.serviceInfo.instanceInfo.container.ports[0].containerPort;
        serviceInfo.containerPrococol = log.serviceInfo.instanceInfo.container.ports[0].protocol;

        nodeInfo.role = log.serviceInfo.node.role;
        nodeInfo.name = log.serviceInfo.node.name;
        nodeInfo.ip = log.serviceInfo.node.ip;
        nodeInfo.status = log.serviceInfo.node.status;
        nodeInfo.kubeProxyVersion = log.serviceInfo.node.kubeProxyVersion;
        nodeInfo.kubeletVersion = log.serviceInfo.node.kubeletVersion;
        nodeInfo.operatingSystem = log.serviceInfo.node.operatingSystem;
        nodeInfo.osImage = log.serviceInfo.node.osImage;
        nodeInfo.containerRuntimeVersion = log.serviceInfo.node.containerRuntimeVersion;

        logInfo.time = log.timestamp;
        logInfo.logType = log.logType;
        logInfo.requestType = log.requestType;
        logInfo.message = log.logInfo;
        logInfos.push(logInfo);

        instanceInfo.traceInfo = traceInfo;
        instanceInfo.serviceInfo = serviceInfo;
        instanceInfo.nodeInfo = nodeInfo;
        instanceInfo.logInfos = logInfos;

        instanceInfos.set(log.serviceInfo.instanceInfo.instanceName, instanceInfo);
      }
      else {
        let instanceInfo = instanceInfos.get(log.serviceInfo.instanceInfo.instanceName);
        let logInfo = {};

        logInfo.time = log.timestamp;
        logInfo.logType = log.logType;
        logInfo.requestType = log.requestType;
        logInfo.message = log.logInfo;

        instanceInfo.logInfos.push(logInfo);
      }
    }
  }

  console.log(instanceInfos);
  return instanceInfos;
}

function constructLogArea(instanceName, instanceInfoMap){
  let instanceInfo = instanceInfoMap.get(instanceName);
  let logInfos = instanceInfo.logInfos;
  let logHtml = '';
  for(let i = 0; i < logInfos.length; i++){
    let logInfo = logInfos[i];
    logHtml += '<tr>';
    logHtml += '<td>'+logInfo.time+'</td>';
    logHtml += '<td>'+logInfo.logType+'</td>';
    logHtml += '<td>'+logInfo.message+'</td>';
    logHtml += '</tr>';
  }
  return logHtml;
}

function setServiceInstanceNames(data, serviceName){
  for (let i = 0; i < data.logs.length; i++) {
    let log = data.logs[i];

    if (log.serviceInfo.serviceName == serviceName) {
      if(!serviceInstanceNames.contains(log.serviceInfo.instanceInfo.instanceName)){
        serviceInstanceNames.push(log.serviceInfo.instanceInfo.instanceName);
      }
    }
  }
}

function constuctButtonArea(serviceInstanceNames){
  let html = '';
  html+='<div class="list-group">'
  for (let i = serviceInstanceNames.length - 1; i >= 0; i--) {
    let buttonName = serviceInstanceNames[i];
    html+='<button type="button" class="list-group-item list-group-item-info instance-button">' + buttonName + '</button>';
  }
  html+='</div>';
  return html;
}

function constructServiceArea(instanceName, instanceInfoMap){
  let instanceInfo = instanceInfoMap.get(instanceName);
  let serviceInfo = instanceInfo.serviceInfo;
  let html = '';
  html += '<tr>';
  html+='<td>'+serviceInfo.serviceName+'</td>';
  html+='<td>'+serviceInfo.instanceName+'</td>';
  html+='<td>'+serviceInfo.instanceStatus+'</td>';
  html+='<td><dl class="dl-horizontal">';
  html+='<dt>name</dt><dd>'+serviceInfo.containerName+'</dd>';
  html+='<dt>imageName</dt><dd>'+serviceInfo.imageName+'</dd>';
  html+='<dt>imageVersion</dt><dd>'+serviceInfo.imageVersion+'</dd>';
  html+='<dt>port</dt><dd>'+serviceInfo.containerPort+'</dd>';
  html+='<dt>protocol</dt><dd>'+serviceInfo.containerPrococol+'</dd>';
  html+='</dl></td>';
  html+='</tr>';
  return html;
}

function constructNodeArea(instanceName, instanceInfoMap){
  let instanceInfo = instanceInfoMap.get(instanceName);
  let nodeInfo = instanceInfo.nodeInfo;
  let html = '';
  html += '<tr>';
  html += '<td>' + nodeInfo.role + '</td>';
  html += '<td>' + nodeInfo.name + '</td>';
  html += '<td>' + nodeInfo.ip + '</td>';
  html += '<td>' + nodeInfo.status + '</td>';
  html += '<td>' + nodeInfo.kubeProxyVersion + '</td>';
  html += '<td>' + nodeInfo.kubeletVersion + '</td>';
  html += '<td>' + nodeInfo.operatingSystem + '</td>';
  html += '<td>' + nodeInfo.osImage + '</td>';
  html += '<td>' + nodeInfo.containerRuntimeVersion + '</td>';
  html += '</tr>';
  return html;

}

function constructTraceArea(instanceName, instanceInfoMap){
  let instanceInfo = instanceInfoMap.get(instanceName);
  let traceInfo = instanceInfo.traceInfo;
  let html = '';
  html += '<tr>';
  html += '<td>'+traceInfo.traceId+'</td>'
  html += '<td>'+traceInfo.spanId+'</td>'
  html += '<td>'+traceInfo.parentSpanId+'</td>'
  html += '</tr>';
  return html;
}

function loadLogInfo(serviceName){
  setServiceInstanceNames(globeTraceLogData,serviceName);
  let html =        '<div> '
    +   '<div class="container">'
    +       '<div class="row">'
    +          '<div class="col-md-2" >'
    +              '<p class="lead">Instances</p>'
    +              constuctButtonArea(serviceInstanceNames)
    +          '</div>'
    +          '<div class="col-md-10">'
    +              '<p class="lead">Instance Information</p>'
    +              '<div id = "instanceInformation">'
    +              '</div>'
  +          '</div>'
  +       '</div>'
  +   '</div>'
  + '</div>';
  return html;
}

function loadRightInfo(instanceNameLocal, instanceInfoMap){
  let html = '';
  html +=                            '<table class="table table-hover table-condensed table-striped table-bordered">';
  html +=                                        '<tr>';
  html +=                                           '<th>Service Name</th>';
  html +=                                           '<th>Instance Name</th>';
  html +=                                           '<th>Status</th>';
  html +=                                           '<th>Container</th>';
  html +=                                        '</tr>';
  html +=                                        constructServiceArea(instanceNameLocal, instanceInfoMap);
  html +=               			  '</table>';
  html +=                             '<p class="lead">Node Information</p>';
  html +=                             '<table class="table table-hover table-condensed table-striped table-bordered">';
  html +=                                        '<tr>';
  html +=                                           '<th>Role</th>';
  html +=                                           '<th>Name</th>';
  html +=                                           '<th>IP</th>';
  html +=                                           '<th>Status</th>';
  html +=                                           '<th>kubeProxyVersion</th>';
  html +=                                           '<th>kubeletVersion</th>';
  html +=                                           '<th>operatingSystem</th>';
  html +=                                           '<th>osImage</th>';
  html +=                                           '<th>containerRuntimeVersion</th>';
  html +=                                        '</tr>';
  html +=                        				 constructNodeArea(instanceNameLocal, instanceInfoMap);
  html +=               			 '</table>';
  html +=                             '<p class="lead">Trace Information</p>';
  html +=                             '<table class="table table-hover table-condensed table-striped table-bordered">';
  html +=                                        '<tr>';
  html +=                                           '<th>traceId</th>';
  html +=                                           '<th>spanId</th>';
  html +=                                           '<th>parentSpanId</th>';
  html +=                                        '</tr>';
  html +=         			                   constructTraceArea(instanceNameLocal, instanceInfoMap);
  html +=               			 '</table>';
  html +=                             '<p class="lead">Log Information</p>';
  html +=                             '<table class="table table-hover table-condensed table-striped table-bordered">';
  html +=                                        '<tr>';
  html +=                                           '<th>Time</th>';
  html +=                                           '<th>logType</th>';
  html +=                                           '<th>logInfo</th>';
  html +=                                        '</tr>';
  html +=                                        constructLogArea(instanceNameLocal, instanceInfoMap);
  html +=               			  '</table>';
  return html;
}

function initialInfo(instanceName, serviceName){
  $("#instanceInformation").html(loadRightInfo(instanceName, getInstanceInfo(globeTraceLogData, serviceName)));
}

export default function initializeLog(config) {
  LogPageComponent.attachTo('.content', {config});
}
