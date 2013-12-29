App = Ember.Application.create({ LOG_TRANSITIONS: true});

App.Router.map(function() {
  this.route("index", { path: "/" });
  this.route("about", { path: "/about" });

  this.resource("games", function(){
    this.route("new", {path:"/new"});
    this.route("edit", {path: "/:game_id" });
  })

});


App.ApplicationAdapter = DS.RESTAdapter.extend({
  host: 'http://localhost:3000'
});

App.GameSerializer = DS.RESTSerializer.extend({
  // This method will be called 3 times: once for the post, and once
  // for each of the comments
  normalize: function(type, hash, property) {
    // property will be "post" for the post and "comments" for the
    // comments (the name in the payload)

    // normalize the `_id`
    var json = { id: hash._id };
    delete hash._id;

    // copy other properties
    for (var prop in hash) {
      json[prop] = hash[prop]; 
    }

    // delegate to any type-specific normalizations
    return this._super(type, json, property);
  }
});


App.Game = DS.Model.extend({
  name: DS.attr('string'),
  boardSize: DS.attr('string')
});


App.GamesIndexRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('game');
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
    this.controllerFor('games.edit').setProperties({isNew: true,content:this.store.createRecord('game')});
  },
  renderTemplate: function() {
    this.render('games.edit',{into:'application'});
  }

});

App.GamesEditController = Ember.ObjectController.extend({
  updateItem: function(game) {
    game.save();
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
    // game.on("didDelete", this, function() {
    //   console.log("record deleted");
    // });

    game.destroyRecord();
    // game.transaction.commit();
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
    // var itemsPresent = this.get('content').content.length > 0;
    // console.log(" +++ Computed gamesPresent prop with value " + itemsPresent);
    // return itemsPresent;
    return true;
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

