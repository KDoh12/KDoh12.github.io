(function () {
  // application code goes here
  // Add event listener for resizing that calls the adjustHeight function
  adjustHeight();
  window.addEventListener("resize", adjustHeight);

  // Add event listener to toggle on/off the legend button
  const button = document.querySelector("#legend button");
  button.addEventListener("click", function () {
    const legend = document.querySelector(".leaflet-legend");
    legend.classList.toggle("show-legend");
  });

  // Initialize the map (centered on Kenya)
  var map = L.map("map", {
    zoomSnap: 0.1,
    zoom: 7,
    center: [-0.23, 37.8],
    zoomControl: false,
    minZoom: 6,
    maxZoom: 9,
    maxBounds: L.latLngBounds([-6.22, 27.72], [5.76, 47.83]),
  });

  // Mapbox API access Token
  var accessToken = "pk.eyJ1Ijoia2RvaDIwIiwiYSI6ImNqcDA4cjR3YjB2YmYzdnA0aTBibHdpdTYifQ.ijxYjKJUveJ5V_XUbBN-LA";

  // Request a mapbox raster tile layer and add to map
  L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
  }).addTo(map);

  // Load the Kenyan data
  omnivore
    .csv("data/kenya_education.csv")
    .on("ready", function (e) {
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON());
      // console.log(e.target.toGeoJSON());
    })
    .on("error", function (e) {
      console.log(e.error[0].message);
    });

  // Function that resizes the content and map
  // #############################################
  function adjustHeight() {
    const mapSize = document.querySelector("#map"),
      contentSize = document.querySelector("#content"),
      removeHeight = document.querySelector("#footer").offsetHeight,
      resize = window.innerHeight - removeHeight;

    mapSize.style.height = `${resize}px`;

    if (window.innerWidth >= 768) {
      contentSize.style.height = `${resize}px`;
      mapSize.style.height = `${resize}px`;
    } else {
      contentSize.style.height = `${resize * 0.25}px`;
      mapSize.style.height = `${resize * 0.75}px`;
    }
  }
  // #############################################

  // Function that draws the map
  // #############################################
  function drawMap(data) {
    // access data
    console.log(data);

    // Default options for circle markers
    const options = {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          opacity: 1,
          weight: 2,
          fillOpacity: 0,
        });
      },
    };

    // Create 2 layers from GeoJSON data
    const girlsLayer = L.geoJson(data, options).addTo(map);
    const boysLayer = L.geoJson(data, options).addTo(map);

    // Fit the bounds of the map to a layer
    map.fitBounds(girlsLayer.getBounds(), {
      padding: [50, 50],
    });

    girlsLayer.setStyle({
      color: getColor("girls"),
    });
    boysLayer.setStyle({
      color: getColor("boys"),
    });

    resizeCircles(girlsLayer, boysLayer, 1);
    sequenceUI(girlsLayer, boysLayer);
  }
  // #############################################

  // Function to get the color used by each layer
  // #############################################
  function getColor(x) {
    // Access the fourth stylesheet reference in the HTML head element
    const stylesheet = document.styleSheets[3];
    const colors = [];

    // // Check rules in stylesheet
    // console.log(stylesheet.cssRules);

    // Loop through rules
    for (let i of stylesheet.cssRules) {
      // When girls and boys is found, add color to an array
      if (i.selectorText === ".girls") {
        colors[0] = i.style.color;
      }
      if (i.selectorText === ".boys") {
        colors[1] = i.style.color;
      }
    }

    // If/else that returns the color for the appropriate layer
    if (x == "girls") {
      return colors[0];
    } else {
      return colors[1];
    }
  }
  // #############################################

  // Function to calculate radius
  // #############################################
  function calcRadius(val) {
    const radius = Math.sqrt(val / Math.PI);
    return radius * 0.5; // the 0.5 is a scale factor, can be adjusted
  }
  // #############################################

  // Function to resize circles
  // #############################################
  function resizeCircles(girlsLayer, boysLayer, currentGrade) {
    girlsLayer.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties["G" + currentGrade]));
      layer.setRadius(radius);
    });
    boysLayer.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties["B" + currentGrade]));
      layer.setRadius(radius);
    });

    retreiveInfo(boysLayer, currentGrade);
  }
  // #############################################

  // Function for UI slider
  // #############################################
  function sequenceUI(girlsLayer, boysLayer) {
    // Do same thing as legend for the UI Slider
    const sliderControl = L.control({
      position: "bottomleft",
    });

    sliderControl.onAdd = function () {
      const controls = L.DomUtil.get("slider");

      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;
    };

    sliderControl.addTo(map);

    // Select the sliders input and listen for any changes
    const slider = document.querySelector("#slider input");
    slider.addEventListener("input", function (e) {
      // Current slider value
      var currentGrade = e.target.value;

      // Resize the circles with updated value
      resizeCircles(girlsLayer, boysLayer, currentGrade);

      const sliderLegend = document.querySelector(".slider-legend span");
      sliderLegend.innerHTML = `Grade ${currentGrade}`;

      // Update the output
      // output.innerHTML = currentGrade;
    });
  }
  // #############################################

  // Function to add legend
  // #############################################
  function drawLegend(data) {
    // Create Leaflet control for the legend
    const legendControl = L.control({
      position: "bottomright",
    });

    // When the control is added to map
    legendControl.onAdd = function () {
      // Select the legend using the id attribute of legend
      const legend = L.DomUtil.get("legend");

      // Disable scroll and click functionality
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);

      // Return the selection
      return legend;
    };

    // Add legend to the map
    legendControl.addTo(map);

    // Empty array to hold values
    const dataValues = [];

    // Loop through all features
    data.features.forEach(function (school) {
      for (let grade in school.properties) {
        // Create shorthand
        const value = school.properties[grade];
        // If value can be converted to a number, the + operator in front of a number returns a number
        if (+value) {
          dataValues.push(+value);
        }
      }
    });

    // Verify
    console.log(dataValues);

    // sort our array
    const sortedValues = dataValues.sort(function (a, b) {
      return b - a;
    });

    // round the highest number and use as our large circle diameter
    const maxValue = Math.round(sortedValues[0] / 1000) * 1000;

    // calc the diameters
    const largeDiameter = calcRadius(maxValue) * 2,
      smallDiameter = largeDiameter / 2;

    // create a function with a short name to select elements
    const $ = function (x) {
      return document.querySelector(x);
    };

    // select our circles container and set the height
    $(".legend-circles").style.height = `${largeDiameter.toFixed()}px`;

    // set width and height for large circle
    $(".legend-large").style.width = `${largeDiameter.toFixed()}px`;
    $(".legend-large").style.height = `${largeDiameter.toFixed()}px`;

    // set width and height for small circle and position
    $(".legend-small").style.width = `${smallDiameter.toFixed()}px`;
    $(".legend-small").style.height = `${smallDiameter.toFixed()}px`;
    $(".legend-small").style.top = `${largeDiameter - smallDiameter - 2}px`;
    $(".legend-small").style.left = `${smallDiameter / 2}px`;

    // label the max and half values
    $(".legend-large-label").innerHTML = `${maxValue.toLocaleString()}`;
    $(".legend-small-label").innerHTML = (maxValue / 2).toLocaleString();

    // adjust the position of the large based on size of circle
    $(".legend-large-label").style.top = `${-11}px`;
    $(".legend-large-label").style.left = `${largeDiameter + 30}px`;

    // adjust the position of the large based on size of circle
    $(".legend-small-label").style.top = `${smallDiameter - 13}px`;
    $(".legend-small-label").style.left = `${largeDiameter + 30}px`;

    // insert a couple hr elements and use to connect value label to top of each circle
    $("hr.small").style.top = `${largeDiameter - smallDiameter - 10}px`;
  }
  // #############################################

  // Function that retrieves info
  // #############################################
  function retreiveInfo(boysLayer, currentGrade) {
    // Select the element assign to variable
    const info = document.querySelector("#info");

    // Use layer that is on top to detect mouseover events and show info panel
    boysLayer.on("mouseover", function (e) {
      // Replace  the display property with a block
      info.style.display = "block";

      // Create shorthand
      const props = e.layer.feature.properties;

      // Create a function with short name to select elements
      const $ = function (x) {
        return document.querySelector(x);
      };

      // Populate HTML elements
      $("#info span").innerHTML = props.COUNTY;
      $(".girls span:first-child").innerHTML = `(grade ${currentGrade})`;
      $(".boys span:first-child").innerHTML = `(grade ${currentGrade})`;
      $(".girls span:last-child").innerHTML = Number(props[`G${currentGrade}`]).toLocaleString();
      $(".boys span:last-child").innerHTML = Number(props[`B${currentGrade}`]).toLocaleString();

      // Raise the opacity level
      e.layer.setStyle({
        fillOpacity: 0.6,
      });

      // Create empty arrays for boys and girls values
      const girlsValues = [],
        boysValues = [];

      // loop through the grade levels and push values into those arrays
      for (let i = 1; i <= 8; i++) {
        girlsValues.push(props["G" + i]);
        boysValues.push(props["B" + i]);
      }

      // Sparkline options for boys and girls
      const girlsOptions = {
        id: "girlspark",
        width: 280, // No need for units; D3 will use pixels.
        height: 50,
        color: getColor("girls"),
        lineWidth: 3,
      };

      const boysOptions = {
        id: "boyspark",
        width: 280,
        height: 50,
        color: getColor("boys"),
        lineWidth: 3,
      };

      sparkLine(girlsValues, girlsOptions, currentGrade);
      sparkLine(boysValues, boysOptions, currentGrade);
    });

    // Hide info panel
    boysLayer.on("mouseout", function (e) {
      info.style.display = "none";

      // Reset layer style
      e.layer.setStyle({
        fillOpacity: 0,
      });
    });

    // When the mouse moves on the document...
    document.addEventListener("mousemove", function (e) {
      // If the page is on a small screen, calculate the position of the info window
      if (window.innerWidth < 768) {
        info.style.right = "10px";
        info.style.top = `${window.innerHeight * 0.25 + 5}px`;
      } else {
        // Console the page coordinate to understand positioning
        // console.log(e.pageX, e.pageY);

        // Offset info window position from the mouse position
        (info.style.left = `${e.pageX + 6}px`), (info.style.top = `${e.pageY - info.offsetHeight - 25}px`);

        // If it crashes into the right, flip to the left
        if (e.pageX + info.offsetWidth > window.innerWidth) {
          info.style.left = `${e.pageX - info.offsetWidth - 6}px`;
        }

        // If it crashes into the top, flip to lower right
        if (e.pageY - info.offsetHeight - 25 < 0) {
          info.style.top = `${e.pageY + 6}px`;
        }
      }
    });
  }
  // #############################################

  // Sparkline function
  // #############################################
  function sparkLine(data, options, currentGrade) {
    d3.select(`#${options.id} svg`).remove();

    const w = options.width,
      h = options.height,
      m = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      iw = w - m.left - m.right,
      ih = h - m.top - m.bottom,
      x = d3.scaleLinear().domain([0, data.length]).range([0, iw]),
      y = d3
        .scaleLinear()
        .domain([d3.min(data), d3.max(data)])
        .range([ih, 0]);

    // My sparkline charts seemed to be messed up and didn't fit the window.
    // I found this clamp function in the D3 docs and it seemed to fix?
    x.clamp(true);
    y.clamp(true);

    const svg = d3
      .select(`#${options.id}`)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    const line = d3
      .line()
      .x((d, i) => x(i))
      .y((d) => y(d));

    const area = d3
      .area()
      .x((d, i) => x(i))
      .y0(d3.min(data))
      .y1((d) => y(d));

    svg.append("path").datum(data).attr("stroke-width", 0).attr("fill", options.color).attr("opacity", 0.5).attr("d", area);

    svg.append("path").datum(data).attr("fill", "none").attr("stroke", options.color).attr("stroke-width", options.lineWidth).attr("d", line);

    svg
      .append("circle")
      .attr("cx", x(Number(currentGrade) - 1))
      .attr("cy", y(data[Number(currentGrade) - 1]))
      .attr("r", "4px")
      .attr("fill", "white")
      .attr("stroke", options.color)
      .attr("stroke-width", options.lineWidth / 2);
  }
  // #############################################
})();
