module.exports = exports = function metadataPlugin(schema, required) {

  required || (required = false)

  schema.add({
  	metadata: Object,
    required : required
  });

};