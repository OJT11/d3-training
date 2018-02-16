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

    // chart title
    g
        .append('text')
        .attr('class', 'title')
        .attr('x', innerWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'baseline')
        .style('font-size', 24)
        .text('U.S. Unemployment over Time');

    // scale
    function createScale() {
        var opacityScale = d3
        .scaleLinear()
        .domain([0, d3.max(countyDataList, function(d) {
            return d.Percent;
        })])
        .range([0, 1]);
        console.log(opacityScale.domain(), opacityScale.range());

        createLegend(opacityScale);

        return opacityScale;
    }
    
    // legend
    function createLegend(opacityScale) {
        var legendValues = [];
        for(j = 0; j <= 5; j++)
        {
            legendValues.push(Math.round(opacityScale.invert(j/5)));
        }
        legendValues.push('NaN');
        console.log(legendValues);

        // legend
        var legendGroup = g
            .append('g')
            .attr('class', 'legend');

        var legendX = innerWidth/2 - 75;
        var legendY = 8;

        // legend box
        legendGroup
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('height', 105)
            .attr('width', 125)
            .style('fill', 'none')
            .style('stroke', 'black')

        // legend title
        legendGroup
            .selectAll('.legend-title')
            .data(legendValues)
            .enter()
            .append('text')
            .attr('class', 'legend-title')
            .attr('x', legendX + 10)
            .attr('y', legendY + 15)
            .text("Unemployment Levels")
            .style('font-size', 10);

        // legend color
        legendGroup
            .selectAll('.legend-color')
            .data(legendValues)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', legendX + 45)
            .attr('y', function(d) {
                return legendValues.indexOf(d) * 10 + legendY + 25;
            })
            .attr('height', 10)
            .attr('width', 10)
            .style('fill', function(d) {
                if(isNaN(d)) {
                    return 'grey';
                } else {
                    return 'blue';
                }
            })
            .style('opacity', function(d) {
                if(isNaN(d)) {
                    return 1;
                } else {
                    return opacityScale(d);
                }
            })
            .style('stroke', 'black');

        // legend text
        legendGroup
            .selectAll('.legend-text')
            .data(legendValues)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', legendX + 60)
            .attr('y', function(d) {
                return legendValues.indexOf(d) * 10 + legendY + 27;
            })
            .attr('dominant-baseline', 'hanging')
            .text(function(d) {
                return d;
            })
            .style('font-size', 10);
    }


    // read in data
    function readCSV(i) {
        d3.csv('data/laucnty' + i + '.csv', function(error, data) { 
            handleError(error, 'failed to read laucnty' + i + '.csv');

            console.log('raw laucnty' + i + '.csv data: ', data);
            data.forEach(function(d) {
                d.id = d.StateCode + d.CountyCode;
            });
            i ++;

            if(i <= 16) {
                 countyData['20' + (i-1)] = data;
                 countyDataList = countyDataList.concat(data);
                 return readCSV(i);
            } else {
                if( i == 17) {
                    countyDataList = countyDataList.concat(data);
                    countyData['20' + (i-1)] = data;
                }
                readJSON();
            } 
        });
    };

    function handleError(error, msg) {
        if (error) {
            console.error(msg);
        }
    }

    var countyData = {};
    var countyDataList = [];
        
    readCSV(12);

    function readJSON() {
        d3.json('data/us-counties.json', function(error, data) {
            handleError(error, 'failed to read us-counties.json');
            console.log('us-counties.json data: ', data);
            console.log('all county data', countyData);
            console.log('all county data list: ', countyDataList);

            var opacityScale = createScale();
            for(i = 2012; i <= 2016; i++)
            {
                draw(data, i, opacityScale);
            }
        });
    }

    function mergeData(geoJSON, year) {
        geoJSON.features.forEach(function(d) {
            var match = countyData[year].filter(function(e) {
                return e.id == d.id.toString();
            });
            if(match[0]) {
                d.properties.unemployment_rate = +match[0].Percent;
            } else {
                d.properties.unemployment_rate = null
            };
        });
    };
    
    function draw(geoJSON, year, opacityScale) {

        mergeData(geoJSON, year);

        var position = innerWidth/5 + 20;
        var shift = -180;

        yearToLocation = {
            2012: position + shift,
            2013: position*2 + shift,
            2014: position*3 + shift,
            2015: position*4 + shift,
            2016: position*5 + shift
        }

        var albersProj = d3
            .geoAlbersUsa()
            .scale(375)
            .translate([yearToLocation[year], innerHeight / 2]);
        var geoPath = d3.geoPath().projection(albersProj);

        // map path
        var yearGroup = g
            .append('g')
            .attr('class', year + 'paths');
        yearGroup
            .selectAll('path')
            .data(geoJSON.features)
            .enter()
            .append('path')
            .attr('d', geoPath)
            .style('fill', function(d) {
                if(d.properties.unemployment_rate) {
                    return 'blue';
                } else {
                    return 'grey';
                }
            })
            .style('opacity', function(d) {
                if(d.properties.unemployment_rate) {
                    return opacityScale(d.properties.unemployment_rate);
                } else {
                    return 1;
                }
            })
            .style('stroke', 'black')
            .style('stroke-width', 0.5);

        // map title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', yearToLocation[year])
            .attr('y', 150)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 18)
            .text(year);
    };

};

createMap('#unemployment-holder');
