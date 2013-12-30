App = Ember.Application.create({ LOG_TRANSITIONS: true});

App.Router.map(function() {
  this.route("index", { path: "/" });
  this.route("about", { path: "/about" });

  this.resource("games", function(){
    this.route("new", {path:"/new"});
    this.route("edit", {path: "/:game_id" });
  });
  this.resource('game', { path: '/game/:game_id' });


});


App.ApplicationAdapter = DS.RESTAdapter.extend({
  host: 'http://localhost:3000'
});

App.GameSerializer = DS.RESTSerializer.extend({
  normalize: function(type, hash, property) {
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
  boardSize: DS.attr('number')
});


App.GamesIndexRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('game');
  }
});

App.GamesEditRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this.controllerFor('games.edit').setProperties({isNew: false,content:model});
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

App.BoardState = Ember.Object.extend({
  init: function(){
    var boardSize = this.get('boardSize')
    for (var i=0;i<boardSize;i++){
      rowArray = [];
      for (var j=0;j<boardSize;j++){
        rowArray.push(0);
      };
      this.x.push(rowArray);
    }

    },
  x: []
});

App.GameIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('game', params.game_id);
  },
  setupController: function(controller, model) {
    controller.set('model', model)
  }
});

App.GameController = Ember.ObjectController.extend({
  secondName: function(){return this.get('name')+'45'}.property('model.secondName'),
  boardState: function(){
    var boardSize = this.get('boardSize');
    var boardArray = [];
    for (var i=0;i<boardSize;i++){
      var rowArray = [];
      for (var j=0;j<boardSize;j++){
        rowArray.push('0');
      };
      boardArray.push(rowArray);
    }
    return boardArray;
  }.property('model.boardState')
})


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

