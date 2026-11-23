/**
 * SeatSync D3.js Visual Analytics Engine
 * Unit V Syllabus Demonstration: SVG Rendering, Scales, Axes, and Animated Bars
 */
window.renderOccupancyChart = function () {
  var container = d3.select('#d3-occupancy-chart');
  if (container.empty()) return;

  // Pull live colours from the black-theme design tokens so the chart stays in sync
  function readToken(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  var palette = {
    grid: readToken('--color-border', '#26262E'),
    axis: readToken('--color-text-primary', '#F5F5F7'),
    muted: readToken('--color-text-secondary', '#A3A3AC'),
    available: readToken('--color-available', '#4ADE80'),
    occupied: readToken('--color-occupied', '#F87171')
  };

  // Clear previous SVG contents
  container.html('');

  // Fetch live analytics from backend
  d3.json('/api/admin/analytics/occupancy').then(function (response) {
    if (!response || !response.success || !response.data || response.data.length === 0) {
      container.append('div')
        .attr('class', 'body-secondary')
        .style('padding', '30px')
        .style('text-align', 'center')
        .text('No occupancy data available yet.');
      return;
    }

    var data = response.data;
    var containerWidth = document.getElementById('d3-occupancy-chart').clientWidth || 640;
    var margin = { top: 20, right: 30, bottom: 40, left: 60 };
    var width = containerWidth - margin.left - margin.right;
    var height = 260 - margin.top - margin.bottom;

    var svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X Scale: Floors
    var x0 = d3.scaleBand()
      .domain(data.map(function (d) { return d.code; }))
      .rangeRound([0, width])
      .paddingInner(0.35);

    // Y Scale: Seat Counts
    var maxSeats = d3.max(data, function (d) { return d.totalSeats; }) || 20;
    var y = d3.scaleLinear()
      .domain([0, maxSeats + 4])
      .nice()
      .rangeRound([height, 0]);

    // Color Palette matching SeatSync black-theme tokens
    var color = d3.scaleOrdinal()
      .domain(['Available', 'Occupied'])
      .range([palette.available, palette.occupied]);

    // Sub-bars: Available vs Occupied
    var x1 = d3.scaleBand()
      .domain(['Available', 'Occupied'])
      .rangeRound([0, x0.bandwidth()])
      .padding(0.08);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .selectAll('line')
      .style('stroke', palette.grid)
      .style('stroke-dasharray', '3,3');

    // Draw grouped bars
    var floorGroups = svg.selectAll('.floor-group')
      .data(data)
      .enter().append('g')
      .attr('class', 'floor-group')
      .attr('transform', function (d) { return 'translate(' + x0(d.code) + ',0)'; });

    // Available Bars
    floorGroups.append('rect')
      .attr('x', x1('Available'))
      .attr('y', height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('rx', 6)
      .attr('fill', palette.available)
      .transition()
      .duration(600)
      .attr('y', function (d) { return y(d.availableSeats); })
      .attr('height', function (d) { return height - y(d.availableSeats); });

    // Occupied Bars
    floorGroups.append('rect')
      .attr('x', x1('Occupied'))
      .attr('y', height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('rx', 6)
      .attr('fill', palette.occupied)
      .transition()
      .duration(600)
      .attr('y', function (d) { return y(d.occupiedSeats); })
      .attr('height', function (d) { return height - y(d.occupiedSeats); });

    // Add Value Labels on top of bars
    floorGroups.append('text')
      .attr('x', x1('Available') + x1.bandwidth() / 2)
      .attr('y', function (d) { return y(d.availableSeats) - 6; })
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', palette.available)
      .text(function (d) { return d.availableSeats; });

    floorGroups.append('text')
      .attr('x', x1('Occupied') + x1.bandwidth() / 2)
      .attr('y', function (d) { return y(d.occupiedSeats) - 6; })
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', palette.occupied)
      .text(function (d) { return d.occupiedSeats; });

    // X Axis
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', palette.axis);

    // Y Axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', palette.muted);

    // Axis strokes tuned for the dark canvas
    svg.selectAll('.domain, .tick line')
      .style('stroke', palette.grid);

  }).catch(function (error) {
    console.error('[SeatSync D3] Error loading analytics:', error);
  });
};
