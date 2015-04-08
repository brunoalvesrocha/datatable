function MemoryDataTable(initialLines) {
	var self = this;

	self._lines = initialLines || [];

	self.isEmpty = function () {
		return self._lines.length < 1;
	};

	self._columnsComparator = function (o1, o2) {
		for (var i = 0; i < o1.length; i++) {
			var l = o1.toLowerCase();
			var r = o2.toLowerCase();
			if (l < r)
				return -1;
			if (l > r)
				return 1;
		}

		return 0;
	};

	self.add = function () {
		if (arguments[0] && arguments[0].getLines) {
			var lines = arguments[0].getLines();
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				self._lines.add(new Line(line.getValue(), line.getColumns()));
			}

		} else {
			var value = arguments[0];
			var columns = arguments[1];
			if (!_isArray(columns))
				columns = arguments.slice(1);

			columns = _cleanup(columns);
			self._lines.add(new Line(value, columns));
		}
	};

	self.inc = function () {
		if (arguments[0] && arguments[0].getLines) {
			var lines = arguments[0].getLines();
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				self.inc(line.getValue(), line.getColumns());
			}

		} else {
			var value = arguments[0];
			var columns = arguments[1];
			if (!_isArray(columns))
				columns = arguments.slice(1);

			var items = _getLines(columns);

			if (items.length < 1)
				self.add(value, columns);
			else
				items[0].value += value;
		}
	};

	self.getLines = function () {
		return self._lines;
	};

	function _getLines(columns) {
		if (!_isArray(columns))
			columns = arguments;

		columns = _cleanup(columns);

		return self._lines.filter(function (line) {
			if (columns.length != line._columns.length)
				return false;

			for (var i = 0; i < columns.length; ++i)
				if (columns[i] != line._columns[i])
					return false;

			return true;
		});
	}

	self.get = function (columns) {
		if (!_isArray(columns))
			columns = arguments;

		var filtered = _getLines(columns);

		var size = filtered.length;
		if (size > 1)
			throw ("More than one line has info: " + columns.join(", "));
		if (size < 1)
			throw ("Line not found: " + columns.join(", "));

		return filtered[0].getValue();
	};

	self.getColumn = function (column) {
		return self._lines.map(function (line) {
			return line.getColumn(column);
		});
	};

	self.getColumns = function (columns) {
		if (!_isArray(columns))
			columns = arguments;

		return self._lines.map(function (line) {
			return line.getColumns(columns);
		});
	};

	self.getDistinct = function (columns) {
		if (!_isArray(columns))
			columns = arguments;

		var result = new SimpleSet(function (e) { return e.join("\n"); });

		for (var i = 0; i < self._lines.length; ++i)
			result.add(self._lines[i].getColumns(columns));

		result = result.toArray();

		result.sort(self._columnsComparator);

		if (columns.length == 1)
			result = result.map(function (e) { return e[0] });

		return result;
	};

	self.groupBy = function (columns) {
		if (!_isArray(columns))
			columns = arguments;

		var result = new MemoryDataTable();

		for (var i = 0; i < self._lines.length; ++i) {
			var line = self._lines[i];
			result.inc(line.getValue(), line.getColumns(columns));
		}

		return result;
	};

	self.filter = function () {
		if (typeof arguments[0] === "number" && typeof arguments[1] === "function") {
			var column = arguments[0];
			var predicate = arguments[1];

			return new MemoryDataTable(self._lines.filter(function (line) {
				return predicate(line.getColumn(column));
			}));

		} else if (typeof arguments[0] === "number") {
			var column = arguments[0];
			var value = arguments[1];

			return new MemoryDataTable(self._lines.filter(function (line) {
				return line.hasInfo(column, value);
			}));

		} else if (typeof arguments[0] === "function") {
			var predicate = arguments[0];

			return new MemoryDataTable(self._lines.filter(predicate));

		} else {
			if (arguments.length < 1)
				return self;

			var columns = arguments[0];
			if (!_isArray(columns))
				columns = arguments;

			return new MemoryDataTable(self._lines.filter(function (line) {
				return line.infoStartsWith(columns);
			}));
		}
	};

	self.map = function (column, transform) {
		return new MemoryDataTable(self._lines.map(function (line) {
			var orig = line.getColumn(column);
			var transformed = transform(orig);

			if (orig == transformed)
				return line;

			var columns = line._columns.slice();
			columns[column] = transformed;

			if (column + 1 > line.columns.length)
				columns = _cleanup(columns);

			return new Line(line.value, columns);
		}));
	};

	self.sum = function () {
		return self._lines.reduce(function (total, line) { return total + line.getValue; }, 0);
	};

	function _cleanup(info) {
		info = _removeEmptyAtEnd(info);
		info = _replaceNull(info);
		return info;
	}

	function _removeEmptyAtEnd(info) {
		var last = info.length - 1;
		for (; last > 0; last--)
			if (!_isNull(info[last]) && info[last] !== "")
				break;
		last++;
		if (last == info.length)
			return info;
		else
			return info.slice(0, last);
	}

	function _replaceNull(info) {
		var nullPos = _findNull(info);
		if (nullPos < 0)
			return info;

		var result = info.slice();
		for (var i = nullPos; i < result.length; i++)
			if (_isNull(result[i]))
				result[i] = "";
		return result;
	}

	function _findNull(info) {
		for (var i = 0; i < info.length; i++)
			if (_isNull(info[i]))
				return i;
		return -1;
	}

	function _isNull(obj) {
		return obj === null || obj === undefined;
	}

	function _isArray(obj) {
		if (_isNull(obj))
			return false;
		else
			return obj.toString() === '[object Array]';
	}

	function Line(initialValue, initialColumns) {
		var self = this;

		self._value = initialValue;
		self._columns = initialColumns;

		self.hasInfo = function (column, name) {
			if (column >= self._columns.length)
				return name == "";

			return self._columns[column] == name;
		};

		self.infoStartsWith = function (start) {
			for (var i = 0; i < start.length; i++) {
				var val = self.getColumn(i);
				if (val != start[i])
					return false;
			}

			return true;
		};

		self.getValue = function () {
			return self._value;
		};

		self.getColumn = function (column) {
			if (column <= self._columns.length)
				return "";

			return self._columns[column];
		};

		self.getColumns = function (columnIndexes) {
			if (!columnIndexes)
				return self._columns;

			var result = [];
			for (var i = 0; i < columnIndexes.length; i++)
				result.push(self.getColumn(columnIndexes[i]));
			return result;
		};

		self.toString = function () {
			return "Line[" + self._value + " " + self._columns.join(", ") + "]";
		};
	}

	function SimpleSet(createKey) {
		var self = this;

		self._data = {};

		createKey = createKey || function (obj) {
			return '' + obj;
		};

		self.add = function (obj) {
			self._data[createKey(obj)] = obj;
		};

		self.remove = function (obj) {
			delete self._data[createKey(obj)];
		};

		self.contains = function (obj) {
			return self._data.hasOwnProperty(createKey(obj));
		};

		self.toArray = function () {
			return objectToArray(self._data, function (k, v) { return v; });
		};

		return self;
	}

	function objectToArray(obj, getElement) {
		if (!getElement) {
			getElement = function (key, value) {
				return {
					key: key,
					value: value
				};
			};
		}

		var result = [];

		for (var key in obj)
			if (obj.hasOwnProperty(key))
				result.push(getElement(key, obj[key]));

		return result;
	}

	return self;
}