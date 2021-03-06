/*jslint nomen: false*/
/*global window, jQuery, localStorage, console, QUOTA_EXCEEDED_ERR*/

function LocalStorageAdapter(index_key, prefix_key) {
	this.index_key = index_key || "local_index";
	this.prefix_key = prefix_key || "store_";
	
	if (typeof(localStorage) === 'undefined') {
		return false;
	} else {
		return this;
	}
}

LocalStorageAdapter.prototype = {
	
	index: function (callback) {
		var rows = [],
			self = this;
		
		$.each(this._index(), function (idx, item) {
			rows.push(_.extend({id: item.id}, self.readLocalStorage(item.id)));
		});
		
		row = _.sortBy(rows, function (item) {
			return item.title.toLowerCase();
		});
		
		callback(rows);
	},
	
	find: function (id, callback) {
	  var row = this.readLocalStorage(id);
	  callback(row ? [row] : []);
	},
	
	
	find_by_title: function (title, callback) {
		this.find(this.find_index("title", title), callback);
	},
	
	
	find_index: function (key, value) {
		var i, l, id,
			idx = this._index();
		
		for (i = 0, l = idx.length; i < l; i += 1) {
			if (idx[i][key] === value) {
				id = idx[i].id;
				break;
			}
		}
		
		return id;
	},
	
	
	save: function (id, params, callback) {
		var updated_at = Date.now(),
			key = this.find_index("title", params.title) || this.prefix_key + updated_at;
		
		console.log("save", key, params)
		this.updateIndex({id: key, title: params.title, updated_at: updated_at});
		callback(this.writeLocalStorage(key, params));
	},
	
	
	updateIndex: function (params) {
		var idx = this._index(),
			updated, i, l;
		
		for (i = 0, l = idx.length; i < l; i += 1) {
			if (idx[i].id === params.id) {
				idx[i] = params;
				updated = true;
				break;
			}
		}
		
		if (!updated) {
			idx.push(params);
		}
		
		this.writeLocalStorage(this.index_key, idx);
	},
	
	
	destroy: function (id, callback) {
		var idx = this._index(), i, l, success = false;
		
		console.log("delete", id)
		
		try {
			localStorage.removeItem(id);
			
			// remove from index
			for (i = 0, l = idx.length; i < l; i += 1) {
				if (idx[i].id === id) {
					idx.splice(i, 1);
					this.writeLocalStorage(this.index_key, idx);
					success = true
					break;
				}
			}
			
		} catch (e) {
			console.error("localStorage removeItem error", e);
		}
		
		callback(success);
	},
	
	_index: function () {
		return this.readLocalStorage(this.index_key) || [];
	},
	
	readLocalStorage: function (id) {
		var value;
		
		try {
			value = JSON.parse(localStorage.getItem(id));
		} catch (e) {
			console.error("Read local storage error", e);
		}
		
		return value;
	},
	
	
	writeLocalStorage: function (id, params) {
		var status = false;
		
		try {
			localStorage.setItem(id, JSON.stringify(params));
			status = true;
		} catch (e) {
			alert("Local storage quota exceeded. Could not save!");
		}
		
		return status;
	}
};