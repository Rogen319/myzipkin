import moment from 'moment';
import {component} from 'flightjs';
import $ from 'jquery';
import queryString from 'query-string';
import DependencyData from '../component_data/dependency';
import DependencyGraphUI from '../component_ui/dependencyGraph';
import ServiceDataModal from '../component_ui/serviceDataModal';
import TimeStampUI from '../component_ui/timeStamp';
import GoToLogUI from '../component_ui/goToLog';
import SelectTree from '../component_ui/selectTree';
import {logTemplate} from '../templates';
import {i18nInit} from '../component_ui/i18n';
import '../../libs/layer/layer';

const LogPageComponent = component(function LogPage() {
  this.after('initialize', function() {
    window.document.title = 'Zipkin - Log';
    this.trigger(document, 'navigate', {route: 'zipkin/log'});

    this.$node.html(logTemplate());

    $('#logVis').css('height',window.innerWidth * 0.15 +'');
    const {startTs, endTs} = queryString.parse(location.search);
    $('#endTs').val(endTs || moment().valueOf());
    // When #1185 is complete, the only visible granularity is day
    $('#startTs').val(startTs || moment().valueOf() - 86400000);
    DependencyData.attachTo('#dependency-container');
    DependencyGraphUI.attachTo('#dependency-container', {config: this.attr.config});
    ServiceDataModal.attachTo('#service-data-modal-container');
    TimeStampUI.attachTo('#end-ts');
    TimeStampUI.attachTo('#start-ts');
    GoToLogUI.attachTo('#dependency-query-form');
    SelectTree.attachTo('#select-tree-area');
    i18nInit('dep');
    showSelectTree();
  });
});


function showSelectTree() {
  let html = '<div class="container" id="trace-tree">';
  var requestWithTraceID = getRequestWithTraceID();
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
      var ic = $('<i>').addClass('fa fa-folder-open-o');
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
    } else {
      icon.addClass('fa fa-file-text-o');
        // 叶子节点新增是否可选
      $('<input>').addClass('candidate').val(tData[i].candidate).css('display', 'none').appendTo(li);
    }
  }
  return ul;
}

function nodeClick(box) {
  box.find('.tree-node').click(function() {
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
      const allService =  JSON.parse($.trim($(this).find('.serviceList').html()));
      const allServiceName = [];
      for (let i = 0;i < allService.length;i++) {
        allServiceName[i] = allService[i].title;
      }
      highlightServices(allServiceName);
      initLogVis($.trim($(this).find('.title').html()));
    }
    else if (($.trim($(this).find('.open').val()) === 'service')) {

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
      node.setAttribute('fill', '#FF0000');
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

function getLogByTraceID(traceId) {
  var result;
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
  let logs = traceLog.logs;
  for (let i = 0;i < logs.length;i++) {
    html += '<tr>'+
      ' <td>'+ logs[i].serviceInfo.serviceName +'</td>'+
      ' <td>'+ logs[i].serviceInfo.instanceInfo.instanceName +'</td>'+
      ' <td>'+ logs[i].logInfo +'</td>'+
      ' <td>'+ logs[i].logType +'</td>'+
      ' <td>'+ logs[i].serviceInfo.node.name +'</td>'+
      '</tr>';
  }
  $('#logTable').html(html);

}

export default function initializeLog(config) {
  LogPageComponent.attachTo('.content', {config});
}
