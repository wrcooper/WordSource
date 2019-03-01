class FreqDistNode {
  constructor(token, count, freq){
    this.token = token;
    this.count = count;
    this.freq = freq;
  }
}

class LenDistNode {
  constructor(len, count, freq){
    this.len = len;
    this.count = count;
    this.freq = freq;
  }
}

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
	
	self.deselect_wordsource = function(){
		self.available.selected = -1;
		self.selected.selected = -1;
	}
	
	self.process_wordsource = function(wordsource_id){
		$.post(process_wordsource_url,
			{
				wordsource_id: wordsource_id
			},
			function(data){
        self.selected.tokens = data.tokens;
        self.selected.freq_dist = data.freq_dist;
        self.selected.len_dist = data.len_dist;
        self.selected.outcomes = data.outcomes;
        self.selected.filename = data.filename;
        
        self.selected.freq_array = formFreqArray(self.selected.freq_dist, self.selected.outcomes);
        self.selected.len_array = formLenArray(self.selected.len_dist, self.selected.outcomes);
        self.draw_freqdist();
				return;
			}
		)
	}
  
  self.draw_freqdist = function(){
    if (self.selected.visattr == 'token'){
      self.draw_tokendist();
    }else{
      self.draw_lendist();
    }
  }
  
  self.draw_tokendist = function(){  
    maxFreq = Math.max.apply(Math, self.selected.freq_array.map(function(o) { return o.freq; }))
    
    first = self.selected.freq_array.slice(0, self.selected.to_display)
    drawTokVis(first, maxFreq, self.selected.filename);
  }
  
  self.draw_lendist = function(){
    maxFreq = Math.max.apply(Math, self.selected.len_array.map(function(o) { return o.freq; }));
    first = self.selected.len_array.slice(0, self.selected.to_display)
    drawLenVis(first, maxFreq, self.selected.filename);
  }
  
  self.draw_concordance = function(){
    drawConcordance();
  } 
  
  self.get_concordance = function(){
    console.log("Getting concordance...");
    $.post(get_concordance_url,
      {
        query: self.selected.query,
        wordsource_id: self.selected.selected,
      },
      function (data){
        console.log(self.selected.query);
        console.log(data.concordance);
        self.selected.concordance = data.concordance;
      })
  }
  
  self.generate_text = function(){
    $.post(generate_text_url,
      {
        tokens: self.selected.tokens
      },
      function(data){
        console.log(data.generated);
      }
    )
  }
  
  self.draw_generated = function(){
    self.generate_text();
  }
  
  function formFreqArray(freq_dist, n){
    var freqArray = [];
    for (var token in freq_dist){
      percentage = calculatePercentage(freq_dist[token], n);
      freq_obj = new FreqDistNode(token, freq_dist[token], percentage)
      freqArray.push(freq_obj);
    }
    freqArray.sort(compareFreqNodes);
    return freqArray;
  }
  
  function formLenArray(len_dist, n){
    var lenArray = [];
    for (var len in len_dist){
      percentage = calculatePercentage(len_dist[len], n);
      len_obj = new LenDistNode(len, len_dist[len], percentage)
      lenArray.push(len_obj);
    }
    lenArray.sort(compareFreqNodes);
    return lenArray;
  }
  
  function compareFreqNodes(a, b){
    if (a.count > b.count){
      return -1;
    }
    if (a.count < b.count){
      return 1;
    }
    return 0;
  }
  
  function calculatePercentage(count, n){
    percentage = (count / n) * 100;
    return percentage;
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
  
  self.select_vis = function(type){
    self.selected.vis_type = type;
    if (type == 'freq'){
      self.draw_freqdist();
    }else if (type == 'gen'){
      self.draw_generated();
    }else if (type == 'conc'){
      self.draw_concordance();
    }
  }
  
  self.set_visattr = function(attr){
    self.selected.visattr = attr;
    self.draw_freqdist();
  }
  
	self.selected = new Vue({
		el: "#selected_wordsource",
		delimiters: ['${', '}'],
		unsafeDelimiters: ['!{', '}'],
		data: {
			selected: -1,
			wordsource_origin: "",
			wordsource_name: "",
      to_display: 20,
      tokens: [],
      freq_dist: [],
      len_dist: [],
      freq_array: [],
      len_array: [],
      vis_type: 'freq',
      visattr: 'token',
      filename: '',
      query: '',
      concordance: [],
      to_display_conc: 10
		},
		methods:{
			process_wordsource: self.process_wordsource,
      select_vis: self.select_vis,
      set_visattr: self.set_visattr,
      draw_freqdist: self.draw_freqdist,
      get_concordance: self.get_concordance
		}
		
	});
	
	self.get_user();
	
	
	return self;
}

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});