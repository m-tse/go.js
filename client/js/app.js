App = Ember.Application.create({ LOG_TRANSITIONS: true});

App.Router.map(function() {
  this.route("index", { path: "/" });
  this.route("about", { path: "/about" });

  this.resource("games", function(){
    console.log("Inside games...");
    this.route("new", {path:"/new"});
    this.route("edit", {path: "/:game_id" });
  })

});

App.Adapter = DS.RESTAdapter.extend({
  serializer: DS.RESTSerializer.extend({
    primaryKey: function (type){
      return '_id';
   }
  })
});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: 'App.Adapter'
});

DS.RESTAdapter.reopen({
  url: 'http://localhost:3000'
});

App.Game = DS.Model.extend({
  name: DS.attr('string'),
  boardSize: DS.attr('string')
});


App.GamesIndexRoute = Ember.Route.extend({
  setupController: function(controller) {
    var games = App.Game.find();
    games.on('didLoad', function() {
      console.log(" +++ Games loaded!");
    });
    controller.set('content', games);
  },
  renderTemplate: function() {
    this.render('games.index',{into:'application'});
  }
});

App.GamesEditRoute = Ember.Route.extend({
  setupController: function(controller, model) {
      this.controllerFor('games.edit').setProperties({isNew: false,content:model});
  },

  renderTemplate: function() {
    this.render('games.edit',{into:'application'});
  }
});

App.GamesNewRoute = Ember.Route.extend({
  setupController: function(controller, model) {
        this.controllerFor('games.edit').setProperties({isNew: true,content:App.Game.createRecord()});
  },
  renderTemplate: function() {
    this.render('games.edit',{into:'application'});
  }

});

App.GamesEditController = Ember.ObjectController.extend({
  updateItem: function(game) {
    game.transaction.commit();
    this.get("target").transitionTo("games");
  },

  isNew: function() {
    console.log("calculating isNew");
    return this.get('content').get('id');
  }.property()
});

App.GamesIndexController = Ember.ArrayController.extend({

  editCounter: function () {
    return this.filterProperty('selected', true).get('length');
  }.property('@each.selected'),

  itemsSelected: function() {
    return this.get("editCounter")>0;
  }.property('editCounter'),

  removeItem: function(game) {
    game.on("didDelete", this, function() {
      console.log("record deleted");
    });

    game.deleteRecord();
    game.transaction.commit();
  },

  removeSelectedGames: function() {
    arr = this.filterProperty('selected', true);
    if (arr.length==0) {
        output = "nothing selected";
    } else { 
        output = "";
        for (i=0 ; i<arr.length ; i++) { 
          arr[i].deleteRecord()
          arr[i].store.commit();
        }
    }
  },

  gamesPresent: function() {
    var itemsPresent = this.get('content').content.length > 0;
    console.log(" +++ Computed gamesPresent prop with value " + itemsPresent);
    return itemsPresent;
  }.property("content.@each")
  //}.property("content.isLoaded")
});


Ember.Handlebars.registerBoundHelper('gamesPresent', 
    function(myBinding, options) {
      console.log(myBinding);
      console.log(options);
      return true;
    }
);

App.NavView = Ember.View.extend({
    tagName: 'li',
    classNameBindings: ['active'],

    didInsertElement: function () {
          this._super();
          this.notifyPropertyChange('active');
          var _this = this;
          this.get('parentView').on('click', function () {
              _this.notifyPropertyChange('active');
          });
    },

    active: function() {
      return this.get('childViews.firstObject.active');
    }.property()
  });

