;(function(Workflowy) {
  "use strict";

  Workflowy.Routers.Router = Backbone.Router.extend({
    routes: {
      '': 'index',
      ':uuid': 'show'
    },

    initialize: function(options) {
      this.$rootEl = options.$rootEl;
    },

    index: function() {
      var view = new Workflowy.Views.Index({collection: Workflowy.items});
      this._swapView(view);
    },

    show: function(uuid) {
      var item = Workflowy.flatItems.findWhere({uuid: uuid});
      var view = new Workflowy.Views.Show({model: item});
      this._swapView(view);
    },

    _swapView: function(newView) {
      if (this._currentView) this._currentView.remove();

      this._currentView = newView;
      this.$rootEl.html(newView.render().$el);
    }
  });
})(Workflowy);
