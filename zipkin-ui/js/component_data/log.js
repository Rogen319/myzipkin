import {component} from 'flightjs';
import $ from 'jquery';
import '../../libs/layer/layer';


const address = 'http://10.141.212.25';

export default component(function dependency() {

  this.getLogByTraceID = function(e, d) {
    e.stopPropagation();
    let traceId = d.traceId;
    let type = d.type;
    let loading = d.loading;
    $.ajax(address + ':16319/getLogByTraceId/'+traceId+"/"+type, {
      async: true,
      type: 'get',
      dataType: 'json',
      contentType: "application/json"
    }).done(data => {
      this.trigger('initLogVis', {data:data,loading:loading});
      this.trigger('closeErrorPanel');
    }).fail(e => {
      layer.msg('获取调用链日志失败',{icon:2});
    });

  };

  this.getCluster = function(e, d) {
    e.stopPropagation();
    let classifyNumber = d.classifyNumber;
    let loading = d.loading;
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

    $.ajax( address + ':18888/cluster?endTs='+ time.endTime.toString() +'&lookback='+ time.lookback.toString() +'&k='+ classifyNumber.toString(), {
      async: true,
      type: 'get',
      dataType: 'json',
      contentType: "application/json"
    }).done(data => {
      layer.close(loading);
      this.trigger('initColor', data);
      this.trigger('showClassifyNoticeWindow', data);
    }).fail(e => {
      layer.msg('获取服务日志失败',{icon:2});
    });

  };

  this.getLogByTraceIDAndServiceName = function(e, d) {
    e.stopPropagation();
    let el = d.el;
    let traceId = d.traceId;
    let serviceName = d.serviceName;
    let loading = d.loading;

    let info = {};
    info.serviceName = serviceName;
    info.traceId = traceId;

    $.ajax(address + ':16319/getLogByServiceNameAndTraceId', {
      async: true,
      type: 'post',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(info)
    }).done(data => {
      layer.close(loading);
      this.trigger('initialInfo', {e1:el, data:data,chosen:0});
    }).fail(e => {
      layer.msg('获取服务日志失败',{icon:2});
    });

  };

  this.getRequestWithTraceIDByTimeRange = function(e, loading){
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

    $.ajax(address + ':17319/getRequestWithTraceIDByTimeRange', {
      async: true,
      type: 'post',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(time)
    }).done(data => {
      this.trigger('receiveLogWithTraceIDByTimeRange', data);
      this.trigger('showErrorPie', data);
      layer.close(loading);
    }).fail(e => {
      layer.msg('获取调用信息失败',{icon:2});
    });

  };

  this.after('initialize', function() {
    this.on(document, 'getLogByTraceID', this.getLogByTraceID);
    this.on(document, 'getCluster', this.getCluster);
    this.on(document, 'getLogByTraceIDAndServiceName', this.getLogByTraceIDAndServiceName);
    this.on(document, 'requestLogWithTraceIDByTimeRange', this.getRequestWithTraceIDByTimeRange);
  });

});


class globalVarClass{

  constructor(){
    this.currentTraceId = 0;
    this.selectedTraceId = [];
    this.selectedServices = [];
  }
  getCurrentTraceId(){
    return this.currentTraceId;
  }
  setCurrentTraceId(i){
    this.currentTraceId = i;
  }
  getSelectedTraceId(){
    return this.selectedTraceId;
  }
  setSelectedTraceId(index, t){
    this.selectedTraceId[index] = t;
  }
  getSelectedServices(){
    return this.selectedServices;
  }
  setSelectedServices(index, t){
    this.selectedServices[index] = t;
  }

}

export const globalVar = new globalVarClass();

