import moment from 'moment';
import {component} from 'flightjs';
import $ from 'jquery';
import queryString from 'query-string';
import DependencyData from '../component_data/dependency';
import LogGraphUI from '../component_ui/logGraphy';
import ServiceDataModal from '../component_ui/serviceDataModal';
import TimeStampUI from '../component_ui/timeStamp';
import {i18nInit} from '../component_ui/i18n';
import GoToLogUI from '../component_ui/goToLog';

import '../../libs/layer/layer';
import {logTemplate} from '../templates';
import SelectTree from '../component_ui/selectTree';
import LogData from '../component_data/log';
import SelectOperation from '../component_ui/selectOperation';
import InfoContent from '../component_ui/infoContent';
import ClassifyPanel from '../component_ui/classifyPanel';
import ErrorRatePanel from '../component_ui/errorRatePanel';
import TraceLogTable from '../component_ui/traceLogTable';

const LogPageComponent = component(function LogPage() {
  this.after('initialize', function() {
    const loading = layer.load(2,{
      shade: 0.3,
      scrollbar: false,
      zIndex: 20000000
    });
    try {

      window.document.title = 'Zipkin - Log';
      this.trigger(document, 'navigate', {route: 'zipkin/log'});

      this.$node.html(logTemplate());
      const {startTs, endTs} = queryString.parse(location.search);
      $('#endTs').val(endTs || moment().valueOf());
      // When #1185 is complete, the only visible granularity is day
      $('#startTs').val(startTs || moment().valueOf() - 86400000);
      DependencyData.attachTo('#dependency-container');
      LogGraphUI.attachTo('#dependency-container', {config: this.attr.config});
      ServiceDataModal.attachTo('#service-data-modal-container');
      TimeStampUI.attachTo('#end-ts');
      TimeStampUI.attachTo('#start-ts');
      GoToLogUI.attachTo('#dependency-query-form');
      i18nInit('dep');
      $(document.body).css('overflow-y','hidden');


      SelectTree.attachTo('#selectTree');
      TraceLogTable.attachTo('#traceLogTable');
      ErrorRatePanel.attachTo('#errorRatePanel');
      InfoContent.attachTo(document);
      ClassifyPanel.attachTo('#classify');
      SelectOperation.attachTo(document);
      LogData.attachTo(document);
      this.trigger('requestLogWithTraceIDByTimeRange',loading);

    } catch (e) {
      layer.close(loading);
    }
  });
});



export default function initializeLog(config) {
  LogPageComponent.attachTo('.content', {config});
}
