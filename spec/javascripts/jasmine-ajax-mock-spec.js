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
        expect(jasmine.Ajax.getMock("GET", requestUrl)).toHaveBeenRequested();
      });
    });

    describe("when a request was not made to the expected matcher", function() {
      it("should be falsy", function() {
        expect(jasmine.Ajax.getMock("GET", otherRequestUrl)).not.toHaveBeenRequested();
      });
    });
  });

  describe("stubRequest", function() {
    describe("when given a action and URL", function() {
      describe("when given a andReturn object", function() {
        it("should set the request's response to the andReturn object", function() {
          jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 200, body: {received_response: true}});
          expect(success).toHaveBeenCalled();
          expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
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

  describe("getMock", function() {
    describe("when the given action and url have been stubbed", function() {
      beforeEach(function() {
        jasmine.Ajax.stubRequest("GET", requestUrl).andReturn(JSON.stringify({received_response: true}));
      });

      it("should return the mocked request object", function() {
        var mock = jasmine.Ajax.getMock("GET", requestUrl);
        expect(mock).toBeDefined();
      });
    });

    describe("when the given action and url have not been stubbed", function() {
      it("should return undefined", function() {
        var mock = jasmine.Ajax.getMock("GET", otherRequestUrl);
        expect(mock).toBeUndefined();
      });
    });
  });
});
