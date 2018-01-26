function createChart(elementId) {

    // read in population data
    d3.json('data/population.json', function(error, data) {

        if (error) {
            console.error('failed to read data');
            return;
        }

        console.log('raw data: ', data);

        // check for missing data
        var missingData = data.filter(function(d) {
            return !d.year || !d.pop;
        })
        console.log('missing data: ', missingData)

        // convert data to appropriate types
        var parseTime = d3.timeParse('%Y');

        data.forEach(function(d) {
            d.year = parseTime(d.year.split("January-")[1]);
            if(d.pop) {
                d.pop = +d.pop;
            }
        });

        console.log('numeric data: ', data);

        // svg height, width, and inside margins
        var height = 1000;
        var width = 1500;
        var margins = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 90
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

        // scales
        var x = d3
            .scaleTime()
            .domain(
                d3.extent(data, function(d) {
                    return d.year;
                })
            )
            .range([0, innerWidth]);

        console.log('x scale: ', x.domain(), x.range());

        var y = d3
            .scaleLinear()
            .domain(
                [0,
                d3.max(data, function(d) {
                    return d.pop;
                })]
            )
            .range([innerHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1));

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(-10, -12)" );

        var yAxis = d3.axisLeft(y);

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // line generator
        var line = d3
            .line()
            .x(function(d) {
                return x(d.year);
            })
            .y(function(d) {
                return y(d.pop);
            })
            .defined(function(d) {
                return d.pop != null;
            });

        // lines
        var countries = Array.from(new Set(data.map(function (d) {
            return d.country;
        })));
        
        var colors = d3.scaleOrdinal(d3.schemeCategory20);

        console.log('countries: ', countries);

        var groups = g
            .selectAll('.country')
            .data(countries)
            .enter()
            .append('g')
            .attr('class', 'country');

        groups
            .append('path')
            .datum(function(d) {
                return data.filter(function(g) {
                    return g.country === d;
                });
            })
            .attr('class', 'pop-line')
            .attr('fill', 'none')
            .attr('stroke', function(d) {
                return colors(d[0].country);
            })
            .attr('stroke-width', 2)
            .attr('d', line);

        // legend
        var legend = g
            .append('g')
            .attr('class', 'legend');

        var legendHeight = countries.length * 10 + 15;

        legend
            .append('rect')
            .attr('class', 'legend-box')
            .attr('x', 40)
            .attr('y', 10)
            .attr('height', legendHeight)
            .attr('width', 100)
            .style('fill', 'none')
            .style('stroke', 'black');

        legend
            .selectAll('.legend-color')
            .data(countries)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', 50)
            .attr('y', function(d) {
                return countries.indexOf(d) * 15 + 15;
            })
            .attr('height', 10)
            .attr('width', 10)
            .style('fill', function(d) {
                return colors(d);
            });

        legend
            .selectAll('.legend-text')
            .data(countries)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', 75)
            .attr('y', function(d) {
                return countries.indexOf(d) * 15 + 17;
            })
            .attr('dominant-baseline', 'hanging')
            .text(function(d) {
                return d;
            })
            .style('font-size', 10);

        // axis labels
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth/2)
            .attr('y', innerHeight + 40)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Year');

        var xCoord = -75;

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', xCoord)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,' + xCoord + ',' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Population');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Population by Country by Year');
    });
};

createChart('#population-chart-holder');
