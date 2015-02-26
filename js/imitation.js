//Function imitating ajax. "Server" randomly chooses between success or error

Backbone.ajax = function(request) {

    if (Math.random() > .5) {
        console.log("success");
        if (request && request.success) request.success();
    } else {
        console.log("error");
        if (request && request.error) request.error();
    }

};