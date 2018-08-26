import {component} from "flightjs";
import $ from "jquery";
import '../../libs/layer/layer';
import {globalVar } from '../component_data/log';
import {asyncModalBodyTemplate, asyncModalListTemplate, asyncModalRightCardTemplate} from "../templates";
import echarts from "echarts";
import {contextRoot} from "../publicPath";

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
    this.initialInfo(d.el, d.data, d.chosen);
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
    // this.initialInstanceList(el[0],data,instanceName,chosen);
    this.initialInstanceList(el,data,instanceName,chosen);
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
    el[0].html(html);
    el[0].children('ul').eq(0).children('li').each(function(i) {
      $(this).bind('click', function() {
        $(this).trigger('initialInfo', {el:el, data:data, chosen:i});
        // this.initialInfo(type,data, i);
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

  //////////////////////////// 异步调用顺序弹出框 //////////////////////////////////
  var sequences;

  this.showAsyncSequences = function(e, d){
    sequences = d.sequences || [];
    $('#asyncModalBody').html(asyncModalBodyTemplate({
      contextRoot
    }));

    let barData = [];
    let typeName = [];
    sequences.forEach(function(s, index){
      typeName[index] = "seq-" + (index+1);
      barData[index] = {
        name: typeName[index],
        value: s.errorRate * 100
      }
    });
    let asyncBar = echarts.init(document.getElementById('asyncBar'));
    asyncBar.clear();

    let options = {
      backgroundColor: 'white',
      title: {
        text: '异步调用顺序-错误率',
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
      yAxis: {
        type: 'value',
        name: '错误率'
      },
      xAxis: {
        type: 'category',
        data: typeName
      },
      series: [
        {
          name: '异步顺序错误率',
          type: 'bar',
          data: barData,
        }
      ]
    };
    asyncBar.setOption(options);

    //右边的seq顺序和trace list
    let model = {
      seqNameList: typeName,
    };
    $('#asyncList').html(asyncModalRightCardTemplate({
      contextRoot,
      ...model
    }));
    $('#asyncSeqNameList').children('a').eq(0).addClass('active');

    let model2 = {
      sequenceType: typeName[0],
      traceSet: sequences[0].traceSet
    };
    model2.serviceSequenceString = "";
    for(let i = 0; i < sequences[0].serviceSequence.length - 1; i++){
      model2.serviceSequenceString += sequences[0].serviceSequence[i] + " -> ";
    }
    model2.serviceSequenceString += sequences[0].serviceSequence[sequences[0].serviceSequence.length - 1];

    $('#asyncTraceList').html(asyncModalListTemplate({
      contextRoot,
      ...model2
    }));

    $('#asyncSeqNameList').children('a').bind('click', function(){
      $('#asyncSeqNameList').children('a').each(function(){
        $(this).removeClass('active');
      });
      $(this).addClass('active');

      let index = $(this).index();
      let model3 = {
        sequenceType: typeName[index],
        traceSet: sequences[index].traceSet
      };
      model3.serviceSequenceString = "";
      for(let i = 0; i < sequences[index].serviceSequence.length - 1; i++){
        model3.serviceSequenceString += sequences[index].serviceSequence[i] + " -> ";
      }
      model3.serviceSequenceString += sequences[index].serviceSequence[sequences[index].serviceSequence.length - 1];

      $('#asyncTraceList').html(asyncModalListTemplate({
        contextRoot,
        ...model3
      }));
      $(this).trigger('bindAsyncTraceClick');
    });

    $(this).trigger('bindAsyncTraceClick');
    $('#asyncSequenceButton').show();

    // asyncBar.on('click', function(params){
    //   console.log("params:");
    //   console.log(params);
    //
    //   let index = params.data.name.split('-')[1];
    //   // console.log("index=" + index);
    //   const model = sequences[index - 1];
    //   model.sequenceType = params.data.name;
    //   // console.log(JSON.stringify(model));
    //   model.serviceSequenceString = "";
    //   for(let i = 0; i < model.serviceSequence.length - 1; i++){
    //     model.serviceSequenceString += model.serviceSequence[i] + " -> ";
    //   }
    //   model.serviceSequenceString += model.serviceSequence[model.serviceSequence.length - 1];
    //
    //   $('#asyncList').html(asyncModalListTemplate({
    //     contextRoot,
    //     ...model
    //   }));
    //
    //   $('.async-traceid').bind('click', function(){
    //     let traceId = $.trim($(this).html());
    //     $('.tree-node').each(function () {
    //        let title = $.trim($(this).find('.title').html());
    //        if(title == traceId){
    //          $(this).click();
    //        }
    //     });
    //     $('#asyncModal').modal('hide');
    //   });
    // });

  };

  this.bindAsyncTraceClick = function(){
    $('.async-traceid').bind('click', function(){
      let traceId = $.trim($(this).html());
      $('.tree-node').each(function () {
        let title = $.trim($(this).find('.title').html());
        if(title == traceId){
          $(this).click();
        }
      });
      $('#asyncModal').modal('hide');
    });
  };


  /////////////////////////////////////////////////////////////

  this.after('initialize', function afterInitialize() {
    this.on(document, 'initialInfo',this.initI);
    this.on(document, 'showServiceInstanceInfo',this.showServiceInstanceInfo);
    this.on(document, 'showNodeInfo',this.showNodeInfo);
    this.on(document, 'showAsyncSequences',this.showAsyncSequences);
    this.on(document, 'bindAsyncTraceClick',this.bindAsyncTraceClick);
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
