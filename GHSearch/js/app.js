/*
    # Endpoint URL #
    
    https://api.github.com/legacy/repos/search/{query}
    
    Note: Github imposes a rate limit of 60 request per minute. Documentation can be found at http://developer.github.com/v3/.
    
    # Example Response JSON #
    
    {
      "meta": {...},
      "data": {
        "repositories": [
          {
            "type": string,
            "watchers": number,
            "followers": number,
            "username": string,
            "owner": string,
            "created": string,
            "created_at": string,
            "pushed_at": string,
            "description": string,
            "forks": number,
            "pushed": string,
            "fork": boolean,
            "size": number,
            "name": string,
            "private": boolean,
            "language": number
          },
          {...},
          {...}
        ]
      }
    }
*/

/*
{
  "message": "API rate limit exceeded for 104.174.53.104. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
  "documentation_url": "https://developer.github.com/v3/#rate-limiting"
}
*/

var GHSearch = (function(window, document) {
  'use strict';

  var _$window    = $(window),
      _$body      = $(document.body);

  var _$baseUrl       = "https://api.github.com/legacy/repos/search/",
      _$repositories  = [],
      _$query         = "";

  /* Private functions */

  var redrawForm = function(isSmallForm) {
        (isSmallForm)? $('.search-form').addClass('search-form--pinned') : $('.search-form').removeClass('search-form--pinned');
      },

      renderPage = function(repositories) {
        if (_$repositories.length) {

          // Render the results template
          var _tmpl = $("#results-template").html();
          _tmpl = _.template(_tmpl, {"repositories": repositories});
          $('#results-container').html(_tmpl);

          // Listener for repo detail
          $('.repositories__item').on('click', function() {
            var index = $(this).attr('data-index');
            var _tmpl = $("#detail-template").html();
            _tmpl = _.template(_tmpl, {"repo": _$repositories[index]});
            $('#overlay-container').html(_tmpl);

            $('#overlay-container').addClass('overlay-container').removeClass('hide');
            $('body').addClass('noScroll');
          });

        } else {
          $('#results-container').html('Sorry no result');
        }
      },

      fetchData = function(query) {
        redrawForm(true);
        $('#results-container').html('<h2 class="text-center">Fetching data...</h2>');
        window.location.hash = escape(query);

        _$repositories = localStorage.getItem(query);

        if (_$repositories){
          _$repositories = $.parseJSON(_$repositories);
          renderPage(_$repositories);
        } else {
          $.ajax({
            type: "GET",
            cache: false,
            url: _$baseUrl + _$query,
            dataType: "json",
            success: function(response, textStatus, jqXHR) {
              _$repositories = response['repositories'];

              localStorage.setItem(query, JSON.stringify(_$repositories));

              renderPage(_$repositories);
            },
            error: function(response) {
              $('#results-container').html(response['responseJSON']['message']);
            }
          });
        }  
      }
          
  var self = {
    /* Public functions */

    'init': function() {

      _$query = (window.location.hash)? unescape(window.location.hash.substr(1)) : "";

      // Ghetto deep linking
      if (_$query !== "") {
        $('#search').val(_$query);
        fetchData(_$query);
      }

      // Listener to handle form submission
      $( "form" ).submit(function( event ) {
        _$query = $('#search').val();
        fetchData(_$query);

        event.preventDefault();
      });

      // Listener to close overlay
      $('#overlay-container').on('click', function(e) {
        if (e.target == this) {
          $('#overlay-container').removeClass('overlay-container').addClass('hide');
          $('body').removeClass('noScroll');
        }
      });
    }

  };
  
  return self;
            
})(this, this.document);

(function($){
  'use strict';

  $(function(){
    GHSearch.init();
  });

})(jQuery);
