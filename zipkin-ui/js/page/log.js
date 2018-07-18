import moment from 'moment';
import {component} from 'flightjs';
import $ from 'jquery';
import queryString from 'query-string';
import DependencyData from '../component_data/dependency';
import DependencyGraphUI from '../component_ui/dependencyGraph';
import ServiceDataModal from '../component_ui/serviceDataModal';
import TimeStampUI from '../component_ui/timeStamp';
import GoToDependencyUI from '../component_ui/goToDependency';
import SelectTree from '../component_ui/selectTree';
import {logTemplate} from '../templates';
import {i18nInit} from '../component_ui/i18n';
import '../../libs/layer/layer';

const LogPageComponent = component(function LogPage() {
  this.after('initialize', function() {
    window.document.title = 'Zipkin - Log';
    this.trigger(document, 'navigate', {route: 'zipkin/log'});

    this.$node.html(logTemplate());

    const {startTs, endTs} = queryString.parse(location.search);
    $('#endTs').val(endTs || moment().valueOf());
    // When #1185 is complete, the only visible granularity is day
    $('#startTs').val(startTs || moment().valueOf() - 86400000);

    DependencyData.attachTo('#dependency-container');
    DependencyGraphUI.attachTo('#dependency-container', {config: this.attr.config});
    ServiceDataModal.attachTo('#service-data-modal-container');
    TimeStampUI.attachTo('#end-ts');
    TimeStampUI.attachTo('#start-ts');
    GoToDependencyUI.attachTo('#dependency-query-form');
    SelectTree.attachTo('#select-tree-area');
    i18nInit('dep');
    this.$node.find('#select-tree').click(e => {
      e.preventDefault();
      showTraceTreeWindow();
    });
    traceTreeListen();
  });
});

function showTraceTreeWindow() {
    let html = '<div class="container" id="trace-tree">';
    var requestWithTraceID = '{'+
      '    "status": true,'+
      '    "message": "Succeed to get the request with trace ids. The size of request types is [7].",'+
      '    "requestWithTraceInfoList": ['+
      '        {'+
      '            "requestType": "QueryTravelInfo",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "7fbab20b14536253",'+
      '                    "serviceName": ['+
      '                        "ts-basic-service",'+
      '                        "ts-config-service",'+
      '                        "ts-price-service",'+
      '                        "ts-travel-service",'+
      '                        "ts-train-service",'+
      '                        "ts-route-service",'+
      '                        "ts-station-service",'+
      '                        "ts-ticketinfo-service",'+
      '                        "istio-mixer",'+
      '                        "istio-policy",'+
      '                        "ts-seat-service",'+
      '                        "ts-order-service",'+
      '                        "istio-ingressgateway"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        },'+
      '        {'+
      '            "requestType": "PreserveTicket",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "6964ee4b013c097e",'+
      '                    "serviceName": ['+
      '                        "ts-basic-service",'+
      '                        "ts-config-service",'+
      '                        "ts-price-service",'+
      '                        "ts-travel-service",'+
      '                        "ts-train-service",'+
      '                        "ts-assurance-service",'+
      '                        "ts-contacts-service",'+
      '                        "ts-food-service",'+
      '                        "ts-station-service",'+
      '                        "ts-route-service",'+
      '                        "ts-notification-service",'+
      '                        "ts-security-service",'+
      '                        "ts-ticketinfo-service",'+
      '                        "istio-mixer",'+
      '                        "istio-policy",'+
      '                        "ts-seat-service",'+
      '                        "ts-order-service",'+
      '                        "ts-consign-service",'+
      '                        "istio-ingressgateway",'+
      '                        "ts-sso-service",'+
      '                        "ts-preserve-service",'+
      '                        "ts-consign-price-service",'+
      '                        "ts-order-other-service"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        },'+
      '        {'+
      '            "requestType": "Execute",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "0849b08983c89b19",'+
      '                    "serviceName": ['+
      '                        "ts-execute-service",'+
      '                        "ts-order-service",'+
      '                        "istio-ingressgateway"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        },'+
      '        {'+
      '            "requestType": "Collect",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "eff7a58f18f351c2",'+
      '                    "serviceName": ['+
      '                        "ts-execute-service",'+
      '                        "istio-mixer",'+
      '                        "istio-policy",'+
      '                        "ts-order-service",'+
      '                        "istio-ingressgateway"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        },'+
      '        {'+
      '            "requestType": "Pay",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "87736f2a2c92704c",'+
      '                    "serviceName": ['+
      '                        "ts-inside-payment-service",'+
      '                        "istio-mixer",'+
      '                        "istio-policy",'+
      '                        "ts-order-service",'+
      '                        "istio-ingressgateway"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        },'+
      '        {'+
      '            "requestType": "Login",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "23dff6605db17edd",'+
      '                    "serviceName": ['+
      '                        "istio-mixer",'+
      '                        "istio-policy",'+
      '                        "ts-login-service",'+
      '                        "ts-verification-code-service",'+
      '                        "istio-ingressgateway",'+
      '                        "ts-sso-service"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        },'+
      '        {'+
      '            "requestType": "GetFood",'+
      '            "traceInfoList": ['+
      '                {'+
      '                    "traceId": "41e70c26dd7a96cf",'+
      '                    "serviceName": ['+
      '                        "ts-travel-service",'+
      '                        "istio-mixer",'+
      '                        "istio-policy",'+
      '                        "ts-food-service",'+
      '                        "ts-station-service",'+
      '                        "ts-food-map-service",'+
      '                        "ts-route-service",'+
      '                        "istio-ingressgateway"'+
      '                    ]'+
      '                }'+
      '            ],'+
      '            "count": 1'+
      '        }'+
      '    ]'+
      '}';
    var data = praseRequestWithTraceID(requestWithTraceID);
    html += loadTree(data).html();
    html += '</div>';
    layer.open({
      type: 1,
      offset: ['200px','0'],
      area: ['250px','500px'],
      title: '选择调用链',
      shade: 0,
      shadeClose: false,
      closeBtn: 1,
      anim: 3,
      fixed: true,
      content: html
    });
    nodeClick($('#trace-tree'));
}

function loadTree(tData){
    var ul = $('<ul>');
    for(var i=0; i<tData.length; i++){
      var li = $('<li>').appendTo(ul);
      var node = $('<a>').appendTo(li);
      var icon = $('<i>').css('margin-right','5').appendTo(node);
      var aTree = $('<span>').html(tData[i].title).appendTo(node);
      var input = $('<input>').addClass('field').val(tData[i].field).css({'display':'none'}).appendTo(node);

      // 处理有子节点的
      if(tData[i].children != undefined){
        // 添加图标样式
        icon.addClass(tData[i].open ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o');
        var ic = $('<i>').addClass('fa fa-folder-open-o');
        icon.after(ic).addClass('status');
        node.addClass('tree-node');

        // 添加标记节点是否打开
        $('<input>').addClass('open').val(tData[i].open).css('display','none').appendTo(node);

        // 递归遍历子节点
        var $child = loadTree(tData[i].children);
        if(tData[i].open){
          $child.show().appendTo(li);
        } else{
          $child.hide().appendTo(li);
        }
      } else{
        icon.addClass('fa fa-file-text-o');
        // 叶子节点新增是否可选
        $('<input>').addClass('candidate').val(tData[i].candidate).css('display','none').appendTo(li);
      }
    }
    return ul;
}

function nodeClick(box){
    box.find('.tree-node').click(function(){
      // 判断该节点是否开启
      if($.trim($(this).find('.open').val()) == 'true'){
        // 已开启，则关闭节点
        $(this).next().slideUp(500);
        $(this).find('.open').val('false');
        $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
      } else{
        // 开启前关闭节点下的所有节点
        $(this).next().find('.tree-node').each(function(){
          $(this).next().css('display','none');
          $(this).find('.open').val('false');
          $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        })

        // 已关闭，则开启节点
        $(this).find('.open').val('true');
        $(this).find('.status').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
        // 开启节点下的节点

        $(this).next().slideDown(500);
      }
    });
}

function praseRequestWithTraceID(requestWithTraceID) {
  var data = [];
  var jsonObj = JSON.parse(requestWithTraceID);
  var requestTypeList = jsonObj.requestWithTraceInfoList;
  for(var i = 0;i < requestTypeList.length;i++){
    var rootNode = {};
    rootNode.title = requestTypeList[i].requestType;
    rootNode.field = requestTypeList[i].requestType;
    rootNode.candidate = true;
    var traceInfoList = requestTypeList[i].traceInfoList;
    if(traceInfoList.length > 0){
      rootNode.open = false;
      var allTrace = [];
      for(var j = 0;j < traceInfoList.length;j++){
        var secondNode = {};
        secondNode.title = traceInfoList[j].traceId;
        secondNode.field = traceInfoList[j].traceId;
        secondNode.candidate = true;
        var serviceList = traceInfoList[j].serviceName;
        if(serviceList.length > 0){
          secondNode.open = false;
          var allService = [];
          for(var k = 0;k < serviceList.length;k++){
            var leafNode = {};
            leafNode.title = serviceList[k];
            leafNode.field = serviceList[k];
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

export default function initializeLog(config) {
  LogPageComponent.attachTo('.content', {config});
}
