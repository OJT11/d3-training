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

        var circles = stationGroup
            .selectAll('circle')
            .data(stationsData)
            .enter()
            .append('circle');

        function formatCircles(circles, zeroRadius, hiddenY) {
            circles
                .attr('cx', function(d) {
                    return d.coords[0];
                })
                .attr('cy', function(d) {
                    if(hiddenY) {
                        return -100;
                    } else {
                        return d.coords[1];
                    }
                })
                .attr('r', function(d) {
                    if(zeroRadius) {
                        return 0;
                    } else {
                        return radius(d.elevation);
                    }
                })
                .attr('fill', function(d) {
                    return colors(d.class);
                })
                .attr('opacity', 0.5)
                .attr('stroke', 'none');
        }

        formatCircles(circles, false, false);

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


        // form
        var formGroup = d3.select('body')
            .append('div')
            .style('position', 'relative')
            .style('top', '-90%');

        var checkboxes = formGroup
            .append('form')
            .attr('id', 'checkboxForm')

        checkboxes
            .selectAll('.checkbox')
            .data(classes)
            .enter()
            .append('div')
            .attr('class', 'checkbox')
            .append('label')
            .text(function(d) {
                return "Class " + d;
            })
            .append('input')
            .attr('type', 'checkbox')
            .attr('checked', true)
            .attr('value', function(d) {
                return d;
            });

        var textboxes = formGroup
            .append('form')
            .attr('id', 'textboxForm')

        var elevation = [{ label: "Minimum Elevation", id: "min"}, {label: "Maximum Elevation", id: "max"}];

        textboxes
            .selectAll('.textbox')
            .data(elevation)
            .enter()
            .append('div')
            .attr('class', 'textbox')
            .append('label')
            .text(function(d) {
                return d.label;
            })
            .append('input')
            .attr('type', 'text')
            .attr('id', function(d) {
                return d.id;
            });

        textboxes
            .append('button')
            .attr('type', 'button')
            .attr('form', 'textboxForm')
            .attr('id', 'submitButton')
            .text('Filter Stations');

        var duration = 1500;

        d3.select('#checkboxForm').on('change', function() {

            var target = event.target;
            var circleSelection = stationGroup
                    .selectAll('circle');

            if(target.checked) {
                var dataToAdd = stationsData.filter(x => x.class == target.value);
                var selection = circleSelection
                    .data(dataToAdd, function(d) {
                        return d.index;
                    })
                    .enter()
                    .append('circle');

                formatCircles(selection, true, false);

                selection
                    .transition()
                    .duration(duration)
                    .attr('r', function(d) {
                        return radius(d.elevation);
                    });
                
            } else {
                var dataToKeep = stationsData.filter(x => x.class != target.value);
                circleSelection
                    .data(dataToKeep, function(d) {
                        return d.index;
                    })
                    .exit()
                    .transition()
                    .duration(duration)
                    .attr('r', 0)
                    .remove();
            }
        });

        d3.select('#submitButton').on('click', function() {
            console.log(event.target);

            var applyFilter = true;
            [min, max].forEach(function(d) {
                input = parseFloat(d.value);
                if(isNaN(input) && d.value != "") {
                    alert("Please enter a number.");
                    applyFilter = false;
                }
            });

            if(applyFilter) {
                var keepData = stationsData;
                if(min.value) {
                    keepData = keepData.filter(x => x.elevation >= min.value);
                }
                if(max.value) {
                    keepData = keepData.filter(x => x.elevation <= max.value);
                }
                console.log(d3.extent(keepData, function(d) {
                    return d.elevation;
                }));
                console.log(d3.extent(stationsData, function(d) {
                    return d.coords[1];
                }));

                var circleSelection = stationGroup
                    .selectAll('circle');

                if(keepData.length > circleSelection._groups[0].length) {
                    var selection = circleSelection
                        .data(keepData, function(d) {
                            return d.index;
                        })
                        .enter()
                        .append('circle');    

                    formatCircles(selection, false, true);

                    selection
                        .transition()
                        .duration(function(d) {
                            return d.coords[1]*50;
                        })
                        .delay(function(d) {
                            return (innerHeight-d.coords[1])*50-10000;
                        })
                        .attr('cy', function(d) {
                            return d.coords[1];
                        });
                    
                } else {
                    circleSelection
                        .data(keepData, function(d) {
                            return d.index;
                        })
                        .exit()
                        .transition()
                        .duration(function(d) {
                            return (innerHeight-d.coords[1])*50;
                        })
                        .delay(function(d) {
                            return (innerHeight-d.coords[1])*50;
                        })
                        .attr('cy', innerHeight+100)
                        .remove();
                }
            }
        });
    };

    function prepStations(stations, albersProj) {
        return stations.map(function(d, i) {
            return { class: d.CLASS, elevation: +d["ISH_ELEV (m)"], coords: albersProj([+d.longitude, +d.latitude]), index: i };
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
