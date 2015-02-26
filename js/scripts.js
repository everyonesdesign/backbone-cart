// MODELS

var Product = Backbone.Model.extend({
    defaults: {
        inStore: 0,
        inCart: 0
    }
});

// COLLECTIONS

var ProductsList = Backbone.Collection.extend({
    model: Product,
    initialize: function() {
        this.url = "products";
        this.fetch({
            success: function(collection, response) {
                collection.set(response);
                collection.trigger("init");
            }
        });
    }
});

var CartList = Backbone.Collection.extend({
    model: Product,
    initialize: function() {
        var updateProductsList = function() {
            items.set(this.models, {
                add: false,
                remove: false
            });
        }.bind(this);
        items.on("init", updateProductsList);
        this.on("add remove change", function() {
            this.sync("update", this.models, {local: true});
            updateProductsList()
        }, this);
        this.sync("read", null, {local: true});
        this.url = "cart"
    },
    sync: function(method, collection, options) {
        options = options || {};
        if (options.local) {
            if (method=="delete" || (collection && !collection.length)) {
                localStorage.setItem("cart", null);
            } else if (method=="create" || method=="update") {
                localStorage.setItem( "cart", JSON.stringify(collection) );
            } else if (method=="read") {
                this.set(JSON.parse( localStorage.getItem("cart") ) || null);
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
        if (this.collection.length) {
            this.$el.empty();
            this.collection.each(function(product) {
                var item = new ProductView({model: product});
                this.$el.append(item.el);
            }, this);
        } else {
            this.$el.html("<p>Загрузка...</p>")
        }
    },
    initialize: function() {
        this.render();
        this.collection.on("add remove change", this.render, this);
        this.collection.on("init", function() {
            this.$el.hide().fadeIn(200);
        }, this);
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
    },
    events: {
        "click .js-save": "save"
    },
    save: function() {
        Backbone.sync("update", this.collection, {
            success: function() {
                addMessage("Ваш заказ сохранен!", "success")
            },
            error: function() {
                addMessage("Ошибка при сохранении заказа, попробуйте еще раз", "error")
            }
        });
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
        "cart": "cart",
        "about": "about"
    },
    shop: function() {
        $(".mode").stop().hide().filter(".mode--shop").fadeIn(200);
        this.updateMenu("");
    },
    cart: function() {
        $(".mode").stop().hide().filter(".mode--cart").fadeIn(200);
        this.updateMenu("cart");
    },
    about: function() {
        $(".mode").stop().hide().filter(".mode--about").fadeIn(200);
        this.updateMenu("about");
    },

    updateMenu: function(href) {
        $links
            .removeClass("menu-link--active")
            .filter("[href='" + href + "']")
            .addClass("menu-link--active");
    }

});


// INIT

var items = new ProductsList();

var cart = new CartList();

new ProductsListView({
    collection: items
});

new CartListView({
    collection: cart
});

var navigation = new Navigation();
Backbone.history.start();

function addMessage(text, status) {
    var $messages = $("#messages"),
        $message = $("<div class='messages-item'>" + text + "</div>");
    if (status) {
        $message.addClass("messages-item--" + status);
    }
    $messages.append($message);
    setTimeout(function() {
        $message.fadeOut(400, function() {
            $message.remove();
        });
    }, 3000);
}


