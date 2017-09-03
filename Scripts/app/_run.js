$(function () {
    app.initialize();

    // Activate Knockout
    ko.validation.init({ grouping: { observable: false } });
    ko.applyBindings(app);

});



// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;


var video = $(location).attr('href').split('v=')[1];
var videoQueueIds = [];
var recentlyPlayed = [];
recentlyPlayed.push(video);
//var i = videoQueueIds.shift();
//videoQueueIds.push('HHP5MKgK0o8');
//videoQueueIds.push('Z8eXaXoUJRQ');
// alert(videoQueueIds[0]);              // displays 2

// 
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: $(location).attr('href').split('v=')[1],
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {

        var nextVideo = videoQueueIds.shift();

        if (nextVideo === undefined) {
            console.log('in the if loop for undefined');
            for (var i = 0; i < 10; i++) {
                if (!recentlyPlayed.includes(window.items[i].id.videoId)) {
                    var firstVideo = window.items[i].id.videoId;
                    break;
                }
            }        
            // console.log(window.items[0].snippet.title);
           
            loadVideo(firstVideo);
            history.pushState(null, null, '/?v=' + firstVideo);
            youtubeApiCall();
        }
        else {
            loadVideo(nextVideo);
            history.pushState(null, null, '/?v=' + nextVideo);
            youtubeApiCall();
        }
        
    }
}
function stopVideo() {
    player.stopVideo();
}

function loadVideo(id) {
    player.loadVideoById(id);
    if (recentlyPlayed.length === 5) {
        recentlyPlayed.shift();
        recentlyPlayed.push(id);
    }
    else {
        recentlyPlayed.push(id);
    }
    
    console.log(recentlyPlayed);
};

    youtubeApiCall();
    $("#pageTokenNext").on("click", function (event) {
        $("#pageToken").val($("#pageTokenNext").val());
        youtubeApiCall();
    });
    $("#pageTokenPrev").on("click", function (event) {
        $("#pageToken").val($("#pageTokenPrev").val());
        youtubeApiCall();
    });

    function youtubeApiCall() { 
        var video = $(location).attr('href').split('v=')[1];
        $.ajax({
            cache: false,
            data: $.extend({
                key: 'AIzaSyCaHl9uBxSWNN8FxugxeW1DefHNxXj4GlQ',
                relatedToVideoId: video,
                part: 'snippet',
                type: 'video'
            }, { maxResults: 30, pageToken: $("#pageToken").val() }),
            dataType: 'json',
            type: 'GET',
            timeout: 5000,
            url: 'https://www.googleapis.com/youtube/v3/search'
        })
            .done(function (data) {
                if (typeof data.prevPageToken === "undefined") { $("#pageTokenPrev").hide(); } else { $("#pageTokenPrev").show(); }
                if (typeof data.nextPageToken === "undefined") { $("#pageTokenNext").hide(); } else { $("#pageTokenNext").show(); }
                window.items = data.items, videoList = "";
                
                $("#pageTokenNext").val(data.nextPageToken);
                $("#pageTokenPrev").val(data.prevPageToken);
                var counter = 0;
                $.each(window.items, function (index, e) {
                    counter++;
                    // console.log(e);
                    if (counter <= 20) {
                        //console.log(e.id.videoId);
                        //console.log();
                        if (!recentlyPlayed.includes(e.id.videoId)) {
                            videoList = videoList +
                                '<li class="hyv-video-list-item"><div class="hyv-content-wrapper"><a href="?v=' + e.id.videoId + '" class="hyv-content-link" title="' + e.snippet.title + '"><span class="title">' + e.snippet.title + '</span><span class="stat attribution">by <span>' + e.snippet.channelTitle + '</span></span></a></div><div class="hyv-thumb-wrapper"><a href="?v=' + e.id.videoId + '" class="hyv-thumb-link"><span class="hyv-simple-thumb-wrap"><img alt="' + e.snippet.title + '" src="' + e.snippet.thumbnails.default.url + '" width="120" height="90"></span></a></div><button id="addList" onclick="updateQueue(this)" class="add-to-list" data-video-id=' + e.id.videoId + '>List+</button></li>';
                        }
                        
                    }                         
                });
                $("#hyv-watch-related").html(videoList);
                // JSON Responce to display for user
                //new PrettyJSON.view.Node({
                //    el: $(".hyv-watch-sidebar-body"),
                //    data: data
                //});
            });
    }

    function updateQueue(e) {
        var videoId = e.getAttribute('data-video-id');    
        videoQueueIds.push(videoId);
        console.log(videoQueueIds);
    };

    $('body').on('click', function (e) {
        //window.onhashchange = function () {;
        //    location.reload();
        //}      
    });
    
