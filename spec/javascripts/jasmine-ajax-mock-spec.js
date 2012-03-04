describe("jasmine.Ajax.mock", function() {
  var success, error, complete;
  var requestUrl,
      otherRequestUrl;

  beforeEach(function() {
    requestUrl = "http://example.com/someApi";
    otherRequestUrl = "http://example.com/someOtherApi";

    success = jasmine.createSpy("onSuccess");
    error = jasmine.createSpy("onFailure");
    complete = jasmine.createSpy("onComplete");

    jasmine.Ajax.useMock();

    jQuery.ajax({
      url: requestUrl,
      type: "GET",
      success: success,
      complete: complete,
      error: error
    });
  });

  describe("toHaveBeenRequested matcher", function() {
    beforeEach(function() {
      jasmine.Ajax.stubRequest("GET", requestUrl).andReturn();
    });

    it("should add a toHaveBeenRequested matcher", function() {
      expect(expect().toHaveBeenRequested).toBeDefined();
    });

    describe("when a request was made to the expected matcher", function() {
      it("should be truthy", function() {
        expect(jasmine.Ajax.getRequest("GET", requestUrl)).toHaveBeenRequested();
      });
    });

    describe("when a request was not made to the expected matcher", function() {
      it("should be falsy", function() {
        expect(jasmine.Ajax.getRequest("GET", otherRequestUrl)).not.toHaveBeenRequested();
      });
    });
  });

  describe("#stubRequest", function() {
    describe("when given a action and URL", function() {
      describe("when the URL contains query params", function() {
        beforeEach(function() {
          clearAjaxRequests();
          jQuery.ajax({
            url: requestUrl + "?foo=bar&baz=roa",
            type: "GET",
            success: success,
            complete: complete,
            error: error
          });
        });

        it("should match any order of the query params", function() {
          jasmine.Ajax.stubRequest("GET", requestUrl + "?baz=roa&foo=bar").andReturn({status: 200, body: {received_response: true}});
          expect(success).toHaveBeenCalled();
          expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
        });

        it("should not match if a query param is missing", function() {
          expect(function() {
            jasmine.Ajax.stubRequest("GET", requestUrl + "?foo=bar").andReturn({status: 200, body: {received_response: true}});
          }).toThrow();
        });

        it("should not match if there are more query params expected than requested", function() {
          expect(function() {
            jasmine.Ajax.stubRequest("GET", requestUrl + "?baz=roa&foo=bar&bax=nan").andReturn({status: 200, body: {received_response: true}});
          }).toThrow();
        });
      });

      describe("when given a andReturn object", function() {
        it("should set the request's response to the andReturn object", function() {
          jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 200, body: {received_response: true}});
          expect(success).toHaveBeenCalled();
          expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
        });

        describe("when the request is not matched", function() {
          it("should throw a request not found error", function() {
            expect(function() {
              jasmine.Ajax.stubRequest("GET", requestUrl + "/not_here").andReturn({status: 200, body: {received_response: true}});
            }).toThrow();
          });
        });

        describe("when given an object", function() {
          it("should stub the request", function() {
            jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 200, body: {received_response: true}});
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
          });
        });

        describe("when given a JSON string", function() {
          it("should stub the request", function() {
            jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 200, body: JSON.stringify({received_response: true})});
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
          });
        });

        describe("when not given a body response", function() {
          it("should return an empty response", function() {
            jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 200});
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual(null);
          });
        });

        describe("when given a status code in the andReturn function", function() {
          it("should return a response with the supplied status code", function() {
            jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 503, body: {received_response: true}});
            expect(error).toHaveBeenCalled();
            expect(error.mostRecentCall.args[0].responseText).toEqual(JSON.stringify({received_response: true}));
            expect(error.mostRecentCall.args[0].status).toEqual(503);
          });
        });

        describe("when not given a status code in the andReturn function", function() {
          it("should return a 200 status code in the response", function() {
            jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({body: {received_response: true}});
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
            expect(success.mostRecentCall.args[2].status).toEqual(200);
          });
        });
      });

      describe("when andWait is called", function() {
        var stub;

        beforeEach(function() {
          stub = jasmine.Ajax.stubRequest("GET", requestUrl).andWait();
        });

        it("should not respond to the request immediately", function() {
          expect(success).not.toHaveBeenCalled();
        });

        describe("when the request is not matched", function() {
          it("should throw a request not found error", function() {
            var stub = jasmine.Ajax.stubRequest("GET", requestUrl + "/not_here");
            expect(function(){
              stub.respond();
            }).toThrow();
          });
        });

        describe("when no return data is given", function() {
          describe("when calling respond on the stub", function() {
            it("should respond to the request", function() {
              expect(success).not.toHaveBeenCalled();
              stub.respond();
              expect(success).toHaveBeenCalled();
              expect(success.mostRecentCall.args[0]).toEqual(null);
            });
          });

          describe("when calling respondWith on the stub", function() {
            it("should respond to the request with the provided data", function() {
              expect(success).not.toHaveBeenCalled();
              stub.respondWith({body: {received_response: true}});
              expect(success).toHaveBeenCalled();
              expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
            });
          });
        });

        describe("when return data is given", function() {
          beforeEach(function() {
            stub = jasmine.Ajax.stubRequest("GET", requestUrl).andWait({status: 200, body: {received_response: true}});
          });

          describe("when calling respond on the stub", function() {
            it("should respond to the request", function() {
              expect(success).not.toHaveBeenCalled();
              stub.respond();
              expect(success).toHaveBeenCalled();
              expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
            });
          });

          describe("when calling respondWith on the stub", function() {
            it("should respond to the request with the provided data", function() {
              expect(success).not.toHaveBeenCalled();
              stub.respondWith({body: {received_response: false}});
              expect(success).toHaveBeenCalled();
              expect(success.mostRecentCall.args[0]).toEqual({received_response: false});
            });
          });
        });
      });
    });
  });

  describe("#getRequest", function() {
    describe("when a request exists", function() {
      it("should return the request", function() {
        expect(jasmine.Ajax.getRequest("GET", requestUrl).request).toBeDefined();
        expect(jasmine.Ajax.getRequest("GET", requestUrl).requested).toBeTruthy();
      });
    });

    describe("when a request does not exist", function() {
      it("should return a an object with request as undefined", function() {
        expect(jasmine.Ajax.getRequest("GET", requestUrl + "/non-existant").request).toBeUndefined();
        expect(jasmine.Ajax.getRequest("GET", requestUrl + "/non-existant").requested).toBeFalsy();
      });
    });
  });
});
