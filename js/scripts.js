// MODELS

var Product = Backbone.Model.extend({
    defaults: {
        inStore: 0,
        inCart: 0
    }
});


// COLLECTIONS

var ProductsList = Backbone.Collection.extend({
    model: Product
});

var CartList = Backbone.Collection.extend({
    model: Product
});

// VIEWS

var ProductView = Backbone.View.extend({
    el: "<div class='goods-item cf'></div>",
    template: _.template($("#goods-template").html()),
    render: function() {
        this.$el.html( this.template( this.model.toJSON() ) );
        return this;
    },
    initialize: function() {
        this.render();
    },
    events: {
        "click .js-buy": "addToCart"
    },
    addToCart: function() {
        this.model.set("inCart", this.model.get("inCart")+1);
        this.render();
    }
});

var ProductsListView = Backbone.View.extend({
    el: $("#goods"),
    render: function() {
        this.$el.empty();
        this.collection.each(function(product) {
            var item = new ProductView({model: product});
            this.$el.append(item.el);
        }, this);
    },
    initialize: function() {
        this.render();
    }
});


// INIT

var items = new ProductsList([
    {
        title: "Часы Salmon",
        description: "Модные и элегантные часы",
        image: "1.jpg",
        price: 1500,
        inStore: 5
    },
    {
        title: "Часы Albatros",
        description: "Современный выбор",
        image: "2.jpg",
        price: 2250,
        inStore: 4
    },
    {
        title: "Часы Flamingo",
        description: "Последняя модель",
        image: "3.jpg",
        price: 1800,
        inStore: 8
    },
    {
        title: "Часы Panda",
        description: "Для тех кто ценит деньги и стиль",
        image: "4.jpg",
        price: 1000,
        inStore: 12
    },
    {
        title: "Часы Meercat",
        description: "Лучшие из лучших",
        image: "5.jpg",
        price: 3200,
        inStore: 2
    }
]);

var itemsView = new ProductsListView({
    collection: items
});



