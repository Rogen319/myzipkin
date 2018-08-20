import {component} from 'flightjs';
import $ from 'jquery';
import '../../libs/layer/layer';


// const address = 'http://10.141.212.25';
const address = 'http://10.141.212.137';

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

  this.getRequestWithTraceIDByTimeRange = function(){
    // console.log("getRequestWithTraceIDByTimeRange..");
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

    // const data = {
    //   "status": true,
    //   "message": "Succeed to get the request with trace ids of specified time range. The size of request types is [9].",
    //   "requestWithTraceInfoList": [
    //     {
    //       "requestType": "Collect",
    //       "traceTypeList": [
    //         {
    //           "typeName": "Collect-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "5b09a52483ba8523",
    //               "serviceList": [
    //                 "ts-execute-service",
    //                 "ts-order-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-execute-service",
    //                   "normalCount": 2,
    //                   "errorCount": 0,
    //                   "exceptionCount": 3
    //                 },
    //                 {
    //                   "serviceName": "ts-order-service",
    //                   "normalCount": 3,
    //                   "errorCount": 1,
    //                   "exceptionCount": 2
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 20,
    //               "errorCount": 2,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 20,
    //           "errorCount": 2,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 20,
    //       "errorCount": 2,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "requestType": "Execute",
    //       "traceTypeList": [
    //         {
    //           "typeName": "Execute-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "a33f0d268025e289",
    //               "serviceList": [
    //                 "ts-execute-service",
    //                 "ts-order-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-execute-service",
    //                   "normalCount": 1,
    //                   "errorCount": 2,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-order-service",
    //                   "normalCount": 1,
    //                   "errorCount": 2,
    //                   "exceptionCount": 3
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 21,
    //               "errorCount": 1,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 21,
    //           "errorCount": 1,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 21,
    //       "errorCount": 1,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "requestType": "GetFood",
    //       "traceTypeList": [
    //         {
    //           "typeName": "GetFood-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "c4dd7538bb080619",
    //               "serviceList": [
    //                 "ts-food-service",
    //                 "ts-food-map-service",
    //                 "ts-travel-service",
    //                 "ts-route-service",
    //                 "ts-station-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-travel-service",
    //                   "normalCount": 2,
    //                   "errorCount": 2,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-food-service",
    //                   "normalCount": 1,
    //                   "errorCount": 4,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-food-map-service",
    //                   "normalCount": 3,
    //                   "errorCount": 4,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-route-service",
    //                   "normalCount": 1,
    //                   "errorCount": 1,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-station-service",
    //                   "normalCount": 1,
    //                   "errorCount": 3,
    //                   "exceptionCount": 0
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 48,
    //               "errorCount": 8,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 48,
    //           "errorCount": 8,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 48,
    //       "errorCount": 8,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "requestType": "Login",
    //       "traceTypeList": [
    //         {
    //           "typeName": "Login-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "94705e85fb9fc04f",
    //               "serviceList": [
    //                 "ts-login-service",
    //                 "ts-verification-code-service",
    //                 "ts-sso-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-login-service",
    //                   "normalCount": 5,
    //                   "errorCount": 2,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-verification-code-service",
    //                   "normalCount": 0,
    //                   "errorCount": 1,
    //                   "exceptionCount": 1
    //                 },
    //                 {
    //                   "serviceName": "ts-sso-service",
    //                   "normalCount": 2,
    //                   "errorCount": 5,
    //                   "exceptionCount": 1
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 30,
    //               "errorCount": 4,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 30,
    //           "errorCount": 4,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 30,
    //       "errorCount": 4,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "requestType": "Pay",
    //       "traceTypeList": [
    //         {
    //           "typeName": "Pay-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "43b5d8f4cca0ad7b",
    //               "serviceList": [
    //                 "ts-inside-payment-service",
    //                 "ts-order-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-inside-payment-service",
    //                   "normalCount": 0,
    //                   "errorCount": 1,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-order-service",
    //                   "normalCount": 3,
    //                   "errorCount": 3,
    //                   "exceptionCount": 0
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 15,
    //               "errorCount": 3,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 15,
    //           "errorCount": 3,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 15,
    //       "errorCount": 3,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "requestType": "PreserveTicket",
    //       "traceTypeList": [
    //         {
    //           "typeName": "PreserveTicket-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "d35d3bde6e818b00",
    //               "serviceList": [
    //                 "ts-preserve-service",
    //                 "ts-sso-service",
    //                 "ts-security-service",
    //                 "ts-order-service",
    //                 "ts-order-other-service",
    //                 "ts-contacts-service",
    //                 "ts-travel-service",
    //                 "ts-ticketinfo-service",
    //                 "ts-basic-service",
    //                 "ts-station-service",
    //                 "ts-train-service",
    //                 "ts-route-service",
    //                 "ts-price-service",
    //                 "ts-seat-service",
    //                 "ts-config-service",
    //                 "ts-assurance-service",
    //                 "ts-food-service",
    //                 "ts-consign-service",
    //                 "ts-consign-price-service",
    //                 "ts-notification-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-basic-service",
    //                   "normalCount": 16,
    //                   "errorCount": 18,
    //                   "exceptionCount": 10
    //                 },
    //                 {
    //                   "serviceName": "ts-config-service",
    //                   "normalCount": 1,
    //                   "errorCount": 3,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-price-service",
    //                   "normalCount": 2,
    //                   "errorCount": 5,
    //                   "exceptionCount": 1
    //                 },
    //                 {
    //                   "serviceName": "ts-travel-service",
    //                   "normalCount": 14,
    //                   "errorCount": 13,
    //                   "exceptionCount": 4
    //                 },
    //                 {
    //                   "serviceName": "ts-train-service",
    //                   "normalCount": 4,
    //                   "errorCount": 7,
    //                   "exceptionCount": 1
    //                 },
    //                 {
    //                   "serviceName": "ts-assurance-service",
    //                   "normalCount": 1,
    //                   "errorCount": 1,
    //                   "exceptionCount": 1
    //                 },
    //                 {
    //                   "serviceName": "ts-contacts-service",
    //                   "normalCount": 0,
    //                   "errorCount": 3,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-food-service",
    //                   "normalCount": 3,
    //                   "errorCount": 1,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-station-service",
    //                   "normalCount": 8,
    //                   "errorCount": 15,
    //                   "exceptionCount": 13
    //                 },
    //                 {
    //                   "serviceName": "ts-route-service",
    //                   "normalCount": 1,
    //                   "errorCount": 5,
    //                   "exceptionCount": 6
    //                 },
    //                 {
    //                   "serviceName": "ts-notification-service",
    //                   "normalCount": 0,
    //                   "errorCount": 0,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-security-service",
    //                   "normalCount": 4,
    //                   "errorCount": 4,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-ticketinfo-service",
    //                   "normalCount": 7,
    //                   "errorCount": 8,
    //                   "exceptionCount": 5
    //                 },
    //                 {
    //                   "serviceName": "ts-seat-service",
    //                   "normalCount": 4,
    //                   "errorCount": 11,
    //                   "exceptionCount": 4
    //                 },
    //                 {
    //                   "serviceName": "ts-order-service",
    //                   "normalCount": 10,
    //                   "errorCount": 9,
    //                   "exceptionCount": 5
    //                 },
    //                 {
    //                   "serviceName": "ts-consign-service",
    //                   "normalCount": 0,
    //                   "errorCount": 1,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-sso-service",
    //                   "normalCount": 2,
    //                   "errorCount": 8,
    //                   "exceptionCount": 1
    //                 },
    //                 {
    //                   "serviceName": "ts-preserve-service",
    //                   "normalCount": 7,
    //                   "errorCount": 11,
    //                   "exceptionCount": 14
    //                 },
    //                 {
    //                   "serviceName": "ts-consign-price-service",
    //                   "normalCount": 1,
    //                   "errorCount": 1,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-order-other-service",
    //                   "normalCount": 1,
    //                   "errorCount": 2,
    //                   "exceptionCount": 0
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 501,
    //               "errorCount": 65,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 501,
    //           "errorCount": 65,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 501,
    //       "errorCount": 65,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "requestType": "QueryTravelInfo",
    //       "traceTypeList": [
    //         {
    //           "typeName": "QueryTravelInfo-Type1",
    //           "traceInfoList": [
    //             {
    //               "traceId": "5a01e6dae6f6030c",
    //               "serviceList": [
    //                 "ts-travel-service",
    //                 "ts-ticketinfo-service",
    //                 "ts-basic-service",
    //                 "ts-station-service",
    //                 "ts-route-service",
    //                 "ts-train-service",
    //                 "ts-price-service",
    //                 "ts-order-service",
    //                 "ts-seat-service",
    //                 "ts-config-service"
    //               ],
    //               "serviceWithCounts": [
    //                 {
    //                   "serviceName": "ts-basic-service",
    //                   "normalCount": 10,
    //                   "errorCount": 14,
    //                   "exceptionCount": 10
    //                 },
    //                 {
    //                   "serviceName": "ts-config-service",
    //                   "normalCount": 3,
    //                   "errorCount": 1,
    //                   "exceptionCount": 0
    //                 },
    //                 {
    //                   "serviceName": "ts-ticketinfo-service",
    //                   "normalCount": 4,
    //                   "errorCount": 8,
    //                   "exceptionCount": 6
    //                 },
    //                 {
    //                   "serviceName": "ts-price-service",
    //                   "normalCount": 2,
    //                   "errorCount": 0,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-travel-service",
    //                   "normalCount": 11,
    //                   "errorCount": 15,
    //                   "exceptionCount": 4
    //                 },
    //                 {
    //                   "serviceName": "ts-train-service",
    //                   "normalCount": 4,
    //                   "errorCount": 2,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-seat-service",
    //                   "normalCount": 4,
    //                   "errorCount": 6,
    //                   "exceptionCount": 2
    //                 },
    //                 {
    //                   "serviceName": "ts-station-service",
    //                   "normalCount": 8,
    //                   "errorCount": 11,
    //                   "exceptionCount": 5
    //                 },
    //                 {
    //                   "serviceName": "ts-route-service",
    //                   "normalCount": 5,
    //                   "errorCount": 6,
    //                   "exceptionCount": 5
    //                 },
    //                 {
    //                   "serviceName": "ts-order-service",
    //                   "normalCount": 2,
    //                   "errorCount": 2,
    //                   "exceptionCount": 6
    //                 }
    //               ],
    //               "status": 0,
    //               "normalCount": 281,
    //               "errorCount": 39,
    //               "exceptionCount": 0
    //             }
    //           ],
    //           "count": 1,
    //           "normalCount": 281,
    //           "errorCount": 39,
    //           "exceptionCount": 0,
    //           "normalTraceCount": 1,
    //           "errorTraceCount": 0
    //         }
    //       ],
    //       "normalCount": 281,
    //       "errorCount": 39,
    //       "exceptionCount": 0,
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     }
    //   ],
    //   "serviceWithTraceStatusCountList": [
    //     {
    //       "serviceName": "ts-basic-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-price-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 1
    //     },
    //     {
    //       "serviceName": "ts-travel-service",
    //       "normalTraceCount": 3,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-train-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-assurance-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-route-service",
    //       "normalTraceCount": 3,
    //       "errorTraceCount": 2
    //     },
    //     {
    //       "serviceName": "ts-food-map-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-security-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-execute-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-ticketinfo-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-login-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 1
    //     },
    //     {
    //       "serviceName": "ts-order-service",
    //       "normalTraceCount": 5,
    //       "errorTraceCount": 10
    //     },
    //     {
    //       "serviceName": "ts-consign-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-preserve-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-order-other-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-config-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 30
    //     },
    //     {
    //       "serviceName": "ts-contacts-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-food-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-station-service",
    //       "normalTraceCount": 3,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-notification-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-inside-payment-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-verification-code-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-seat-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-sso-service",
    //       "normalTraceCount": 2,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-consign-price-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     }
    //   ]
    // };
    // this.trigger('receiveRequestWithTraceIDByTimeRange', data);
    // this.trigger('showErrorPie', data);
    // // layer.close(loading);
    // this.trigger('closeLoading');

    $.ajax(address + ':17319/getRequestWithTraceIDByTimeRange', {
      async: true,
      type: 'post',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(time)
    }).done(data => {
      this.trigger('receiveRequestWithTraceIDByTimeRange', data);
      this.trigger('showErrorPie', data);
      this.trigger('closeLoading');

      // this.trigger('receiveRequestWithTraceIDByTimeRange', data);
      // this.trigger('showErrorPie', data);
      // layer.close(loading);
    }).fail(e => {
      layer.msg('获取调用信息失败',{icon:2});
    });

  };

  this.getServiceWithTraceCountByRequestType = function(e, requestType){
    let request = {
      requestType: requestType,
    };
    let parm = window.location.search;
    if (parm.length > 1){
      parm = parm.substring(1,parm.length);
      request.endTime = Number(parm.split('&')[0].split('=')[1]) ;
      request.lookback = request.endTime - Number(parm.split('&')[1].split('=')[1]) ;
    }
    else{
      request.endTime = (new Date()).getTime();
      request.lookback = 86400000;
    }

    // const data = {
    //   "status": true,
    //   "message": "Succeed to get the service with trace count of requestType:[Login]. Size is [3]. ",
    //   "serviceWithTraceStatusCountList": [
    //     {
    //       "serviceName": "ts-login-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 1
    //     },
    //     {
    //       "serviceName": "ts-verification-code-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-sso-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     }
    //   ]
    // };
    // if(data.status){
    //   this.trigger('renderServiceBorder',{list: data.serviceWithTraceStatusCountList});
    // } else {
    //   layer.msg('获取服务错误率信息失败',{icon:2});
    // }

    $.ajax(address + ':17319/getServiceWithTraceCountByRequestType', {
      async: true,
      type: 'post',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(request)
    }).done(data => {
      console.log(data);
      if(data.status){
        this.trigger('renderServiceBorder',{list: data.serviceWithTraceStatusCountList});
      } else {
        layer.msg('获取服务错误率信息失败',{icon:2});
      }
    }).fail(e => {
      layer.msg('获取服务错误率信息失败',{icon:2});
    });
  };

  this.getServiceWithTraceCountByTraceType = function(e, d){
    let request = {
      requestType: d.requestType,
      services: d.services
    };
    let parm = window.location.search;
    if (parm.length > 1){
      parm = parm.substring(1,parm.length);
      request.endTime = Number(parm.split('&')[0].split('=')[1]) ;
      request.lookback = request.endTime - Number(parm.split('&')[1].split('=')[1]) ;
    }
    else{
      request.endTime = (new Date()).getTime();
      request.lookback = 86400000;
    }

    // const data ={
    //   "status": true,
    //   "message": "Succeed to get the service with trace count of traceType. Size is [5]. ",
    //   "serviceWithTraceStatusCountList": [
    //     {
    //       "serviceName": "ts-travel-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-food-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-food-map-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-route-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 0
    //     },
    //     {
    //       "serviceName": "ts-station-service",
    //       "normalTraceCount": 1,
    //       "errorTraceCount": 3
    //     }
    //   ]
    // };
    // if(data.status){
    //   this.trigger('renderServiceBorder',{list: data.serviceWithTraceStatusCountList});
    // } else {
    //   layer.msg('获取服务错误率信息失败',{icon:2});
    // }

    $.ajax(address + ':17319/getServiceWithTraceCountByTraceType', {
      async: true,
      type: 'post',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(request)
    }).done(data => {
      console.log(data);
      if(data.status){
        this.trigger('renderServiceBorder',{list: data.serviceWithTraceStatusCountList});
      } else {
        layer.msg('获取服务错误率信息失败',{icon:2});
      }
    }).fail(e => {
      layer.msg('获取服务错误率信息失败',{icon:2});
    });
  };

  this.after('initialize', function() {
    this.on(document, 'getLogByTraceID', this.getLogByTraceID);
    this.on(document, 'getCluster', this.getCluster);
    this.on(document, 'getLogByTraceIDAndServiceName', this.getLogByTraceIDAndServiceName);
    this.on(document, 'requestLogWithTraceIDByTimeRange', this.getRequestWithTraceIDByTimeRange);
    this.on(document, 'getServiceWithTraceCountByRequestType', this.getServiceWithTraceCountByRequestType);
    this.on(document, 'getServiceWithTraceCountByTraceType', this.getServiceWithTraceCountByTraceType);
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

