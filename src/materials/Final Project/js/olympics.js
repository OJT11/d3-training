function createMap(elementId) {

    // svg height, width, and inside margins
    var height = 900;
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

    // set dimensions for each chart
    var leftShift = 800;
    var rightWidth = 300;
    var topRightHeight = 150;
    var bottomRightHeight = 350;
    var bottomRightTopShift = 235;

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

                d3.select('body').on('click', function() {
                    //console.log(event.target);
                    if(event.target.id == "") {
                        removeHistogramCountryCharts();
                        removeLineAthleteCharts();
                        drawBarChart(olympics);
                        drawLineChart(olympics);
                    }
                });
            });
        });
    });

    function handleError(error, msg) {
        if (error) {
            console.error(msg);
        }
    }

    function compareSports(a, b) {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }
          return 0;
    }

    function drawAthleteChart(outlierAthleteData, athleteClicked) {
        singleAthleteName = athleteClicked.target.id.split("(")[0].trim();
        console.log(singleAthleteName);
        console.log("by athlete, year, event", outlierAthleteData);
        var outlierAthleteDataRolled = d3.nest()
            .key(function(d) {
                return d.Athlete;
            })
            .key(function(d) {
                return d.Edition;
            })
            .key(function(d) {
                return d.Event;
            })
            .rollup(function(d) {
                return {
                    medalCount: d.length
                }
            })
            .entries(outlierAthleteData);

        console.log("by athlete, year, event", outlierAthleteDataRolled);

        var athlete = g
            .append('g')
            .attr('class', 'athlete-chart')
            .attr('transform', 'translate(' + leftShift + ',0)');

        var singleAthlete = outlierAthleteData.filter(x => x.Athlete == singleAthleteName);

        // scales
        var x = d3
            .scaleBand()
            .domain(singleAthlete.map(x => x.Edition))
            .range([0, rightWidth]);

        console.log('x scale: ', x.domain(), x.range());

        var y = d3
            .scaleBand()
            .domain(singleAthlete.map(x => x.Event).sort(compareSports))
            .range([topRightHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        athlete
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + topRightHeight + ')')
            .call(xAxis);

        var yAxis = d3.axisLeft(y);

        athlete
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        var colors = { "Gold":"#DAA520", "Silver":"#C0C0C0", "Bronze":"#cd7f32" };
        var radius = Math.min(x.bandwidth(), y.bandwidth());

        // ellipses
        athlete
            .selectAll('.circle')
            .data(singleAthlete)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cx', function(d) {
                //console.log(d.year);
                return x(d.Edition) + x.bandwidth()/2;
            })
            .attr('cy', function(d) {
                //console.log(d.sport);
                return y(d.Event) + y.bandwidth()/2;
            })
            .attr('r', radius/4)
            .attr('fill', function(d) {
                return colors[d.Medal];
            });

        addTitle(athlete, 'Medal Breakdown: ' + singleAthleteName, rightWidth, 15);
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

        var country = g
            .append('g')
            .attr('class', 'country-chart')
            .attr('transform', 'translate(' + leftShift + ',' + bottomRightTopShift + ')');

        // scales
        var x = d3
            .scaleBand()
            .domain(olympics.map(x => x.Edition))
            .range([0, rightWidth]);

        console.log('x scale: ', x.domain(), x.range());       

        var y = d3
            .scaleBand()
            .domain(olympics.map(x => x.Sport).sort(compareSports))
            .range([bottomRightHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        country
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + bottomRightHeight + ')')
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(-10, -12)");

        var yAxis = d3.axisLeft(y);

        country
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        var singleCountry = newArray.filter(x => x.country == countryClicked.properties.IOC);
        var maxCountryMedals = d3.max(singleCountry, function(d) {
            return d.medals;
        });

        var countryOpacityScale = d3
            .scaleLinear()
            .domain([0, maxCountryMedals])
            .range([0, 1]);

        console.log(countryOpacityScale.domain(), countryOpacityScale.range());

        var squareColor = "purple";

        // squares
        country
            .selectAll('.square')
            .data(singleCountry)
            .enter()
            .append('rect')
            .attr('class', 'square')
            .attr('id', function(d) {
                var countryS = d.medals > 1 ? "s" : "";
                return d.sport + ", " + d.year + ": " + d.medals + " medal" + countryS;
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
            .attr('fill', squareColor)
            .attr('fill-opacity', function(d) {
                return countryOpacityScale(d.medals);
            })
            .attr('stroke', 'black')
            .on('mouseover', function() {
                showDataLabel(d3.event);
            })
            .on('mousemove', function() {
                moveDataLabel(d3.event);
            })
            .on('mouseout', function() {
                hideDataLabel();
            });        

        if(singleCountry.length > 0) {
            addGradientLegend(country, rightWidth, maxCountryMedals, squareColor);
        }  

        addTitle(country, 'Medal Breakdown: ' + countryClicked.properties.name, rightWidth, 15);
    }

    function drawBarChart(olympics) {
        var rolled = d3.nest()
            .key(function(d) {
                return d.Athlete;
            })
            .rollup(function(d) {
                var sports = getUnique(d, "Sport");
                var countries = getUnique(d, "NOC");

                return {
                    medalCount: d.length,
                    gender: d[0].Gender,
                    sports: sports,
                    countries: countries
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

        var outlierCounts = rolled2.filter(x => x.value.All == 1).map(x => x.key);
        var outliers = rolled.filter(x => outlierCounts.indexOf(x.value.medalCount) >= 0);
        allOutlierData = outliers.map(function(d) {
            return { name: d.key, medalCount: d.value.medalCount, gender: d.value.gender[0], countries: d.value.countries, sports: d.value.sports}
        });

        console.log('outliers', outlierCounts, allOutlierData);

        var outlierAthleteNames = allOutlierData.map(x => x.name);
        var outlierAthleteData = olympics.filter(x => outlierAthleteNames.indexOf(x.Athlete) >= 0)
        console.log('outlier data', outlierAthleteData);

        var histogram = g
            .append('g')
            .attr('class', 'histogram')
            .attr('transform', 'translate(' + leftShift + ',' + bottomRightTopShift + ')');

        // scales
        var x = d3
            .scaleBand()
            .domain(rolled2.map(x => x.key))
            .range([0, rightWidth]);

        console.log('x scale: ', x.domain(), x.range(), x(2));

        var y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(rolled2, function(d) {
                    return d.value.All;
                })
            ])
            .range([bottomRightHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        histogram
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + bottomRightHeight + ')')
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
                return bottomRightHeight - y(d.value.All);
            })
            .attr('fill', 'purple');

        // data labels
        histogram
            .selectAll('.label')
            .data(rolled2)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('id', function(d) {
                if(d.value.All == 1) {
                    return generateAthleteId(d);
                }
            })
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
            .style('position', 'absolute')
            .style('top', bottomRightTopShift + 50)
            .style('left', leftShift + 250);

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
        d3.select('.histogram').on('mouseover', function() {
            if(event.target.id != "") {
                showDataLabel(event);
            }
        });

        d3.select('.histogram').on('mouseout', function() {
            if(event.target.id != "") {
                hideDataLabel();
            }
        });

         d3.select('.histogram').on('click', function() {
            if(event.target.id != "") {
                removeLineAthleteCharts();
                drawAthleteChart(outlierAthleteData, event);
            }
        });

        d3.select('#form').on('click', function() {

            // change axes?
            var duration = 1000;

            //bars
            histogram
                .selectAll('.bar')
                .transition()
                .duration(duration)
                .attr('y', function(d) {
                    return y(d.value[event.target.id]);
                })
                .attr('height', function(d) {
                    return bottomRightHeight - y(d.value[event.target.id]);
                });

            // data labels
            histogram
                .selectAll('.label')
                .transition()
                .duration(1000)
                .attr('id', function(d) {
                    if(d.value[event.target.id] == 1) {
                        return generateAthleteId(d);
                    }
                })
                .attr('y', function(d) {
                    return y(d.value[event.target.id]) - 10;
                })
                .text(function(d) {
                    return d.value[event.target.id];
                });
        });

        // axis labels and chart title
        addAxisLabels(histogram, 'Number of Medals', 'Number of Athletes', rightWidth, bottomRightHeight+25);
        addTitle(histogram, 'Distribution of Medals', rightWidth, 15);
    }

    function getUnique(d, property) {
        return Array.from(new Set(d.map(x => x[property]))).join(", ");
    }

    function generateAthleteId(d) {
        var currAthlete = allOutlierData.filter(x => x.medalCount == d.key)[0];
        return currAthlete.name + " (" + currAthlete.gender + ") from " + currAthlete.countries + ": " + currAthlete.sports;
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

        var lineChart = g
            .append('g')
            .attr('class', 'line-chart')
            .attr('transform', 'translate(' + leftShift + ',0)');

        // scales
        var x = d3
            .scaleTime()
            .domain(
                d3.extent(yearlyData, function(d) {
                    return d.key;
                })
            )
            .range([0, rightWidth]);

        console.log('x scale: ', x.domain(), x.range());

        var y = d3
            .scaleLinear()
            .domain(
                [0,
                d3.max(yearlyData, function(d) {
                    return d.value.medalCount;
                })]
            )
            .range([topRightHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(4));

        lineChart
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + topRightHeight + ')')
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(-10, -12)" );

        var yAxis = d3.axisLeft(y).ticks(4);

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
        var lines = [
            {value: 'medalCount', color: 'red', text: 'Medals'},
            {value: 'sportCount', color: 'purple', text: 'Sports'},
            {value: 'eventCount', color: 'green', text: 'Events'}
        ];

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
            .attr('stroke', function(d) {
                return getLineType(this.parentNode).color;
            })
            .attr('stroke-width', 2)
            .attr('d', function(d) {
                return generateLine(getLineType(this.parentNode).value)(d);
            });


        addLineLegend(lineChart, lines);
        addTitle(lineChart, 'History of the Olympics', rightWidth, 15);
        addAxisLabels(lineChart, null, 'Number', rightWidth, topRightHeight+40);
    }

    function getLineType(parentNode) {
        return d3.select(parentNode).datum();
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
                f.properties.IOC = medals[0].key;
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
        var mapColor = "red";

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
                    var mapS = d.properties.medals > 1 ? "s" : "";
                    return d.properties.name + ": " + d.properties.medals + " medal" + mapS;
                } else {
                    return d.properties.name + ": no data available";
                }
            })
            .attr('d', geoPath)
            .style('fill', function(d) {
                if (d.properties.medals) {
                    return mapColor;
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
            })
            .on('mouseover', function() {
                showDataLabel(d3.event);
            })
            .on('mousemove', function() {
                moveDataLabel(d3.event);
            })
            .on('mouseout', function() {
                hideDataLabel();
            });

        addTitle(map, 'Medals by Country', mapWidth, 20);

        // breakdown of medals
        d3.select('.map-paths').on('click', function() {
            console.log(event.target);
            removeHistogramCountryCharts();
            var countryClicked = geoJSON.features.filter(x => x.properties.name == event.target.id.split(":")[0])[0];
            drawCountryChart(olympics, countryClicked);
        });

        // legend
        addGradientLegend(map, mapWidth, d3.max(geoJSON.features, function(d) {
                return d.properties.medals;
        }), mapColor);
    }

    function removeHistogramCountryCharts() {
        d3.select('.country-chart').remove();
        d3.select('.histogram').remove();
        d3.select('#form').remove();
    }

    function removeLineAthleteCharts() {
        d3.select('.athlete-chart').remove();
        d3.select('.line-chart').remove();
    }

    var dataLabelOffset = 20;

    function showDataLabel(event) {
        d3.select('body')
            .append('div')
            .attr('id', 'data-label-text')
            .style('left', event.pageX + dataLabelOffset)
            .style('top', event.pageY + dataLabelOffset)
            .style('position', 'absolute')
            .style('display', 'inline')
            .style('background-color', 'white')
            .html(event.target.id);
    }

    function moveDataLabel(event) {
        d3.select('#data-label-text')
            .style('left', event.pageX + dataLabelOffset)
            .style('top', event.pageY + dataLabelOffset);
    }

    function hideDataLabel() {
        d3.select('#data-label-text')
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

    function addLineLegend(lineChart, lines) {

        var legendBoxHeight = 10;
        var legendHeight = lines.length*legendBoxHeight + 20;
        var legendX = 80;
        var legendY = 10;

        lineChart
            .append('rect')
            .attr('class', 'legend')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('height', legendHeight)
            .attr('width', 80)
            .style('fill', 'none')
            .style('stroke', 'black');

        lineChart
            .selectAll('.legend-color')
            .data(lines)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', legendX + 10)
            .attr('y', function(d, i) {
                return i * legendBoxHeight + legendY + 10;
            })
            .attr('height', legendBoxHeight)
            .attr('width', 10)
            .style('fill', function(d) {
                return d.color;
            });

        lineChart
            .selectAll('.legend-text')
            .data(lines)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', legendX + 35)
            .attr('y', function(d, i) {
                return i * legendBoxHeight + legendY + 12;
            })
            .attr('dominant-baseline', 'hanging')
            .text(function(d) {
                return d.text;
            })
            .style('font-size', legendBoxHeight);
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
        var topShift = -15;

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
