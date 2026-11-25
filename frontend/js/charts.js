/* One simple D3.js bar chart: free desks vs used desks on each floor. */
window.renderOccupancyChart = function (data) {
  var holder = document.getElementById('occupancy-chart');
  if (!holder || !window.d3 || !data.length) return;

  holder.innerHTML = '';

  var width = 640, height = 220, left = 130, right = 20, top = 20, bottom = 30;
  var max = d3.max(data, function (d) { return d.totalSeats; }) || 1;
  var scale = d3.scaleLinear().domain([0, max]).range([0, width - left - right]);
  var rowHeight = (height - top - bottom) / data.length;

  var svg = d3.select(holder).append('svg')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('width', '100%')
    .attr('height', height);

  data.forEach(function (d, index) {
    var y = top + index * rowHeight;

    svg.append('text').attr('x', left - 10).attr('y', y + 20)
      .attr('text-anchor', 'end').attr('font-size', '12').text(d.code || d.floorName);

    svg.append('rect').attr('x', left).attr('y', y + 2)
      .attr('width', scale(d.availableSeats)).attr('height', 14)
      .attr('fill', '#2f9e5f');
    svg.append('text').attr('x', left + scale(d.availableSeats) + 6).attr('y', y + 14)
      .attr('font-size', '11').text('Free ' + d.availableSeats);

    svg.append('rect').attr('x', left).attr('y', y + 22)
      .attr('width', scale(d.occupiedSeats)).attr('height', 14)
      .attr('fill', '#57606a');
    svg.append('text').attr('x', left + scale(d.occupiedSeats) + 6).attr('y', y + 34)
      .attr('font-size', '11').text('Used ' + d.occupiedSeats);
  });
};
