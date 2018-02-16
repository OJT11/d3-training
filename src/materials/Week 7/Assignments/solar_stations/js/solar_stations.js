function createMap(elementId) {

    // svg height, width, and inside margins
    var height = 600;
    var width = 1325;
    var margins = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    // dimensions within svg
    var innerHeight = height - margins.top - margins.bottom;
    var innerWidth = width - margins.left - margins.right;

    // create svg
    var svg = d3
        .select(elementId)
        .append('svg')
        .attr('height', height)
        .attr('width', width);

    // create group within svg
    var g = svg
        .append('g')
        .attr('class', 'svg-group')
        .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');


    // read in data
    d3.json('data/us-states.json', function(error, geoJSONStates) {
        handleError(error, 'failed to read us-states.json');
        console.log('raw us-states.json data: ', geoJSONStates);

        d3.csv('data/NSRDB_StationsMeta.csv', function(error, stations) {
            handleError(error, 'failed to read NRDB_StationMeta.csv');
            console.log('raw NRDB_StationMeta.csv data: ', stations);

            draw(geoJSONStates, stations);
        });
    });

    function handleError(error, msg) {
        if (error) {
            console.error(msg);
        }
    }

    function draw(geoJSONStates, stations) {

        var albersProj = d3
            .geoAlbersUsa()
            .translate([innerWidth / 2, innerHeight / 2]);
        var geoPath = d3.geoPath().projection(albersProj);

        var stationsData = prepStations(stations, albersProj);
        var classes = getClasses(stationsData);
        var colors = d3.scaleOrdinal(d3.schemeCategory10);
        var radius = getRadiusScale(stationsData);
        

        // map path
        var mapGroup = g
            .append('g')
            .attr('class', 'map-paths');
        mapGroup
            .selectAll('path')
            .data(geoJSONStates.features)
            .enter()
            .append('path')
            .attr('d', geoPath)
            .style('fill', 'none')
            .style('stroke', 'black')
            .style('stroke-width', 0.5);

        // station points
        var stationGroup = g
            .append('g')
            .attr('class', 'station-points');
        stationGroup
            .selectAll('circle')
            .data(stationsData)
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                return d.coords[0];
            })
            .attr('cy', function(d) {
                return d.coords[1];
            })
            .attr('r', function(d) {
                return radius(d.elevation);
            })
            .attr('fill', function(d) {
                return colors(d.class);
            })
            .attr('opacity', 0.5)
            .attr('stroke', 'none');

        // legend
        var legendGroup = g
            .append('g')
            .attr('class', 'legend');

        var legendX = 800;
        var legendY = 50;

        // legend box
        legendGroup
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('height', 50)
            .attr('width', 50)
            .style('fill', 'none')
            .style('stroke', 'black')

        // legend title
        legendGroup
            .selectAll('.legend-title')
            .data(classes)
            .enter()
            .append('text')
            .attr('class', 'legend-title')
            .attr('x', legendX + 6)
            .attr('y', legendY + 10)
            .text("Classes")
            .style('font-size', 10);

        // legend color
        legendGroup
            .selectAll('.legend-color')
            .data(classes)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', legendX + 15)
            .attr('y', function(d) {
                return classes.indexOf(d) * 10 + legendY + 14;
            })
            .attr('height', 10)
            .attr('width', 10)
            .style('fill', function(d) {
                return colors(d);
            });

        // legend text
        legendGroup
            .selectAll('.legend-text')
            .data(classes)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', legendX + 30)
            .attr('y', function(d) {
                return classes.indexOf(d) * 10 + legendY + 16;
            })
            .attr('dominant-baseline', 'hanging')
            .text(function(d) {
                return d;
            })
            .style('font-size', 10);

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Map of U.S. Solar Stations');
    };

    function prepStations(stations, albersProj) {
        return stations.map(function(d) {
            return { class: d.CLASS, elevation: +d["ISH_ELEV (m)"], coords: albersProj([+d.longitude, +d.latitude]) };
        }).filter(function(e) {
            return e.coords != null;
        });
    }

    function getClasses(stationsData) {
        return Array.from(new Set(stationsData.map(function (d) {
            return d.class;
        }))).sort();
    }

    function getRadiusScale(stationsData) {
        return d3
            .scaleLog()
            .domain(
                [1, d3.max(stationsData, function(d) {
                    return d.elevation;
                })]
            )
            .range([1, 7]) // edited these to reduce the size of the points
            .clamp(true);
    }

};

createMap('#solar-stations-holder');
