//Function imitating ajax. "Server" randomly chooses between success or error

Backbone.ajax = function(request) {

    var deferred = $.Deferred();

    if (request.url == "cart") {

        deferred.done(function() {
            if (Math.random() > .5) {
                console.log("success");
                if (request && request.success) request.success();
            } else {
                console.log("error");
                if (request && request.error) request.error();
            }
        });

    } else if (request.url == "products") {

        deferred.done(function() {
            var items = [
                {
                    id: 1,
                    title: "Часы Salmon",
                    description: "Модные и элегантные часы",
                    image: "1.jpg",
                    price: 1500,
                    inStore: 5
                },
                {
                    id: 2,
                    title: "Часы Albatros",
                    description: "Современный выбор",
                    image: "2.jpg",
                    price: 2250,
                    inStore: 4
                },
                {
                    id: 3,
                    title: "Часы Flamingo",
                    description: "Последняя модель",
                    image: "3.jpg",
                    price: 1800,
                    inStore: 8
                },
                {
                    id: 4,
                    title: "Часы Panda",
                    description: "Для тех кто ценит деньги и стиль",
                    image: "4.jpg",
                    price: 1000,
                    inStore: 12
                },
                {
                    id: 5,
                    title: "Часы Meercat",
                    description: "Лучшие из лучших",
                    image: "5.jpg",
                    price: 3200,
                    inStore: 2
                }
            ];
            if (request.success) request.success(items);
        });



    }

    setTimeout(deferred.resolve, Math.random()*600+100);
    return deferred.promise();

};