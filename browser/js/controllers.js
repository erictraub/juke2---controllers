var juke = angular.module('JukeModule', []);



juke.controller('MainCtrl', function($scope, $http, $log, $rootScope) {

	$scope.playing = false;

	var audio = document.createElement('audio');

	audio.addEventListener('ended', function() {
		$scope.nextSong();
		$scope.$digest();
	});

	audio.addEventListener('timeupdate', function () {
		$scope.progress = 100 * audio.currentTime / audio.duration;
		$scope.$evalAsync();
	});


	var playSong = function(song) {

		$scope.currentSong = song;

		audio.src = song.audioUrl;
		audio.load();
		audio.play();
	};


	function getData(res) { return res.data; };


	$http.get('/api/albums')
	.then(getData)
	.then(function(albums) {
		return $http.get('/api/albums/' + albums[0]._id)
	})
	.then(getData)
	.then(function(album) {
		album.imageUrl = '/api/albums/' + album._id + '.image';
		album.songs.forEach(function(song, i) {
			song.audioUrl = '/api/songs/' + song._id + '.audio';
			song.index = i;
		});
		$scope.album = album;
	})
	.catch($log.error);



	$scope.toggleSong = function(song) {
		if(!$scope.playing && !$scope.currentSong) {
			playSong(song);
			$scope.playing = true;
		} else if($scope.playing && $scope.currentSong === song) {
			audio.pause();
			$scope.playing = false;
		} else if ($scope.playing && $scope.currentSong !== song) {
			playSong(song);
			$scope.playing = true;
		} else if ($scope.currentSong === song && !$scope.playing) {
			audio.play();
			$scope.playing = true;
		} else if (!$scope.playing && $scope.currentSong !== song) {
			playSong(song);
			$scope.playing = true;
		}
	};



	$scope.footerToggle = function() {
		if ($scope.playing) {
			audio.pause();
			$scope.playing = false;
		} else {
			audio.play();
			$scope.playing = true;
		}
	};


	$scope.nextSong = function() {
		if ($scope.currentSong.index !== $scope.album.songs.length - 1) {
			playSong($scope.album.songs[$scope.currentSong.index + 1]);
		} else {
			playSong($scope.album.songs[0]);
		}
		$scope.playing = true;
	};

	$scope.prevSong = function() {
		if($scope.currentSong.index !== 0) {
			playSong($scope.album.songs[$scope.currentSong.index - 1]);
		} else {
			playSong($scope.album.songs[$scope.album.songs.length - 1]);
		}
		$scope.playing = true;
	};

	$scope.shouldShowPlay = function(song) {
		return song !== $scope.currentSong || song === $scope.currentSong && !$scope.playing;
	};

	$scope.shouldShowPause = function(song) {
		return song === $scope.currentSong && $scope.playing;
	};



});











