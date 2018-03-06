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

    // create groups for each chart
    var histHeight = 200;
    var histWidth = 300;
    var histLeftShift = 800;
    var histTopShift = 300;
    var histogram = g
        .append('g')
        .attr('class', 'histogram')
        .attr('transform', 'translate(' + histLeftShift + ',' + histTopShift + ')');

    var lineHeight = 200;
    var lineWidth = 300;
    var lineLeftShift = 800;
    var lineTopShift = 0;
    var lineChart = g
        .append('g')
        .attr('class', 'line-chart')
        .attr('transform', 'translate(' + lineLeftShift + ',' + lineTopShift + ')');

    var mapHeight = 600;
    var mapWidth = 600;
    var map = g
        .append('g')
        .attr('class', 'map');


    addTitle("Summer Olympics", innerWidth/2, 0, 24);

    // read in data
    d3.csv('data/olympics.csv', function(error, olympics) {
        handleError(error, 'failed to read olympics.csv');
        console.log('raw olympics.csv data: ', olympics);

        d3.json('data/countries.json', function(error, geoJSON) {
            handleError(error, 'failed to read countries.json');
            console.log('raw countries.json data: ', geoJSON);

            d3.csv('data/country_codes.csv', function(error, countryCodes) {
                handleError(error, 'failed to read country_codes.csv');
                console.log('raw country_codes.csv data: ', countryCodes);

                // var rolled = d3.nest()
                //     .key(function(d) {
                //         return d.Athlete;
                //     })
                //     .key(function(d) {
                //         return d.Sport;
                //     })
                //     .rollup(function(d) {
                //         return {
                //             medalCount: d.length
                //         }
                //     })
                //     .entries(olympics);

                // var rolled2.forEach(function(d) {
                //      d.value.
                // })

                //console.log("by athlete by sport", rolled);

                drawLineChart(olympics);
                drawMap(olympics, geoJSON, countryCodes);
                drawBarChart(olympics);  
        });
        });
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
            .range([0, histWidth]);

        console.log('x scale: ', x.domain(), x.range(), x(2));

        var y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(rolled2, function(d) {
                    return d.value;
                })
            ])
            .range([histHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        histogram
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + histHeight + ')')
            .call(xAxis);

        var yAxis = d3.axisLeft(y);

        histogram
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);
        
        // bars
        histogram
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
                return histHeight - y(d.value);
            })
            .attr('fill', 'purple');

        // data labels
        histogram
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

        // filter
        // options
        var formGroup = d3.select('body')
            .append('form')
            .attr('id', 'form')
            .style('position', 'relative')
            .style('top', '-35%')
            .style('left', '160%');

        var options = ["All", "Females", "Males"];

        formGroup
            .selectAll('.radio')
            .data(options)
            .enter()
            .append('div')
            .attr('class', 'radio')
            .append('input')
            .attr('type', 'radio')
            .attr('name', 'group')
            .attr('value', function(d) {
                return d;
            })
            .attr('id', function(d) {
                return d;
            });

        d3.select("#All")
            .attr('checked', true);

        formGroup
            .selectAll('.radio')
            .append('label')
            .text(function(d) {
                return d;
            });

        // axis labels and chart title
        addAxisLabels('Number of Medals', histWidth/2 + histLeftShift, histHeight + histTopShift, 'Number of Athletes', histLeftShift-50, histHeight/2 + histTopShift);
        addTitle('Distribution of Medals', histWidth/2 + histLeftShift, histTopShift, 20);
    }

    function drawLineChart(olympics) {
        yearlyData = groupDataByYear(olympics);

        var parseTime = d3.timeParse('%Y');
        yearlyData.forEach(function(d) {
            d.key = parseTime(d.key);
            if(isNaN(d.key)) {
                console.log(d);
            }
        });

        // scales
        var x = d3
            .scaleTime()
            .domain(
                d3.extent(yearlyData, function(d) {
                    return d.key;
                })
            )
            .range([0, lineWidth]);

        console.log('x scale: ', x.domain(), x.range());

        var y = d3
            .scaleLinear()
            .domain(
                [0,
                d3.max(yearlyData, function(d) {
                    return d.value.medalCount;
                })]
            )
            .range([lineHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(4));

        lineChart
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + lineHeight + ')')
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(-10, -12)" );

        var yAxis = d3.axisLeft(y);

        lineChart
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // line generator 
        var line;
        function generateLine(countType) {
            return d3
                .line()
                .x(function(d) {
                    return x(d.key);
                })
                .y(function(d) {
                    return y(d.value[countType]);
                })
                .defined(function(d) {
                    return !isNaN(d.value[countType]);
                });
        }

        // lines
        var lines = ['medalCount', 'athleteCount', 'sportCount', 'eventCount'];
        
        var colors = d3.scaleOrdinal().domain(lines).range(d3.schemeCategory20);
        console.log(colors.domain(), colors.range());


        var groups = lineChart
            .selectAll('.line-holder')
            .data(lines)
            .enter()
            .append('g')
            .attr('class', 'line-holder')
            .append('path')
            .datum(yearlyData)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', function(d, i) {
                return colors(i);
            })
            .attr('stroke-width', 2)
            .attr('d', function(d) {
                var lineType = d3.select(this.parentNode).datum();
                return generateLine(lineType)(d);
            });


        addLegend(lines, colors);
        addTitle('History of Olympics', lineWidth/2 + lineLeftShift, lineTopShift, 20);
        addAxisLabels('Time', lineWidth/2 + lineLeftShift, lineHeight + 10, 'Number', lineLeftShift-40, lineHeight/2 + lineTopShift);
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

    function drawMap(olympics, geoJSON, countryCodes) {
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

        countryRolled.forEach(function(d) {
            var match = countryCodes.filter(x => x.IOC == d.key);
            var ISO;
            if(match[0]) {
                ISO = match[0].ISO;
            } else {
                ISO = null;
            }
            d.value.ISO = ISO;
        });

        console.log("by country with ISO codes", countryRolled);

        var missingGeoData = [];
        countryRolled.forEach(function(d) {
            var match = geoJSON.features.filter(x => x.id == d.value.ISO);
            if(!match[0]) {
                missingGeoData.push(d.key)
            } else {
                ISO = null;
            }
        });

        console.log("countries missing geoData", missingGeoData.length, missingGeoData);

        var missingMedalData = [];
        geoJSON.features.forEach(function(f) {
            var medals = countryRolled.filter(x => x.value.ISO == f.id);
            if (medals.length > 0) {
                f.properties.medals = medals[0].value.medalCount;
            } else {
                missingMedalData.push(f.id);
            }
        });

        console.log("countries missing medal data", missingMedalData.length, missingMedalData);

        console.log("merged geoJSON", geoJSON);

        var opacityScale = d3
            .scaleLinear()
            .domain([0, d3.max(countryRolled, function(d) {
                return d.value.medalCount;
            })])
            .range([0, 1]);

        console.log(opacityScale.domain(), opacityScale.range());

        // projection
        var mercatorProj = d3
            .geoMercator()
            .scale(100)
            .translate([mapWidth / 2, mapHeight / 2]);
        var geoPath = d3.geoPath().projection(mercatorProj);

        // map path
        var mapGroup = map
            .append('g')
            .attr('class', 'map-paths');
        mapGroup
            .selectAll('path')
            .data(geoJSON.features)
            .enter()
            .append('path')
            .attr('id', function(d) {
                if(d.properties.medals != undefined) {
                    return d.properties.name + ": " + d.properties.medals + " medals";
                } else {
                    return d.properties.name + ": no data available";
                }
            })
            .attr('d', geoPath)
            .style('fill', function(d) {
                if (d.properties.medals) {
                    return 'red';
                } else {
                    return 'grey';
                }
            })
            .style('stroke', 'black')
            .style('stroke-width', 0.5)
            .attr('fill-opacity', function(d) {
                if (d.properties.medals) {
                    return opacityScale(d.properties.medals);
                } else {
                    return 1;
                }
            });

        addTitle('Medals by Country', mapWidth/2, 0, 20);

        d3.select('.map-paths').on('mouseover', function() {
            console.log(event);
            
            var dataLabel = map
                .append('text')
                .attr('id', 'data-label-text')
                .attr('x', event.clientX)
                .attr('y', event.clientY)
                .text(event.target.id);

            var dataLabelBox = dataLabel.node().getBBox();

            map
                .append('rect')
                .attr('id', 'data-label-background')
                .attr('x', dataLabelBox.x)
                .attr('y', dataLabelBox.y)
                .attr('height', dataLabelBox.height + 2)
                .attr('width', dataLabelBox.width + 2)
                .attr('fill', 'white')
                .attr('fill-opacity', 0.5);
        });

        d3.select('.map-paths').on('mouseout', function() {
            map
                .select('#data-label-text')
                .remove();

            map
                .select('#data-label-background')
                .remove();
        });


        // legend
        // colors
        var defs = map.append("defs");

        var linearGradient = defs.append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
        linearGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white");
        linearGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "red")

        var legendHeight = 10;
        var legendWidth = 100;

        map.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("fill", "url(#gradient)");

        // labels
        map.append("text")
            .attr("id", "min")
            .attr("y", legendHeight)
            .attr("text-anchor", "end")
            .text(0);
        map.append("text")
            .attr("id", "max")
            .attr("x", legendWidth)
            .attr("y", legendHeight)
            .attr("text-anchor", "start")
            .text(d3.max(geoJSON.features, function(d) {
                return d.properties.medals;
            }));
    }

    function addTitle(text, x, y, fontSize) {
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', x)
            .attr('y', y-20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', fontSize)
            .text(text);
    }

    function addAxisLabels(xLabel, xLabelX, xLabelY, yLabel, yLabelX, yLabelY) {
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', xLabelX)
            .attr('y', xLabelY + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text(xLabel);

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', yLabelX)
            .attr('y', yLabelY)
            .attr('transform', 'rotate(-90,' + yLabelX + ',' + yLabelY + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text(yLabel);
    }

    function addLegend(lines, colors) {
        lineChart
            .append('rect')
            .attr('class', 'legend')
            .attr('x', 40)
            .attr('y', 10)
            .attr('height', 50)
            .attr('width', 100)
            .style('fill', 'none')
            .style('stroke', 'black');

        lineChart
            .selectAll('.legend-color')
            .data(lines)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', 50)
            .attr('y', function(d) {
                return lines.indexOf(d) * 10 + 15;
            })
            .attr('height', 10)
            .attr('width', 10)
            .style('fill', function(d, i) {
                return colors(i);
            });

        lineChart
            .selectAll('.legend-text')
            .data(lines)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', 75)
            .attr('y', function(d) {
                return lines.indexOf(d) * 10 + 17;
            })
            .attr('dominant-baseline', 'hanging')
            .text(function(d) {
                return d;
            })
            .style('font-size', 10);
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
