var app = function() {
	self.available = {};
	
  Vue.config.silent = false; // show all warnings
	
	self.get_user = function(){
		console.log("getting user")
		$.getJSON(get_user_url,
			function(data){
				console.log(data);
				self.available.user_id = data.user_id;
				if (self.available.user_id != -1){
					self.get_wordsources(self.available.user_id);
				}
			}
		);
	}
	
	self.get_wordsources = function(user_id){
		console.log("getting wordsources...");
		
		$.post(get_wordsources_url,
			{
				user_id: user_id
			},
			function(data){
				self.available.wordsources = data.wordsources;
				console.log(data.wordsources);
			}
		);
	}
	
	self.delete_wordsource = function(wordsource_id, wordsource_name){
		if (confirm("Really delete " + wordsource_name + "?")){
			$.post(delete_wordsource_url,
				{wordsource_id: wordsource_id},
				function(data){
					console.log("Wordsource " + wordsource_name + " deleted!")
				}
			)
		} else {
			return;
		}
	}
	
	self.select_wordsource = function(wordsource_id){
		$.post(select_wordsource_url,
			{
				wordsource_id: wordsource_id
			},
			function(data){
				wordsource = data.wordsource[0];
				console.log(wordsource);
				
				self.available.selected = wordsource.id;
				
				self.selected.wordsource_origin = wordsource.origin;
				self.selected.wordsource_name = wordsource.name;
				self.selected.selected = wordsource.id;
				self.process_wordsource(wordsource.id);
				
				return;
			}
		)
	}
	
	self.process_wordsource = function(wordsource_id){
		$.post(process_wordsource_url,
			{
				wordsource_id: wordsource_id
			},
			function(data){
				console.log("WordSource processed");
				return;
			}
		)
	}
	
	self.available = new Vue({
		el: "#available_wordsources",
		delimiters: ['${', '}'],
		unsafeDelimiters: ['!{', '}'],
		data: {
			user_id: -1,
			message: "Hello Vue!",
			wordsources: [],
			selected: -1
		},
		methods: {
			get_user: self.get_user,
			get_wordsources: self.get_wordsources,
			delete_wordsource: self.delete_wordsource
		}
	});
	
	self.selected = new Vue({
		el: "#selected_wordsource",
		delimiters: ['${', '}'],
		unsafeDelimiters: ['!{', '}'],
		data: {
			selected: -1,
			wordsource_origin: "",
			wordsource_name: ""
		},
		methods:{
			process_wordsource: self.process_wordsource,
		}
		
	});
	
	self.get_user();
	
	
	return self;
}

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});