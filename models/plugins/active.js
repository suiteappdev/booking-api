module.exports = exports = function activePlugin(schema, required) {

    required || (required = true)

  schema.add({  			
		active : {
		      type : Boolean,
		      default : true,
		      required : required
		  }
  });

};