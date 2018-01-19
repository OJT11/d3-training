function createChart(elementId) {

    // read in climate data
    d3.json('data/climate.json', function(error, data) {

        if (error) {
            console.error('failed to read data');
            return;
        }

        console.log('raw data: ', data);

        // convert data to numeric
        data.forEach(function(d) {
            d.year = +d.year;
            d.temp = +d.temp;
        });

        console.log('numeric data: ', data);

        // svg height, width, and inside margins
        var margins = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        };

        // set the height such that each bar is 5px, with 2px space after all but last bar
        var height = data.length * 7 - 2 + 7 + margins.top + margins.bottom;
        var width = 1000;

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
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        // scales
        var x = d3
            .scaleLinear()
            .domain(
                d3.extent(data, function(d) {
                    return d.temp;
                })
            )
            .range([0, innerWidth]);

        console.log('x scale: ', x.domain(), x.range());

        var y = d3
            .scaleBand()
            .domain(
                data.map(function(d) {
                    return d.year;
                })
            )
            .range([innerHeight, 0])
            .paddingInner(2/7)
            .paddingOuter(0.5);

        console.log('y scale: ', y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis);


        var rightShift = x(0);

        var yAxis = d3.axisLeft(y).tickValues([]);

        g
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate(' + rightShift + ',0)')
            .call(yAxis);

        // group data by decade
        data.forEach(function(d) {
                d.decade = d.year.toString().slice(0, -1);
        })

        console.log('decade data:', data);
        var colors = d3.scaleOrdinal(d3.schemeCategory20);

        

        // bars
        g
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) {
                return x(Math.min(0, d.temp));
            })
            .attr('y', function(d) {
                return y(d.year);
            })
            .attr('width', function(d) {
                return Math.abs(x(d.temp)-rightShift);
            })
            .attr('height', y.bandwidth())
            .attr('fill', function(d) {
                return colors(d.decade);
            })
            .attr('stroke', 'none');

        //data labels
        g
            .selectAll('.label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', function(d) {
                if(d.temp < 0) {
                    return x(0.01);
                } else {
                    return x(-0.04);
                }
            })
            .attr('y', function(d) {
                return y(d.year);
            })
            .attr('dominant-baseline', 'hanging')
            .text(function(d) {
                return d.year;
            })
            .style('font-size', 10);

        // axis labels
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth/ 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Temperature Difference from Mean (Degrees C)');

        var xCoord = -40;

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', xCoord)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,' + xCoord + ',' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Year');

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
