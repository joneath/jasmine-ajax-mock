# jasmine-ajax-mock

jasmine-ajax-mock is a plugin for jasmine-ajax that adds a similar interface for stubbing AJAX requests as the ruby gem WebMock. jasmine-ajax-mock adds the ability to stub specific request and to explicitly assert that a correct URL was requested.

## Usage
###jasmine.Ajax.stubRequest(method, url)
To stub a request use `jasmine.Ajax.stubRequest` and give it the HTTP method eg. "GET", "POST" and a request url.

    jasmine.Ajax.stubRequest("GET", "http://example.com")

This returns a stub object that you can then use to provide response data or assert that the request was made.

####Stub object
A stub object has two methods, `andReturn` and `andWait`.

    jasmine.Ajax.stubRequest("GET", "http://example.com").andReturn(myObj);

    jasmine.Ajax.stubRequest("GET", "http://example.com").andWait();

####Stub methods
#####andReturn(obj)
Immediately returns the AJAX response with the passed Object or JSON string (it's parsed into JSON internally).

    jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({status: 200, body: {received_response: true}});

#####andWait(obj)
Stores passed Object or JSON string and returns a response object that can then be used to trigger a response when desired.

    var request = jasmine.Ajax.stubRequest("GET", requestUrl).andWait({status: 200, body: {received_response: true}});

    // Using respond
    request.respond();

    // Using respondWith
    request.respondWith({body: {received_response: true}});

###jasmine.Ajax.getRequest(method, url)
jasmine.Ajax.getRequest returns a request object and can be used with the added `toHaveBeenRequested` matcher.

    expect(jasmine.Ajax.getRequest("GET", "http://example.com")).toHaveBeenRequested();

##Example
    describe("making a request", function() {
      var requestUrl = "http://example.com",
          success = jasmine.createSpy("onSuccess");

      beforeEach(function() {
        jQuery.ajax({
          url: requestUrl,
          type: "GET",
          success: success
        });
      });

      it("should be successful", function() {
        jasmine.Ajax.stubRequest("GET", requestUrl).andReturn({body: {received_response: true}});
        expect(jasmine.Ajax.getRequest("GET", requestUrl)).toHaveBeenRequested();
        expect(success).toHaveBeenCalled();
        expect(success.mostRecentCall.args[0]).toEqual({received_response: true});
        expect(success.mostRecentCall.args[2].status).toEqual(200);
      });
    });
