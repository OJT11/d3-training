function createChart(elementId) {

    // read in climate data
    d3.json('data/climate.json', function(error, data) {

        if (error) {
            console.error('failed to read data');
            return;
        }

        console.log('raw data: ', data);

        // convert data to appropriate types
        var parseTime = d3.timeParse('%Y');

        data.forEach(function(d) {
            d.year = parseTime((+d.year).toString());
            d.temp = +d.temp;
        });

        console.log('numeric data: ', data);

        // svg height, width, and inside margins
        var height = 1000;
        var width = 1500;
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
                d3.extent(data, function(d) {
                    return d.temp;
                })
            )
            .range([innerHeight, 0]);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var upShift = y(0);

        var xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1));

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + upShift + ')')
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)" );

        var yAxis = d3.axisLeft(y);

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // points
        g
            .selectAll('.point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', function(d) {
                return x(d.year);
            })
            .attr('cy', function(d) {
                return y(d.temp);
            })
            .attr('r', 3)
            .attr('fill', 'red')
            .attr('stroke', 'none');

        // line generator
        var line = d3
            .line()
            .x(function(d) {
                return x(d.year);
            })
            .y(function(d) {
                return y(d.temp);
            });

        // line
        g
            .append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // axis labels
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth + 20)
            .attr('y', upShift)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Year');

        var xCoord = -40;

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', xCoord)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,' + xCoord + ',' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Temperature Difference from Mean (Degrees C)');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Temperature Difference from Mean by Year');
    });
};

createChart('#climate-chart-holder');
