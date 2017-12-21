Visualization 1 Notes:

Good:
-complete: 
	-labels on all sections, selection options, figures, axes, tables, columns, rows
	-label content is clear and helps user quickly understand each figure
-intuitive:
	-uses appropriate figure types
		-line graphs to represent change in quantities over time
		-bar graphs to represent quantities by category
		-pie charts to represent components of a whole
-high data-ink ratio: no graphics or text unrelated to data
-seems like an objective representation of the data
-exploratory nature seems appropriate for monthly/quarterly/yearly timescale and business metrics

Bad:
-not simple
	-although each figure is individually clear, it takes quite a while to understand how they relate to one another
	-within the slide, there are many cuts of the data that are displayed independently of one another
		-time periods: months, quarters, years
		-outcomes: revenue, profit, avg order size, market share, cust sat, on-time delivery, new customers, product revenue, future revenue, cumulative revenue
		-views: global, by region, by product
-unfocused
	-although it is probably meant to be an exploratory tool, it could still be more focused
		-for example, it seems like the company has quarterly goals, so each figure could be at the quarterly level with the goal specified
	-difficult to discern takeaways from the table
-some context is missing
	-there are only 5 products listed - does the company only sell 5 or are these the top 5?
	-what are the quarterly goals that correspond to green, yellow, and red?
	-why are two rows in the Sales Pipeline Information table highlighted?
-bar graphs and pie charts inaccessible to color blind individuals

My design:
-move scale to quarterly (consolidate figures on top line into 3)
-perhaps make another tool to see information by month in a specified quarter
-make table into chart
-make pie charts into stacked bar charts (no selection necessary)
-make the options listed into the key goals (revenue, profit, avg order size)


Visualization 2 Notes:

Good:
-layout: figures are clearly organized on the page

Bad:
-not simple/not intuitive:
	-convention of writing titles as "y-axis vs x-axis" not followed
	-figure 1: 
		-unclear what the x-axis represents
			-if it represents time, then it would be clearer to calculate (percent margin/sales) and plot that one value over time for each group
		-how can the plot represent "Sales vs. Percent Margin" if they each are on a y-axis?
	-figure 2: cannot figure out the meaning of the area, bars, and lines on figure 2
	-figure 3: how is it supposed to relate to figure 1 (which has similar variables)?
	-figure 6: a moving average is not an intuitive metric
-lots of context missing: 
	-many labels have no meaning
		-labels on x-axes of figures 1, 2, 3, and 6
		-legend labels on every figure
		-slide title (especially since the slide seems to refer to categories of products rather than individual products)
	-why are some lines in figure 6 dashed while others are dotted?
-labels should be more concise
	-ex. for figure 1, write "Millions of Dollars" along the y-axis then put 0, 2, 4, etc.
-low data-ink ratio:
	-the figures could be made much larger
		-if the title of the slide and labels on the left were smaller
		-if the labels on the left did not include images
-colors:
	-not accessible to color-blind individuals
	-difficult for everyone to see the light yellows on the white background
	-legend should not need a background color
-unfocused: unclear what the key outcomes of interest are (sales? margins?) to the company
-does not make effective use of the length dimension

My design:
-nested bar chart for showing contributions to sales/margin
-figure 1, assume outcome of interest is percent margin, then percent margin on y and sales on x
-not sure whether x-axis represents time but needs to be simplified to either one point in time (2001) or ratios that you plot over time (sales/divided by percent margin over time)
-get rid of 3 because not sure what it's showing
-get rid of 6 or change to average sales

Visualization 3 Notes:

Good:
-focused: poses a clear question that the graphic answers
-intuitive: 
	-color gradient makes sense given continuous nature of time
	-stacked bar chart
		-makes sense for parts of a whole
		-with this many time categories, is much clearer than a pie chart
-context:
	-gives a definition of the population being measured
	-labels on numbers are helpful
	-legend clearly identifies time periods
	-but:
		-could explicitly specify that platform average is the average of all other NFL teams and include the number of other teams
-looks accessible to color blind individuals
-makes effective use of color and length

Bad:
-medium data-ink ratio
	-arrows on the field unnecessary
	-months in each season could be specified outside of the figure for simplicity
	-labels could be moved to not intersect with the unit lines
-could be simpler: unclear why data needs to be broken out by season
-could be more objective
	-the way the bins of time are created could mask important variation in the data

My design: 
-if primary comparison is between new orleans saints and platform average, group those bars together
-else group off season and regular season together
-do not group by season
-could do a box plot of average time to return to site or make a dark line between 1+ month and never returns
-could only label the 2 sections
