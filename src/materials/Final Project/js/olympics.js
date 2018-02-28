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
    d3.csv('data/olympics.csv', function(error, olympics) {
        handleError(error, 'failed to read olympics.csv');
        console.log('raw olympics.csv data: ', olympics);

        drawLineChart(olympics);
        drawMap(olympics);
        drawBarChart(olympics);

    });

    function handleError(error, msg) {
        if (error) {
            console.error(msg);
        }
    }

    function drawBarChart(olympics) {
        var rolled = d3.nest()
            .key(function(d) {
                return d.Athlete;
            })
            .rollup(function(d) {
                return {
                    medalCount: d.length
                }
            })
            .entries(olympics);

        console.log("by athlete", rolled);

        var medalRange = d3.extent(rolled, function(d) {
            return d.value.medalCount;
        });

        console.log(medalRange);


        var rolled2 = d3.nest()
            .key(function(d) {
                return d.value.medalCount;
            })
            .rollup(function(d, i) {
                return d.length;
            })
            .entries(rolled);

        rolled2.forEach(function(d) {
            d.key = +d.key;
        });
        rolled2 = rolled2.sort(compare);
        console.log(rolled2);

        function compare(a, b) {
          if (a.key < b.key) {
            return -1;
          }
          if (a.key > b.key) {
            return 1;
          }
          return 0;
        }

        // scales
        var x = d3
            .scaleBand()
            .domain(rolled2.map(x => x.key))
            .range([0, innerWidth]);

        console.log('x scale: ', x.domain(), x.range(), x(2));

        var y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(rolled2, function(d) {
                    return d.value;
                })
            ])
            .range([innerHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis);

        var yAxis = d3.axisLeft(y);

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);
        
        // bars
        g
            .selectAll('.bar')
            .data(rolled2)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) {
                return x(d.key);
            })
            .attr('y', function(d) {
                return y(d.value);
            })
            .attr('width', x.bandwidth)
            .attr('height', function(d) {
                return innerHeight - y(d.value);
            })
            .attr('fill', 'purple');

        // data labels
        g
            .selectAll('.label')
            .data(rolled2)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', function(d) {
                return x(d.key) + x(2)/2;
            })
            .attr('y', function(d) {
                return y(d.value) - 10;
            })
            .text(function(d) {
                return d.value;
            })
            .attr('text-anchor', 'middle');

        // axis labels
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Number of Medals');

        var xCoord = -40;

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', xCoord)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,' + xCoord + ',' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Number of Athletes');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Distribution of Medals');
    }

    function drawLineChart(olympics) {
        yearlyData = groupDataByYear(olympics);
    }

    function groupDataByYear(olympics) {
        yearMedalRolled = d3.nest()
            .key(function(d) {
                return d.Edition;
            })
            .rollup(function(d) {
                return {
                    medalCount: d.length,
                }
            })
            .entries(olympics);

        console.log("medals by year", yearMedalRolled);

        yearAthleteRolled = d3.nest()
            .key(function(d) {
                return d.Edition;
            })
            .key(function(d) {
                return d.Athlete;
            })
            .entries(olympics);

        console.log("athletes by year", yearAthleteRolled);

        yearSportRolled = d3.nest()
            .key(function(d) {
                return d.Edition;
            })
            .key(function(d) {
                return d.Sport;
            })
            .entries(olympics);

        console.log("sports by year", yearSportRolled);

        yearEventRolled = d3.nest()
            .key(function(d) {
                return d.Edition;
            })
            .key(function(d) {
                return d.Event;
            })
            .entries(olympics);

        console.log("events by year", yearEventRolled);

        yearMedalRolled.forEach(function(d, i) {
            d.value.athleteCount = yearAthleteRolled[i].values.length;
            d.value.sportCount = yearSportRolled[i].values.length;
            d.value.eventCount = yearEventRolled[i].values.length;
        });

        console.log("all yearly data", yearMedalRolled);

        return yearMedalRolled;
    }

    function drawMap(olympics) {
        countryRolled = d3.nest()
            .key(function(d) {
                return d.NOC;
            })
            .rollup(function(d) {
                return {
                    medalCount: d.length
                }
            })
            .entries(olympics);

        console.log("by country", countryRolled);
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


        // interactions and transitions
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
            .attr('id', function(d) {
                return "class" + d;
            })
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

        var submittedMin;
        var submittedMax;

        function filterByElevation(initialData) {
            var finalData = initialData;
            if(submittedMin) {
                finalData = finalData.filter(x => x.elevation >= submittedMin);
            }
            if(submittedMax) {
                finalData = finalData.filter(x => x.elevation <= submittedMax);
            }
            return finalData;
        }

        d3.select('#checkboxForm').on('change', function() {

            var target = event.target;
            var elevationFilteredData = filterByElevation(stationsData);
            var radiusChangeDuration = 1500;
            var circleSelection = stationGroup
                    .selectAll('circle');
            
            if(target.checked) {
                var dataToAdd = elevationFilteredData.filter(x => x.class == target.value);
                var selection = circleSelection
                    .data(dataToAdd, function(d) {
                        return d.index;
                    })
                    .enter()
                    .append('circle');

                formatCircles(selection, true, false);

                selection
                    .transition()
                    .duration(radiusChangeDuration)
                    .attr('r', function(d) {
                        return radius(d.elevation);
                    });
                
            } else {
                var dataToKeep = elevationFilteredData.filter(x => x.class != target.value);
                circleSelection
                    .data(dataToKeep, function(d) {
                        return d.index;
                    })
                    .exit()
                    .transition()
                    .duration(radiusChangeDuration)
                    .attr('r', 0)
                    .remove();
            }
        });

        d3.select('#submitButton').on('click', function() {

            var applyFilter = true;
            [min, max].forEach(function(d) {
                input = parseFloat(d.value);
                if(isNaN(input) && d.value != "") {
                    alert("Please enter a number.");
                    applyFilter = false;
                }
            });

            if(applyFilter) {
                submittedMin = min.value;
                submittedMax = max.value;
                function timeFunction(d) {
                    return (innerHeight-d.coords[1])*10;
                }

                var checkedClasses = [class1, class2, class3].filter(x => x.checked).map(x => x.value);
                var keepData = filterByElevation(stationsData.filter(x => checkedClasses.indexOf(x.class) >= 0));

                var circleSelection = stationGroup
                    .selectAll('circle');
                var numCircles = circleSelection._groups[0].length;

                if(keepData.length > numCircles) {
                    var selection = circleSelection
                        .data(keepData, function(d) {
                            return d.index;
                        })
                        .enter()
                        .append('circle');    

                    formatCircles(selection, false, true);

                    selection
                        .transition()
                        .duration(timeFunction)
                        .delay(timeFunction)
                        .attr('cy', function(d) {
                            return d.coords[1];
                        });
                    
                } else if (keepData.length < numCircles) {
                    circleSelection
                        .data(keepData, function(d) {
                            return d.index;
                        })
                        .exit()
                        .transition()
                        .duration(timeFunction)
                        .delay(timeFunction)
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

createMap('#olympics-holder');
