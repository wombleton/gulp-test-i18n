'use strict';

var _ = require('lodash'),
    path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2'),
    gettext = require('gettext-parser'),
    name = require(__dirname + '/../package.json').name;

module.exports = function (options) {
  options = options || {};
  _.defaults(options, {
    fn: function(s) {
      return s.split('').reverse().join('');
    },
    language: 'test'
  });

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(name, 'Streaming not supported'));
      return cb();
    }
    // Parse PO/POT file
    var parsed = gettext.po.parse(file.contents);
    parsed.headers.language = options.language;

    // Translate
    var translations = parsed.translations;

    _.each(translations, function(catalog) {
      _.each(catalog, function(translation, key) {
        if (key.length === 0) {
          return;
        }

        translation.msgstr[0] = options.fn(translation.msgid);

        if (translation.msgid_plural) {
          translation.msgstr[1] = options.fn(translation.msgid_plural);
        }
      });
    });

    file.contents = gettext.po.compile(parsed);

    // Rename abc.po or abc.pot to abc.[language].po
    var filePath = file.path,
        dirname = path.dirname(filePath),
        extension = path.extname(filePath),
        basename = path.basename(filePath, extension);

    file.path = path.join(dirname, basename + '.' + options.language + '.po');

    this.push(file);
    cb();
  });
};
