define(function () {

  'use strict';

  return function (scribe) {
    var iframe = document.createElement('iframe');
    iframe.className = 'scribe-rte-iframe';
    scribe.el.parentNode.insertBefore(iframe, scribe.el);

    var html = '<!DOCTYPE html>';
    html += '<html><head>';
    if (scribe.options.iframe.cssUrl) {
      html += '<link type="text/css" rel="stylesheet" href="' + scribe.options.iframe.cssUrl + '" />';
    }
    if (scribe.options.iframe.contentSecurityPolicy) {
      html += '<meta http-equiv="Content-Security-Policy" content="' + scribe.options.iframe.contentSecurityPolicy + '" />';
    }
    html += '</head><body id="iframe-body"></body></html>';

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
    iframe.contentWindow.document.body.appendChild(scribe.el);

    scribe.targetWindow = iframe.contentWindow;
    scribe.targetDocument = iframe.contentWindow.document;
  };

});
