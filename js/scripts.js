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
    model: Product,
    initialize: function() {
        this.sync("read");
        this.on("add remove change", function() {
           this.sync("update", this.models);
        }, this);
    },
    sync: function(method, collection, options) {
        options = options || {};
        if (options.local) {
            if (method=="create" || method=="update") {
                localStorage.setItem( "cart", JSON.stringify(collection) );
            } else if (method=="read") {
                this.set(JSON.parse( localStorage.getItem("cart") ) || null);
            } else if (method=="delete") {
                localStorage.setItem("cart", null);
            }
            items.set(this.models, {
                add: false,
                remove: false
            });
        } else {
            Backbone.sync(method, collection, options);
        }
    }
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
        this.model.on("add remove change", this.render, this);
    },
    events: {
        "click .js-buy": "addToCart"
    },
    addToCart: function() {
        this.model.set("inCart", this.model.get("inCart")+1);
        this.render();
        //add it also to cart collection
        cart.set(this.model, {remove: false});
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
]);

var itemsView = new ProductsListView({
    collection: items
});

var cart = new CartList();



