    (function ($) {
    'use strict';


    $.fn.storymap = function(options) {

        var defaults = {
            selector: '[data-place]',
            breakpointPos: '33.333%',
            createMap: function () {

                // create a map in the "map" div, set the view to a given place and zoom
                var map = L.map('map', {
                    center: [49.194908, 16.609784],
                    zoom: 15
                });

                // Add some types of maps
                var baselayers = {
                    "B&W map (výchozí)": L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'),
                    "Color map": L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'),
                    "Historical map": L.tileLayer('http://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png'),
                    "3D map": L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png')
                };
                L.control.layers(baselayers).addTo(map);

                // Set default map style - tile
                L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png').addTo(map);

                // Set default map markers as one layer
                var churchesGroup = L.layerGroup();
                var jakub = L.marker([49.196572, 16.608261]).on('click', L.bind(getFocus, null, "jakub")).addTo(churchesGroup);
                var jan = L.marker([49.194299, 16.611152]).on('click', L.bind(getFocus, null, "jan")).addTo(churchesGroup);
                var janAmos = L.marker([49.197679, 16.603257]).on('click', L.bind(getFocus, null, "janAmos")).addTo(churchesGroup);
                var tomas = L.marker([49.197942, 16.607776]).on('click', L.bind(getFocus, null, "tomas")).addTo(churchesGroup);
                churchesGroup.addTo(map);

                return map;
            }
        };

        var settings = $.extend(defaults, options);

        function getDistanceToTop(elem, top) {
            var docViewTop = $(window).scrollTop();
            var elemTop = $(elem).offset().top;
            var dist = elemTop - docViewTop;
            var d1 = top - dist;
            if (d1 < 0) {
                return $(document).height();
            }
            return d1;
        }

        function highlightTopPara(paragraphs, top) {
            var distances = _.map(paragraphs, function (element) {
                var dist = getDistanceToTop(element, top);
                return {el: $(element), distance: dist};
            });

            var closest = _.min(distances, function (dist) {
                return dist.distance;
            });

            _.each(paragraphs, function (element) {
                var paragraph = $(element);
                if (paragraph[0] !== closest.el[0]) {
                    paragraph.trigger('notviewing');
                }
            });

            if (!closest.el.hasClass('viewing')) {
                closest.el.trigger('viewing');
            }
        }

        function watchHighlight(element, searchfor, top) {
            var paragraphs = element.find(searchfor);
            highlightTopPara(paragraphs, top);
            $(window).scroll(function () {
                highlightTopPara(paragraphs, top);
            });
        }

        var makeStoryMap = function (element, markers) {

            var topElem = $('<div class="breakpoint-current"></div>')
                .css('top', settings.breakpointPos);
            $('body').append(topElem);

            var top = topElem.offset().top - $(window).scrollTop();
            var searchfor = settings.selector;
            var paragraphs = element.find(searchfor);

            paragraphs.on('viewing', function () {
                $(this).addClass('viewing');
            });

            paragraphs.on('notviewing', function () {
                $(this).removeClass('viewing');
            });

            watchHighlight(element, searchfor, top);
            var map = settings.createMap();

            var fg = L.featureGroup().addTo(map);

            var initPoint = map.getCenter();
            var initZoom = map.getZoom();

            function showMapView(key) {
                fg.clearLayers();

                if (key === 'overview') {
                    map.setView(initPoint, initZoom, true);

                    /* Popup binding*/
                    /*
                    jakub.on('click', function (e) {
                        this.openPopup();
                    });

                    jan.on('click', function (e) {
                        this.openPopup();
                    });

                    janAmos.on('click', function (e) {
                        this.openPopup();
                    });

                    tomas.on('click', function (e) {
                        this.openPopup();
                    });
                    */
                }
                else if (markers[key]) {
                    var marker = markers[key];
                    var layer = marker.layer;
                    if(typeof layer !== 'undefined'){
                      fg.addLayer(layer);
                    };
                    fg.addLayer(L.marker([marker.lat, marker.lon], {icon: redIcon}).on('click', L.bind(getFocus, null, key)));

                    map.setView([marker.lat, marker.lon], marker.zoom, 1);

                    /* Custom map for each slide*/
                    /*
                    if (key === 'jakub') {
                      L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png').addTo(map);
                    }
                    else if (key === 'jan') {
                      L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png').addTo(map);
                    }
                    else if (key === 'janAmos') {
                      L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png').addTo(map);
                    }
                    else if (key === 'tomas') {
                      L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png').addTo(map);
                    }
                    */
                }
            }
            paragraphs.on('viewing', function () {
                showMapView($(this).data('place'));
            });
        };

        // Focus on each slide after click event
        function getFocus(key) {
          document.getElementById(key).scrollIntoView({
            block: "start",
            behavior: "smooth"
          });
        }

        makeStoryMap(this, settings.markers);

        return this;
    }

}(jQuery));
