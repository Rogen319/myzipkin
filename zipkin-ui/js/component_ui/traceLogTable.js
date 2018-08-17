import {component} from 'flightjs';
import $ from 'jquery';
import {traceLogTableTemplate} from "../templates";
import {contextRoot} from '../publicPath';
import '../../libs/layer/layer';
import {globalVar} from "../component_data/log";

export default component(function traceLog() {

  var showLogVis = false;
  var currentSort = 1;

  this.initControlLogVis = function () {
    $('#traceLogTable').show();
    $('#controlLogVis').show();
    $('#controlLogVis').html('隐藏调用链日志');
    $('#controlLogVis').unbind('click');
    $('#controlLogVis').on('click',function () {
      console.log("showLogVis...");
      console.log(showLogVis);
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
      $(this).trigger('keepTraceOn');
      // this.keepTraceOn();
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

  this.processLogs = function(traceLog){
    let logs = traceLog.logs;
    for (let i = 0;i < logs.length;i++) {
      logs[i].serviceInfo.nodeString = JSON.stringify(logs[i].serviceInfo.node);
      logs[i].serviceInfo.instanceInfoString = JSON.stringify(logs[i].serviceInfo.instanceInfo);
      if(logs[i].isError == 1) logs[i].isDanger = true;
      else if(logs[i].isError == 2) logs[i].isWarning = true;
      else logs[i].isNormal = true;
    }
    return traceLog;
  };

  this.initSortClick = function(){
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
        $(this).trigger('getLogByTraceID',
          {traceId:globalVar.getSelectedTraceId()[globalVar.getCurrentTraceId()],type:currentSort,loading:loading});
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
        $(this).trigger('getLogByTraceID',
          {traceId:globalVar.getSelectedTraceId()[globalVar.getCurrentTraceId()],type:currentSort,loading:loading});
      }
    });
    if(currentSort == 1){
      $('#sortByURI').children('i').hide();
      $('#sortByTime').children('i').show();
    } else {
      $('#sortByURI').children('i').show();
      $('#sortByTime').children('i').hide();
    }

  };

  this.initLogVis = function() {

    // if(logs.length > 0) {
      $('#logVis').css('height', window.screen.height * 0.3 + 'px');
      $('#selectTree').css('height', window.screen.height * 0.39 + 'px');
      $('#logEntrance').css('bottom', window.screen.height * 0.3 + 'px');
      $('#logEntrance').show();
      $('#logVis').show();
      this.listenMove($('#logVis'),$('#logEntrance'));
      this.initControlLogVis();
      this.keepTraceOn();
      this.optTableStyle();
      $('#logTable').find('.nodeBtn').each(function () {
        let node = JSON.parse($(this).find('.nodeInfo').html());
        $(this).click(function () {
          $(this).trigger('showNodeInfo', node);
        });
      });
      $('#logTable').find('.serviceInstanceBtn').each(function () {
        let serviceInstance = JSON.parse($(this).find('.serviceInstanceInfo').html());
        $(this).click(function () {
          $(this).trigger('showServiceInstanceInfo', serviceInstance);
        });
      });
    // }
  };


  this.render = function(traceLog) {
    const model = traceLog;
    this.$node.html(traceLogTableTemplate({
      contextRoot,
      ...model
    }));
    $('#errorCount').html(traceLog.errorCount);
    $('#exceptionCount').html(traceLog.exceptionCount);
    $('#normalCount').html(traceLog.normalCount);
  };

  this.after('initialize', function afterInitialize() {

    this.on(document, 'initLogVis',function(e,d){
      this.render(this.processLogs(d.data));
      layer.close(d.loading);
      this.initLogVis();
      this.initSortClick();
    });

    this.on(document, 'keepTraceOn',this.keepTraceOn);
  })
})
