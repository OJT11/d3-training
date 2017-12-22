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


My design: As the original visualization showed that the company has quarterly goals, I organized the whole tool at the quarterly level, removing the 3 monthly figures. If it's important to see monthly performance within a quarter, I would move this to a different figure where you specify one quarter and see the 3 monthly charts for only that quarter. Infering from the figures included in the original, revenue seems to be the most significant outcome. Therefore, I limited my mockup to revenue. In terms of the pie charts showing the distribution of revenue by product and by region, the distributions among these categories didn't seem informative without knowing the goal or past performance for context, so I removed them. The tables at the bottom were difficult to read and glean any trends from and similarly lacked context. It doesn't seem necessary to have that level of specificity on this type of tool, so my figure replaces them with a bar showing the key pieces of information relative to their goals: current quarter revenue, total revenue to date, and projected revenue through the end of the year. By replacing many of the graphs with clear static indicators, my visualization makes current performance immediately obvious, allows the user to put the current performance in historical context, and summarizes future projections for revenue. It highlights one metric, revenue, and enables the user to see what contributes to its performance. By keeping the total revenue circle and the total revenue chart static, the user can see the total as they explore the contributing factors with the dynamic charts.



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
	-ex. for figure 1, write "Dollars" along the y-axis then put 0, 2, 4, etc.
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


My design: My visualization simplifies the original significantly. As I could not determine what the x-axis represented in any of the plots, I used the plot titles to infer the y and x axes and disregarded the column numbers. I removed figure 3 because it's not clear what data it is trying to show, and I removed figure 6 because a moving average is not an intuitive metric and sales are already represented in the first two figures. I also consolidated figures 4 and 5 into one plot as it might be helpful to compare how a product within the category contributes to sales relative to how it contributes to margins.



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


My design: In my visualization, I combine the regular and off season data. I divide the chart into one that shows what percent of visitors return to the site from each group and one that shows how soon visitors return (if they return at all). This makes more apparent the percent of visitors that ever return and how that compares to the average. It also avoids binning units of time into uneven sections (24 hrs, 1-3 days), which can be misleading. 
