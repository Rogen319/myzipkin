import {component} from "flightjs";
import $ from "jquery";
import '../../libs/layer/layer';
import {getLogByTraceIDAndServiceName} from '../component_data/log';

export default component(function ServiceInfoModal() {

  this.initI = function(d){
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
    initialInstanceList(el[0],data,instanceName,chosen);
    initialInstanceLog(el[1],instanceWithLogList[chosen]);
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

  this.keepTraceOn = function () {
    let tbody = $('#logTable').children('tr').eq(0);
    let thead = $('#logHead').children('tr').eq(0);
    for (let i = 0; i < tbody.children('td').length; i++) {
      let thWidth = tbody.children('td').eq(i).css('width');
      thead.children('th').eq(i).css('width', thWidth+'');
    }
    let thHeight = thead.children('th').eq(0).css('height');
    $('#logTable').css('padding-top', thHeight+'');
  };

  this.listenMove = function(el,bn) {
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
      this.keepTraceOn();
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
  };

  this.initControlLogVis = function () {
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
  };

  this.optTableStyle = function() {
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
  };

  this.showNodeInfo = function(node) {
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

  this.showServiceInstanceInfo = function(serviceInstance) {
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

  this.initLogVis = function(traceLog,loading) {
    let html = '';
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
  };

  this.initL = function(d){
    this.initLogVis(d.data, d.loading);
  };

  /////////////////////////////////////////////////////////////

  this.after('initialize', function afterInitialize() {
    this.on(document, 'initLogVis',this.initL);
    this.on(document, 'initialInfo',this.initI);

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
