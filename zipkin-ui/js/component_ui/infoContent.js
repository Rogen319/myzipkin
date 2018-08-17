import {component} from "flightjs";
import $ from "jquery";
import '../../libs/layer/layer';
import {globalVar } from '../component_data/log';

export default component(function ServiceInfoModal() {

  Array.prototype.contains = function(element) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == element) {
        return true;
      }
    }
    return false;
  };

  this.initI = function(e, d){
    this.initialInfo(d.e1, d.data, d.chosen);
  };

  this.initialInfo = function(el,data,chosen) {
    let instanceWithLogList = data.instanceWithLogList;
    if(instanceWithLogList.length <= 0){
      let html = "<h3>不存在日志信息</h3>";
      el[1].html(html);
      return;
    }
    let instanceName = [];
    for(let i = 0;i < instanceWithLogList.length; i++)
      instanceName[i] = instanceWithLogList[i].serviceInfo.instanceInfo.instanceName;
    this.initialInstanceList(el[0],data,instanceName,chosen);
    this.initialInstanceLog(el[1],instanceWithLogList[chosen]);
  };

  this.initialInstanceList = function(el,data,instanceName,chosen) {
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
        this.initialInfo(type,data, i);
      });
    });
  };

  this.initialInstanceLog = function(el,data) {
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
  };

  //////////////////////////////////////////////////////////////

  this.showNodeInfo = function(e,node) {
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
  };

  this.showServiceInstanceInfo = function(e, serviceInstance) {
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
  };

  /////////////////////////////////////////////////////////////

  this.after('initialize', function afterInitialize() {
    this.on(document, 'initialInfo',this.initI);
    this.on(document, 'showServiceInstanceInfo',this.showServiceInstanceInfo);
    this.on(document, 'showNodeInfo',this.showNodeInfo)

  });
});

export function showServiceInfo(traceId,serviceName,type){
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
    temp2.title = globalVar.getCurrentTraceId() === 0 ? globalVar.getSelectedTraceId()[1]:globalVar.getSelectedTraceId()[0];
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
  $(domMark1[0]).trigger('getLogByTraceIDAndServiceName', {el:domMark1,traceId:traceId,serviceName:serviceName,loading:loading});
  // LogData.getLogByTraceIDAndServiceName(domMark1,traceId,serviceName,loading);
  if(type === 1){
    $('.layui-layer-tabmain').eq(0).children().each(function (i) {
      if(i === 1)
        $(this).hide();
    });
    let domMark2 = [];
    domMark2[0] = $('#instanceList2');
    domMark2[1] = $('#instanceInformation2');
    let temp = globalVar.getCurrentTraceId() === 0 ? globalVar.getSelectedTraceId()[1]:globalVar.getSelectedTraceId()[0];
    $(domMark2[0]).trigger('getLogByTraceIDAndServiceName', {el:domMark2,traceId:temp,serviceName:serviceName,loading:loading});
    // LogData.getLogByTraceIDAndServiceName(domMark2,globalVar.getCurrentTraceId() === 0 ? globalVar.getSelectedTraceId()[1]:globalVar.getSelectedTraceId()[0],serviceName,loading);
  }
}
