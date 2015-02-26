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
        this.on("add remove change", function() {
            this.sync("update", this.models, {local: true});
            items.set(this.models, {
                add: false,
                remove: false
            });
        }, this);
        this.sync("read", null, {local: true});
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

var CartItemView = ProductView.extend({
    el: "<div class='cart-item'>",
    template: _.template($("#cart-item-template").html()),
    events: {
        "click .js-remove": "remove"
    },
    remove: function() {
        this.model.set("inCart", 0);
        cart.remove(this.model);
    }
});

var CartListView = Backbone.View.extend({
    el: $("#cart"),
    template: _.template($("#cart-template").html()),
    render: function() {
        if (this.collection.length) {
            var sum = 0;
            this.$el.html( this.template() );
            this.collection.each(function(product) {
                var item = new CartItemView({model: product});
                this.$(".cart-list").append(item.el);

                var price = product.get("price")*product.get("inCart");
                sum += price;
            }, this);
            this.$(".js-sum").html(sum);
        } else {
            this.$el.html("<p>Ваша корзина пуста.</p>")
        }
    },
    initialize: function() {
        this.render();
        this.collection.on("add remove change", this.render, this);
    }
});

//ROUTER

var $links = $(".menu-link");
$links.click(function(e) {
    e.preventDefault();
    navigation.navigate($(this).attr("href"), {trigger: true});
});

var Navigation = Backbone.Router.extend({

    routes: {
        "": "shop",
        "cart": "cart"
    },
    shop: function() {
        $(".mode").stop().hide().filter(".mode--shop").fadeIn(200);
        this.updateMenu("");
    },
    cart: function() {
        $(".mode").stop().hide().filter(".mode--cart").fadeIn(200);
        this.updateMenu("cart");
    },

    updateMenu: function(href) {
        $links
            .removeClass("menu-link--active")
            .filter("[href='" + href + "']")
            .addClass("menu-link--active");
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

var cartView = new CartListView({
    collection: cart
});

var navigation = new Navigation();
Backbone.history.start();


