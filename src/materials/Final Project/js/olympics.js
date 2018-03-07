function createMap(elementId) {

    // svg height, width, and inside margins
    var height = 700;
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

    addTitle(g, "Summer Olympics", innerWidth, 24);

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

    function drawCountryChart(olympics, countryClicked) {
        var rolled = d3.nest()
            .key(function(d) {
                return d.NOC;
            })
            .key(function(d) {
                return d.Edition;
            })
            .key(function(d) {
                return d.Sport;
            })
            .rollup(function(d) {
                return {
                    medalCount: d.length
                }
            })
            .entries(olympics);

        console.log("by country, year, sport", rolled);

        newArray = [];
        // for each country
        rolled.forEach(function(d) {
            //newArray.push({country: d.key, values: []});
            // for each year
            d.values.forEach(function(e) {
                // for each sport
                e.values.forEach(function(f) {
                    newArray.push( {
                        country: d.key,
                        year: e.key,
                        sport: f.key,
                        medals: f.value.medalCount
                    });
                });
            }); 
        });

        console.log("by country, year, sport, clean", newArray);

        var countryHeight = 300;
        var countryWidth = 300;
        var countryTopShift = 300;
        var countryLeftShift = 800;
        var country = g
            .append('g')
            .attr('class', 'country-chart')
            .attr('transform', 'translate(' + countryLeftShift + ',' + countryTopShift + ')');

        // scales
        var x = d3
            .scaleBand()
            .domain(olympics.map(x => x.Edition))
            .range([0, countryWidth]);

        console.log('x scale: ', x.domain(), x.range());

        function compareSports(a, b) {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }
          return 0;
        }

        var y = d3
            .scaleBand()
            .domain(olympics.map(x => x.Sport).sort(compareSports))
            .range([countryHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        country
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + countryHeight + ')')
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(-10, -12)");

        var yAxis = d3.axisLeft(y);

        country
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        var singleCountry = newArray.filter(x => x.country == countryClicked);
        var maxCountryMedals = d3.max(singleCountry, function(d) {
            return d.medals;
        });

        var countryOpacityScale = d3
            .scaleLinear()
            .domain([0, maxCountryMedals])
            .range([0, 1]);

        console.log(countryOpacityScale.domain(), countryOpacityScale.range());

        // squares
        country
            .selectAll('.square')
            .data(singleCountry)
            .enter()
            .append('rect')
            .attr('class', 'square')
            .attr('id', function(d) {
                return d.sport + "," + d.year + ": " + d.medals + " medal(s)";
            })
            .attr('x', function(d) {
                //console.log(d.year);
                return x(d.year);
            })
            .attr('y', function(d) {
                //console.log(d.sport);
                return y(d.sport);
            })
            .attr('width', x.bandwidth)
            .attr('height', y.bandwidth)
            .attr('fill', 'purple')
            .attr('fill-opacity', function(d) {
                return countryOpacityScale(d.medals);
            })
            .attr('stroke', 'black');

        d3.select('.country-chart').on('mouseover', function() {
            showDataLabel(country, event);
        });

        d3.select('.country-chart').on('mouseout', function() {
            hideDataLabel(country);
        });

        addGradientLegend(country, countryWidth, maxCountryMedals, "purple");

        // add country dropdown

        // chart title
        // need axis labels?
        addTitle(country, 'Breakdown of Medals', countryWidth, 20);
    }

    function drawBarChart(olympics) {
        var rolled = d3.nest()
            .key(function(d) {
                return d.Athlete;
            })
            .rollup(function(d) {
                return {
                    medalCount: d.length,
                    gender: d[0].Gender
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
                return {
                    All: d.length,
                    Males: d.filter(x => x.value.gender == "Men").length,
                    Females: d.filter(x => x.value.gender == "Women").length
                };
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
                    return d.value.All;
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
                return y(d.value.All);
            })
            .attr('width', x.bandwidth)
            .attr('height', function(d) {
                return histHeight - y(d.value.All);
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
                return y(d.value.All) - 10;
            })
            .text(function(d) {
                return d.value.All;
            })
            .attr('text-anchor', 'middle')
            .attr('font-size', 10);

        // filter
        // options
        var formGroup = d3.select('body')
            .append('form')
            .attr('id', 'form')
            .style('position', 'relative')
            .style('top', '-35%')
            .style('left', '130%');

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

        // functionality
        d3.select('#form').on('click', function() {

            // change axes?

            //bars
            histogram
                .selectAll('.bar')
                .attr('y', function(d) {
                    return y(d.value[event.target.id]);
                })
                .attr('height', function(d) {
                    return histHeight - y(d.value[event.target.id]);
                });

            // data labels
            histogram
                .selectAll('.label')
                .attr('y', function(d) {
                    return y(d.value[event.target.id]) - 10;
                })
                .text(function(d) {
                    return d.value[event.target.id];
                });
        });

        // axis labels and chart title
        addAxisLabels(histogram, 'Number of Medals', 'Number of Athletes', histWidth, histHeight+25);
        addTitle(histogram, 'Distribution of Medals', histWidth, 20);
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


        addLineLegend(lines, colors);
        addTitle(lineChart, 'History of Olympics', lineWidth, 20);
        addAxisLabels(lineChart, 'Time', 'Number', lineWidth, lineHeight+40);
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
                    return d.properties.name + ": " + d.properties.medals + " medal(s)";
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

        addTitle(map, 'Medals by Country', mapWidth, 20);

        // data labels
        d3.select('.map-paths').on('mouseover', function() {
            showDataLabel(map, event);
        });

        d3.select('.map-paths').on('mouseout', function() {
            hideDataLabel(map);
        });

        // breakdown of medals
        d3.select('.map-paths').on('click', function() {
            console.log(event.target);
            d3.select('.histogram').remove();
            d3.selectAll('.country-chart').remove();
            d3.select('#form').remove();
            var country = geoJSON.features.filter(x => x.properties.name == event.target.id.split(":")[0])[0].id;
            console.log(country);
            // send back NOC code
            // handle case of no match
            drawCountryChart(olympics, country);
        });

        // legend
        addGradientLegend(map, mapWidth, d3.max(geoJSON.features, function(d) {
                return d.properties.medals;
        }), "red");
    }

    function showDataLabel(chart, event) {
        //console.log(event);

        var dataLabel = chart
                .append('text')
                .attr('id', 'data-label-text')
                .attr('x', event.clientX)
                .attr('y', event.clientY)
                .text(event.target.id);

        var dataLabelBox = dataLabel.node().getBBox();

        chart
            .append('rect')
            .attr('id', 'data-label-background')
            .attr('x', dataLabelBox.x)
            .attr('y', dataLabelBox.y)
            .attr('height', dataLabelBox.height + 2)
            .attr('width', dataLabelBox.width + 2)
            .attr('fill', 'white')
            .attr('fill-opacity', 0.5);
    }

    function hideDataLabel(chart) {
        chart
            .select('#data-label-text')
            .remove();

        chart
            .select('#data-label-background')
            .remove();
    }

    function addTitle(chart, text, chartWidth, fontSize) {
        chart
            .append('text')
            .attr('class', 'title')
            .attr('x', chartWidth/2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', fontSize)
            .text(text);
    }

    function addAxisLabels(chart, xLabel, yLabel, chartWidth, chartHeight) {
        chart
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', chartWidth/2)
            .attr('y', chartHeight)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text(xLabel);

        var x = -45;
        var y = chartHeight/2-20;

        chart
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', x)
            .attr('y', y)
            .attr('transform', 'rotate(-90,' + x + ',' + y + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text(yLabel);
    }

    function addLineLegend(lines, colors) {
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
    };

    function addGradientLegend(chart, chartWidth, maxValue, color) {
        // colors
        var defs = chart.append("defs");

        var linearGradient = defs.append("linearGradient")
            .attr("id", "gradient-" + color)
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
            .attr("stop-color", color)

        var legendHeight = 10;
        var legendWidth = 100;
        var legendX = (chartWidth-legendWidth)/2;
        var topShift = -10;

        chart.append("rect")
            .attr("x", legendX)
            .attr("y", topShift)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("fill", "url(#gradient-" + color + ")");

        // labels
        chart.append("text")
            .attr("id", "min")
            .attr("x", legendX)
            .attr("y", legendHeight + topShift)
            .attr("text-anchor", "end")
            .text(0);
        chart.append("text")
            .attr("id", "max")
            .attr("x", legendX+legendWidth)
            .attr("y", legendHeight + topShift)
            .attr("text-anchor", "start")
            .text(maxValue);
    }

};

createMap('#olympics-holder');
