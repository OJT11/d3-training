function createChart(elementId) {

    // svg height, width, and inside margins
    var height = 700;
    var width = 1000;
    
    var margins = {
        top: 50,
        right: 70,
        bottom: 50,
        left: 70
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
        .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

    // read in air quality data
    d3.csv('data/air_quality.csv', function(error, data) {

        if (error) {
            console.error('failed to read data');
            return;
        }

        console.log('raw data: ', data);

        // convert data to numeric
        data.forEach(function(d) {
            d.Emissions = +(d.Emissions.replace(",", ""));
        });

        console.log('numeric data: ', data);

        // scales
        var x = d3
            .scaleBand()
            .domain(
                data.map(function(d) {
                    return d.State;
                })
            )
            .range([0, innerWidth])
            .padding(0.2);

        console.log('x scale: ', x.domain(), x.range());

        var y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(data, function(d) {
                    return d.Emissions;
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
        var colors = d3.scaleOrdinal(d3.schemeCategory10);
        g
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) {
                return x(d.State);
            })
            .attr('y', function(d) {
                return y(d.Emissions);
            })
            .attr('width', x.bandwidth())
            .attr('height', function(d) {
                return innerHeight - y(d.Emissions);
            })
            .attr('fill', function(d) {
                return colors(d.Region);
            })
            .attr('stroke', 'none');

        // legend
        var regions = Array.from(new Set(data.map(function (d) {
            return d.Region;
        })));
        console.log('regions: ', regions);

        g
            .append('rect')
            .attr('class', 'legend')
            .attr('x', 40)
            .attr('y', 10)
            .attr('height', 50)
            .attr('width', 100)
            .style('fill', 'none')
            .style('stroke', 'black');

        g
            .selectAll('.legend-color')
            .data(regions)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', 50)
            .attr('y', function(d) {
                return regions.indexOf(d) * 10 + 15;
            })
            .attr('height', 10)
            .attr('width', 10)
            .style('fill', function(d) {
                return colors(d);
            });

        g
            .selectAll('.legend-text')
            .data(regions)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', 75)
            .attr('y', function(d) {
                return regions.indexOf(d) * 10 + 17;
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
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('State');

        var xCoord = -50;

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', xCoord)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,' + xCoord + ',' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Emissions');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Emissions by State');
    });
};

createChart('#air-chart-holder');
