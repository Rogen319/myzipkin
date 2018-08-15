import {component} from 'flightjs';
import $ from 'jquery';
import '../../libs/layer/layer';


const address = 'http://10.141.212.25';

export default component(function dependency() {

  this.getRequestWithTraceIDByTimeRange = function(ev, loading){
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
      this.trigger('receiveLogWithTraceIDByTimeRange', {data:data, loading:loading});
    }).fail(e => {
      layer.msg('获取调用信息失败',{icon:2});
    });
  };

  this.after('initialize', function() {
    this.on(document, 'requestLogWithTraceIDByTimeRange', this.getRequestWithTraceIDByTimeRange);
  });

});


export function getLogByTraceIDAndServiceName (el,traceId,serviceName,loading) {
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
      this.trigger('initialInfo', {e1:e1, data:data,chosen:0});
      // initialInfo(el,data,0);
    },
    error: function (event) {
      layer.msg('获取服务日志失败',{icon:2});
    }
  });
}

export function getLogByTraceID(traceId,type,loading) {
  $.ajax({
    async: true,
    url: address + ':16319/getLogByTraceId/'+traceId+"/"+type,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      this.trigger('initLogVis', {data:data,loading:loading});
      // initLogVis(data,loading);
    },
    error: function (event) {
      layer.msg('获取调用链日志失败',{icon:2});
    }
  });
}

export function getCluster(classifyNumber,loading) {
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
    url: address + ':18888/cluster?endTs='+ time.endTime.toString() +'&lookback='+ time.lookback.toString() +'&k='+ classifyNumber.toString(),
    type: 'get',
    contentType: "application/json",
    dataType: 'json',
    success: function (data) {
      layer.close(loading);
      this.trigger('initColor', data);
      this.trigger('showClassifyNoticeWindow', data);
      // initColor(data);
      // showClassifyNoticeWindow(data);
    },
    error: function (event) {
      layer.msg('获取服务日志失败',{icon:2});
    }
  });
}

export var currentTraceId = 0;
export var selectedTraceId = [];
export var selectedTraceId = [];
