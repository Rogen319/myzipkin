import {component} from 'flightjs';
import $ from 'jquery';
import {contextRoot} from '../publicPath';
import '../../libs/layer/layer';
import {showServiceInfo} from './infoContent';
import {globalVar} from '../component_data/log';
import {initialServiceColor, isInArray} from './publicOperation';



export default component(function select() {

  Array.prototype.contains = function(element) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == element) {
        return true;
      }
    }
    return false;
  };

  this.highlightServices = function() {
    // this.initialServiceColor();
    initialServiceColor();
    let nodes = document.getElementsByClassName('node enter');
    for (let i = 0; i < nodes.length; i++) {
      let tn =  nodes[i].getAttribute('data-node');
      if(globalVar.getSelectedTraceId().length >= 2){
        if (isInArray(globalVar.getSelectedServices()[globalVar.getCurrentTraceId()],tn)) {
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#0FF0F1');
        }
        let t = globalVar.getCurrentTraceId() === 0 ? 1 : 0;
        if (isInArray(globalVar.getSelectedServices()[t], tn)) {
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#ADFF2F');
        }
        if(isInArray(globalVar.getSelectedServices()[globalVar.getCurrentTraceId()], tn) && isInArray(globalVar.getSelectedServices()[t], tn)){
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#1E90FF');
        }
      }
      else if(globalVar.getSelectedTraceId().length == 1){
        if (isInArray(globalVar.getSelectedServices()[globalVar.getCurrentTraceId()],tn)) {
          let node = nodes[i].getElementsByTagName('rect')[0];
          node.setAttribute('fill', '#0FF0F1');
        }
      }
    }
  };

  this.initServiceClick = function () {
    var ss = $('#dependency-container').find('.node.enter')
    ss.each(function() {
      $(this).unbind('click');
      const serviceName = $(this).find('text').children().eq(0).html();
      if(globalVar.getSelectedServices().length >= 2){
        if(globalVar.getSelectedServices()[0].contains(serviceName) && globalVar.getSelectedServices()[1].contains(serviceName)){
          $(this).bind('click',function(){
            showServiceInfo(globalVar.getSelectedTraceId()[globalVar.getCurrentTraceId()],serviceName,1)
          });
        }
        else if(globalVar.getSelectedServices()[0].contains(serviceName)){
          $(this).bind('click', function (){
            showServiceInfo(globalVar.getSelectedTraceId()[0],serviceName,0);
          });
        }
        else if(globalVar.getSelectedServices()[1].contains(serviceName)){
          $(this).bind('click',function (){
            showServiceInfo(globalVar.getSelectedTraceId()[1],serviceName,0)
          });
        }
      }
      else if(globalVar.getSelectedServices().length == 1){
        if(globalVar.getSelectedServices()[0].contains(serviceName)){
          $(this).bind('click',function (){
            showServiceInfo(globalVar.getSelectedTraceId()[0],serviceName,0);
          });
        }
      }
    });
  };

  this.locateTraceInSelectTree = function() {
    let nodeList = [];
    $('#selectTree').find('.tree-node').each(function () {
      if ($.trim($(this).find('.field').html()) === 'root'){
        $(this).css('color', '');
        $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
        $(this).next().slideUp(500,function () {
          $(this).children('[data-toggle="tooltip"]').tooltip('hide');
        });
        $(this).find('.open').val('false');
        $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');

        $(this).next().find('.tree-node').each(function () {
          $(this).css('color', '');
          $(this).css('background-color','rgba(242,222,222,'+ $.trim($(this).find('.shade').html()) +')');
          $(this).next().slideUp(500,function () {
            $(this).children('[data-toggle="tooltip"]').tooltip('hide');
          });
          $(this).find('.open').val('false');
          $(this).find('.status').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        });
      }
      if ($.trim($(this).find('.field').html()) === 'trace') {
        let t = $.trim($(this).find('.title').html());
        if(t === globalVar.getSelectedTraceId()[globalVar.getCurrentTraceId()]){
          nodeList[0] = $(this).next();
          nodeList[1] = $(this).parent().parent();
          nodeList[2] = nodeList[1].parent().parent();
        }
      }
    });

    for(let i = 2;i >= 0;i--){
      nodeList[i].find('.open').val('true');
      nodeList[i].find('.status').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
      nodeList[i].slideDown(500,function () {
        $(this).children('li').each(function () {
          $(this).children('a').children('span').tooltip();
        });
      });
    }
    nodeList[0].prev().css({'background-color': '#777777', 'color': '#FFFFFF'});
  };

  this.showNoticeWindow = function () {
    let html = '';
    for(let i = 0;i < globalVar.getSelectedTraceId().length ;i++){
      html += '<li class="list-group-item">' +
        '          <div class = "color-box pull-left">' +
        '          </div>&nbsp;' +
        globalVar.getSelectedTraceId()[i] +
        '          <button type="button" class="close pull-right"><span aria-hidden="true">&times;</span></button>' +
        '        </li>';
    }
    if(globalVar.getSelectedTraceId().length >= 2){
      html += '<li class="list-group-item">' +
        '          <div class = "color-box pull-left">' +
        '          </div>&nbsp;' +
        '共同Service'+
        '        </li>';
    }

    $('#selectedTrace').html(html);

    $('#selectedTrace').children('li').each(function (i) {
      if(i < 2){
        $(this).bind('click',function () {
          globalVar.setCurrentTraceId(i) ;
          // hightLightAndShowLog();
          $(this).trigger('hightLightAndShowLog');
          // this.locateTraceInSelectTree();
          $(this).trigger('locateTraceInSelectTree');
        });
        $(this).find('.close').bind('click',function () {
          globalVar.getSelectedTraceId().splice(i,1);
          globalVar.getSelectedServices().splice(i,1);
          if(globalVar.getSelectedTraceId().length >= 1){
            globalVar.setCurrentTraceId(0);
            // hightLightAndShowLog();
            $(this).trigger('hightLightAndShowLog');
            // this.locateTraceInSelectTree();
            $(this).trigger('locateTraceInSelectTree');
          }
          else {
            $('#logEntrance').hide();
            $('#logVis').hide();
            // this.highlightServices();
            $(this).trigger('highlightServices');
            $('#selectedTrace').html('');
            // this.closeAll();
            $(this).trigger('closeAll');
          }
          //防止冒泡事件
          event.stopPropagation();
        });
        if(i === globalVar.getCurrentTraceId()){
          $(this).css('background-color','#B0C4DE');
          $(this).find('.color-box').css('background-color','#0FF0F1');
        }
        else
          $(this).find('.color-box').css('background-color','#ADFF2F');
      }
      else {
        $(this).find('.color-box').css('background-color', '#1E90FF');
      }

    });
  };

  //////////////// 显示service错误率 //////////////////////////////

  // this.cleanAllServiceColor = function(){
  //   let nodes = document.getElementsByClassName('node enter');
  //   for (let i = 0; i < nodes.length; i++) {
  //     let node = nodes[i].getElementsByTagName('rect')[0];
  //     // node.style.stroke = "#333";
  //     // node.style.strokeWidth = "1px";
  //     node.setAttribute('fill', '#fff');
  //   }
  // };

  this.renderServiceBorder = function(e, data){
    initialServiceColor();
    const list = data.list || [];
    list.forEach(function(service){
        if(service.errorTraceCount > 0){
          let temp = "[data-node='"+service.serviceName+"']";
          let node = $(temp);
          if(node[0]){
            node = $(temp)[0].childNodes[0];
            // let strokeWidth = 5 * service.errorTraceCount / (service.errorTraceCount + service.normalTraceCount);
            // node.style.stroke = "#CC0000";
            // node.style.strokeWidth = strokeWidth + "px";

            let r = 200 + 50 * (service.normalTraceCount / (service.errorTraceCount + service.normalTraceCount));
            node.setAttribute('fill', "rgb("+r+",0, 0)");
            let alpha = 0.5 + 0.5 * service.errorTraceCount / (service.errorTraceCount + service.normalTraceCount);
            node.style.opacity = alpha;
          }
        }
    })
  };

  //////////////////////// 显示异步调用，改变边框粗细 ////////////////////////////////////
  this.cleanAllServiceBorder = function(){
    let nodes = document.getElementsByClassName('node enter');
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i].getElementsByTagName('rect')[0];
      node.style.stroke = "#333";
      node.style.strokeWidth = "1px";
    }
  };

  this.renderAsyncServiceBorder = function(e, d){
    this.cleanAllServiceBorder();
    let asynServices = d.asynServices || [];
    // console.log(asynServices);
    asynServices.forEach(function(service){
      let temp = "[data-node='"+service+"']";
      let node = $(temp);
      if(node[0]){
        node = $(temp)[0].childNodes[0];
        node.style.stroke = "#6699CC";
        node.style.strokeWidth = "8px";
      }
    });

  };

  /////////////////////////////////////////////////////////////

  this.after('initialize', function afterInitialize() {

    this.on(document, 'locateTraceInSelectTree', this.locateTraceInSelectTree);
    this.on(document, 'highlightServices', this.highlightServices);
    this.on(document, 'renderServiceBorder', this.renderServiceBorder);
    this.on(document, 'renderAsyncServiceBorder', this.renderAsyncServiceBorder);

    this.on(document, 'hightLightAndShowLog', function() {
      this.highlightServices();
      this.initServiceClick();
      this.showNoticeWindow();
      const loading = layer.load(2,{
        shade: 0.3,
        scrollbar: false,
        zIndex: 20000000
      });
      this.trigger('getLogByTraceID',
        {traceId:globalVar.getSelectedTraceId()[globalVar.getCurrentTraceId()],type:1,loading:loading});
    });

  });

});
