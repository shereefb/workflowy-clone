Workflowy.Models.Item = Backbone.Model.extend({
  url: function() {
    return '/items/' + this.get('uuid');
  },

  initialize: function() {
    this.listenTo(this, 'change', this.updateChangeTime);
    this.listenTo(this, 'sync', this.updateSyncTime);
  },

  children: function() {
    if (!this._children) {
      this._children =  new Workflowy.Collections.Items({parent: this});
    }
    return this._children;
  },

  parse: function(response) {
    Workflowy.flatItems.add(this);
    this.children().set(
      response.children,
      {parse: true}
    );
    return response.item;
  },

  toJSON: function(options) {
    return _.omit(this, 'collapsed');
  },

  updateChangeTime: function() {
    this._changeTime = new Date();
    Workflowy.unsavedItems.add(this);
  },

  updateSyncTime: function() {
    this._syncTime = new Date();
    if (this._syncTime.getTime() > this._changeTime.getTime()) {
      Workflowy.unsavedItems.remove(this);
    }
  },

  shortenedNotes: function() {
    var notes = this.escape('notes') || '';
    var lines = notes.split(/\r?\n/, 1);

    if (lines.length > 1) {
      return lines[0] + '...';
    } else {
      return lines[0];
    }
  },

  aTag: function() {
    var uuid = this.get('uuid');
    var title = this.escape('title');

    return '<a href="#' + uuid + '">' + title + '</a>';
  },

  // do not record this into undoable actions or mark the document as unsaved
  toggleCollapsed: function() {
    if (this.children().isEmpty()) return;
    this.set('collapsed', !this.get('collapsed'))

    $.ajax({
      url: this.url() + '/collapse',
      type: 'patch',

      success: function(response) {
        this.set('collapsed', response.collapsed);
      }.bind(this)
    });
  },

  title: function(value) {
    if (value !== null && value != this.get('title')) {
      this.updateChangeTime();
      this.save({title: value}, {
        silent: true,
        patch: true,
        success: function() {
        },
        error: function() {
          //TODO flash an error message
        }
      });
    }
    return this.get('title');
  },

  notes: function(value) {
    if (value !== undefined && value != this.get('notes')) {
      this.updateChangeTime();
      this.save({notes: value}, {
        silent: true,
        patch: true,
        success: function() {
        },
        error: function() {
          //TODO flash an error message
        }
      });
    }
    return this.get('notes') || '';
  }
});
