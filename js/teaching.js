angular.module('acadApp')

.controller('TeachCtrl', ['$scope', '$http', '$filter', '$uibModal',
	function($scope, $http, $filter, $uibModal) {

	$scope.getDate = function(pub) {
		if (pub.Fields.Month) {
	   		return new Date(Date.parse(pub.Fields.Month +" 1, " + pub.Fields.Year));
		} else {
	   		return new Date(Date.parse("Jan 1, " + pub.Fields.Year));
		}
 	};

	// Remove ands
	var replaceAllButLast = function(string, token) {
		if (string.indexOf(token) == -1) {
			return string;
		}
		var parts = string.split(token);
		return parts.slice(0,-1) + token + parts.slice(-1)
	};

	// Give a nicely formatted bibtex entry
	var setBib = function(pub) {
		var text = '@' + pub.EntryType + '{' + pub.EntryKey
		Object.keys(pub.Fields).forEach(function (key) {
			if (key != 'Abstract' && key !='Author_noand'
				&& key != 'Url' && key != 'Slides') {
				text += ', \n  ' + key + ' = {' + pub.Fields[key] + '}'
		}
	})
		text += '\n}'
		return text;
	};

  	// Read data from bibfile
  	$http({method: 'GET', url: 'data/pubs/bibfile_students.bib'}).
  	then(function(response) {
	  	// Parse bibtex to JSON
	  	rawbib = response.data;
	  	var rawjson = angular.fromJson(BibtexParser(response.data));

	  	// Remove `and' between authors
	  	for (index = 0; index < rawjson.entries.length; ++index) {
	  		rawjson.entries[index].Fields.Author_noand = 
	  		replaceAllButLast(rawjson.entries[index].Fields.Author, " and");
	  	}

	  	sorted_pubs = [];
                
                pub_search = $filter('filter')(rawjson.entries, {'EntryType': 'unpublished'}, false);
	  	if (pub_search.length) { sorted_pubs.push({ name:'Preprints', pubs: pub_search}) };
                
	  	pub_search = $filter('filter')(rawjson.entries, {'EntryType': 'article'}, false);
	  	if (pub_search.length) { sorted_pubs.push({ name:'Journal papers', pubs: pub_search}) };

	  	pub_search = $filter('filter')(rawjson.entries, {'EntryType': 'inproceedings'}, false);
	  	if (pub_search.length) { sorted_pubs.push({ name:'Conference proceedings', pubs: pub_search}) };

	  	pub_search = $filter('filter')(rawjson.entries, {'EntryType': 'book'}, false);
	  	if (pub_search.length) { sorted_pubs.push({ name:'Books and chapters', pubs: pub_search}) };
                
                pub_search = $filter('filter')(rawjson.entries, {'EntryType': 'patent'}, false);
	  	if (pub_search.length) { sorted_pubs.push({ name:'Patents', pubs: pub_search}) };
             
	  	pub_search = $filter('filter')(rawjson.entries, {'EntryType': 'thesis'}, false);
	  	if (pub_search.length) { sorted_pubs.push({ name:'Theses', pubs: pub_search}) };
             
	  	$scope.sorted_pubs = sorted_pubs

	  }, function(response) {
  		$scope.error = "No publications found";
  	});

	// Open the bibtex modal
	$scope.open = function (pub) {
		var modalInstance = $uibModal.open({
			templateUrl: 'html/bibmodal.html',
			controller: 'BibModalCtrl',
			size: 'lg',
			resolve: {
				text: function () {
					return setBib(pub);
				}
			}
		}).result.then(function(){}, function(res){});
	};

}])
