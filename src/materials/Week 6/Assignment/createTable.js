function createTable(answerBox, title, colNames, tableData, varNames) {
    var answer = answerBox.append('p').text(title);
    var table = answer.append('table');

    table
        .append('tr')
        .selectAll('td')
        .data(colNames)
        .enter()
        .append('td')
        .text(function(d) {
            return d;
        });

    table
        .selectAll('tr.data')
        .data(tableData)
        .enter()
        .append('tr')
        .selectAll('td')
        .data(function(d) {
            return varNames.map(function(e) {
                return d[e];
            });
        })
        .enter()
        .append('td')
        .text(function(d) {
            return d;
        });
};
