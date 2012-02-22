(function(jasmineAjax) {
  var self = jasmineAjax;
  var mocks;

  beforeEach(function() {
    mocks = { };
    this.addMatchers({
      toHaveBeenRequested: function(expected) {
        if (this.actual && this.actual.responded) {
          return true;
        } else {
          return false;
        }
      }
    });
  });

  var findRequest = function(action, url) {
    for(var i = 0; i < ajaxRequests.length; i++) {
      if (ajaxRequests[i].method === action && ajaxRequests[i].url === url) {
        return ajaxRequests[i];
      }
    }
  };

  var buildResponse = function(data) {
    var response = { };
    data = data || { };
    response.status = data.status || 200;
    response.responseText = data.body || "";

    if (typeof(response.responseText) !== "string") {
      response.responseText = JSON.stringify(response.responseText);
    }

    return response;
  };

  var andReturn = function(mock) {
    var mockRequest = mock;
    return (function(data) {
      var response = buildResponse(data);
      var request = findRequest(mockRequest.action, mockRequest.url);
      if (request) {
        mockRequest.responded = true;
        mockRequest.request = request;
        request.response(response);
      }
    });
  };

  var respondWrap = function(data, mock) {
    var storedResponse = buildResponse(data);
    var mockRequest = mock;
    return (function() {
      var request = findRequest(mockRequest.action, mockRequest.url);
      if (request) {
        mockRequest.responded = true;
        mockRequest.request = request;
        request.response(storedResponse);
      }
    });
  };

  var andWait = function(mock) {
    var mockRequest = mock;
    return (function(data) {
      var exports = {
        respond: respondWrap(data, mockRequest),
        respondWith: andReturn(mockRequest)
      };

      return exports;
    });
  };

  self.stubRequest = function(action, url) {
    var exports = {
      action: action,
      url: url,
      responded: false
    };

    exports.andReturn = andReturn(exports);
    exports.andWait = andWait(exports);

    mocks[action + "_" + url] = exports;
    return exports;
  };

  self.getMock = function(action, url) {
    return mocks[action + "_" + url];
  };

  return self;
}(jasmine.Ajax));
