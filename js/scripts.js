// MODELS

// Модель продукта. Она будет универсальной для
// списков товаров при покупке и в корзине
var Product = Backbone.Model.extend({
    defaults: {
        // значения полей товара по умолчанию
        title: "Название не указано", // заголовок
        description: "Описание отсутствует", // описание
        price: 0, // цена
        inStore: 0, // количество на складе
        inCart: 0, // количество в корзине
        image: "noimage.jpg" // изображение
    }
});

// COLLECTIONS

// Коллекция списка товаров для страницы покупки
var ProductsList = Backbone.Collection.extend({
    model: Product, // Используемая модель: Product
    initialize: function() {

        // Устанавливаем url коллекции, чтобы запросить данные у сервера (имитации)
        this.url = "/products";
        // Делаем запрос
        this.fetch({
            success: function(collection, response) {

                // Принимаем данные от сервера
                collection.set(response);

                // Запускаем событие инициализации (для красивого появления соответствующего View)
                collection.trigger("init");
            }
        });

    }
});

//Коллекция списка товаров для страницы корзины
var CartList = Backbone.Collection.extend({
    model: Product, //Используемая модель: Product
    initialize: function() {

        // Задаем функцию для обновления количества товаров на складе
        // в соответсвии с тем, что лежит в корзине
        var updateProductsList = function() {

            // Меняем модели в списке товаров магазина так, чтобы
            items.set(this.models, {
                add: false, // не добавились новые (если что-то лежит в корзине, оно есть в магазине),
                remove: false // не удалились старые (если товара нет в корзине, это не значит, что его нет в магазине).
            });
        }.bind(this);

        // Вызываем эту функцию, когда пришел список товаров от сервера,
        // чтобы подкорректировать отображаемое количество товаров на складе,
        items.on("init", updateProductsList);
        // либо при изменении списка товаров, лежащих в корзине
        this.on("add remove change", function() {
            this.sync("update", this.models, {local: true});
            updateProductsList()
        }, this);

        // Берем значения корзины из localStorage - функция sync
        this.sync("read", null, {local: true});

        // Устанавливаем url для сохранения списка товаров
        this.url = "/cart"

    },

    // Меняем стандартный метод sync для работы с localStorage
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

// Отображение товара на странице покупки
var ProductView = Backbone.View.extend({
    el: "<div class='goods-item cf'></div>",
    template: _.template($("#goods-template").html()),
    render: function() {

        // Отрисовываем HTML по шаблону с учетом данных модели
        this.$el.html( this.template( this.model.toJSON() ) );
        return this;
    },
    initialize: function() {
        this.render();

        // Перерисовываем на изменение модели (необходимо для перерисовки
        // при изменении доступного количества на складе в результате,
        // например, удаления товара из корзины)
        this.model.on("add remove change", this.render, this);
    },
    // По клику на кнопку .js-buy добавляем товар в корзину
    events: {
        "click .js-buy": "addToCart"
    },
    addToCart: function() {

        // Добавляем +1 к количеству товара в корзине
        this.model.set("inCart", this.model.get("inCart")+1);

        // и добавляем товар в список товаров в корзине, если его там нет
        cart.set(this.model, {remove: false});
    }
});

// Отображение списка товаров
var ProductsListView = Backbone.View.extend({
    el: $("#goods"),
    render: function() {
        if (this.collection.length) {

            // Заполняем элемент, обходя все элементы соответствующей коллекции (items),
            // для каждого такого элемента создаем его View и добавляем его сюда
            this.$el.empty();
            this.collection.each(function(product) {
                var item = new ProductView({model: product});
                this.$el.append(item.el);
            }, this);
        } else {

            // Если товары еще не пришли с сервера показываем прелоадер
            this.$el.html("<p>Загрузка...</p>")
        }
    },
    initialize: function() {
        this.render();

        // При изменении коллекции перерисовываем список
        this.collection.on("add remove change", this.render, this);

        // Когда пришли данные от сервера, плавно показываем товары
        this.collection.on("init", function() {
            this.$el.hide().fadeIn(200);
        }, this);
    }
});

// Отображение товара в корзине
var CartItemView = ProductView.extend({
    el: "<div class='cart-item'>",
    template: _.template($("#cart-item-template").html()),
    // На клик по элементу .js-remove удаляем товар из корзины
    events: {
        "click .js-remove": "remove"
    },
    remove: function() {

        // Для данной модели устанавливаем количество в корзине равным 0,
        this.model.set("inCart", 0);

        // и удаляем эту модель из корзины
        cart.remove(this.model);
    }
});

//Отображение списка товаров в корзине
var CartListView = Backbone.View.extend({
    el: $("#cart"),
    template: _.template($("#cart-template").html()),
    // При рендеринге обходим всю коллекцию и для каждой модели создаем новый View товара в корзине.
    // Попутно рассчитываем общую сумму товаров в козине
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

        // Перерисовываем список, если соответствующая коллекция поменялась
        this.collection.on("add remove change", this.render, this);
    },

    // При клике на элемент js-save сохраняем список покупок (отправляем его на сервер)
    events: {
        "click .js-save": "save"
    },
    save: function() {
        Backbone.sync("update", this.collection, {

            // В данном примере имитация сервера случайным образом выберет исход обработки запроса
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

// Роутер и меню сайта
var $links = $(".menu-link");

// При клике на ссылки в меню
$links.click(function(e) {

    // не переходим по указанному url'у
    e.preventDefault();

    // и посредством экземпляра Backbone.Route переходим по нужному маршруту
    navigation.navigate($(this).attr("href"), {trigger: true});
});

var Navigation = Backbone.Router.extend({


    // Наши страницы
    routes: {
        "": "shop",
        "cart": "cart",
        "about": "about"
    },
    shop: function() {
        this.goToPage("");
    },
    cart: function() {
        this.goToPage("cart");
    },
    about: function() {
        this.goToPage("about");
    },


    // Функция для перехода к конкретному состоянию
    // и установке активного пункта меню
    goToPage: function(href) {
        $(".mode").stop().hide().filter(".mode--"+(href||"shop")).fadeIn(200);
        $links
            .removeClass("menu-link--active")
            .filter("[href='" + href + "']")
            .addClass("menu-link--active");
    }

});


// INIT

// Создаем необходимые экземпляры объектов

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

// Мини-плагин для показа сообщений (вызывается при отправке списка товаров на сервер)
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


