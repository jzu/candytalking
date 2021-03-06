/***************************************************************************
 * candytalking.js
 *
 * Just Another Minimal Charts script
 * https://github.com/jzu/candytalking
 *
 * Copyright (C) 2014 Jean Zundel <jzu@free.fr> 
 * License: http://opensource.org/licenses/MIT
 * 
 * Draws blocks, stacked blocks, lines, Bezier curves or dots from a JSON 
 * structure whose name matches a canvas id. Type of graph is given by the 
 * class name: "blocks", "stacked, "dots, "lines" or "bezier", or any 
 * combination of them.
 * All sizes, fonts, etc. are based on the dimensions of the canvas. 
 * Executed automatically by default when the page is loaded.
 *
 ***************************************************************************/


/***************************************************************************
 * drawDot()
 *
 * Draws a coloured dot with a grey circle
 ***************************************************************************/

function drawDot (ctx, x, y, d, clr) {

  var oldStrokeStyle = ctx.strokeStyle;
  var oldFillStyle = ctx.fillStyle;
  ctx.strokeStyle = "#BBBBBB";      // Grey ring around the dot
  ctx.fillStyle = clr;

  ctx.beginPath ();
  ctx.arc (x, y, d, 0, Math.PI * 2);
  ctx.fill ();
  ctx.closePath ();
  ctx.stroke ();

  ctx.strokeStyle = oldStrokeStyle;
  ctx.fillStyle = oldFillStyle;
}

/*
function verticalLine () {
/***************************************************************************
 * verticalLine()
 *
 * Draws a vertical line in light grey
 ***************************************************************************
  
function verticalLine () {
      ctx.strokeStyle = "#DDDDDD";
      ctx.beginPath ();
      ctx.moveTo (marginX + spaceXAxis + valSpW * (i - 1),
                  marginY + marginTitle + valSpH);
      ctx.lineTo (marginX + spaceXAxis + valSpW * (i - 1),
                  marginY + marginTitle);
      ctx.stroke ();
}
*/

/****************************************************************************
 * drawY()
 * 
 * Draws a Y value in the left margin and the corresponding horizontal line
 ***************************************************************************/

function drawY (canvas_h, ctx, i, marginX, scaleY, spaceXAxis) {

  ctx.fillText (i, 
                marginX * 1.5 - ctx.measureText (i).width, 
                scaleY); 
  ctx.beginPath ();
  ctx.moveTo (marginX * 2, scaleY);
  ctx.lineTo (marginX + canvas_h.width - spaceXAxis, scaleY);
  ctx.stroke ();
}


/****************************************************************************
 * onload() handler
 * 
 * Draws charts in all canvases of class "blocks", "stacked", "dots", 
 * "lines", "bezier", and any combination of them (i.e. "lines+dots")
 * All dimensions in pixels except yMin, yMax
 * You may want to use this function on demand, for instance if you already
 * have an onload() handler. In this case, just rename it, and call it
 * explicitely from elsewhere.
 ***************************************************************************/

window.onload = function () {

  var graphs = [ "blocks", "stacked", "dots", "lines", "bezier" ];

  var canvas = document.getElementsByTagName ("canvas");

  for (var h = 0; h < canvas.length; h++) {

    if (! graphs.some (function (v) { 
                         return canvas [h].className.indexOf (v) >= 0; 
                       }))
      continue;

    var ctx = canvas [h].getContext ("2d");
    var histName = canvas [h].getAttribute ('id');
    var hist = eval (histName);
    var nbSets = hist.data.length - 1;
    var nbValues = hist.data [0].length - 1;

    // Title and text font sizes

    var titleFontSize = (canvas [h].width < canvas [h].height * 4 / 3)
                        ? canvas [h].width / 25
                        : canvas [h].height / 18;
    var textFontSize = (canvas [h].width < canvas [h].height * 4 / 3)
                       ? canvas [h].width / 40
                       : canvas [h].height / 30;

    // Margins

    var marginX = textFontSize * 2;
    var marginY = textFontSize * 2;
    var spaceXAxis = textFontSize * 4;
    var spaceYAxis = textFontSize * 2;
    var marginTitle = textFontSize * 4;
 
    // A block contains several values if there are several datasets

    var valSpW = (canvas [h].width - marginX * 2 - spaceXAxis) / nbValues;
    var valSpH = canvas [h].height - marginY * 2 - spaceYAxis - marginTitle;

    // Y-axis adjustment

    var yMin = 0;
    var yMax = 0;
    if (canvas [h].className.indexOf ("stacked") >= 0) {
      for (j = 1; j <= nbValues; j++) {
        var iYMax = 0;
        for (i = 1; i <= nbSets; i++) {
          iYMax += hist.data [i][j];      // Sum of values at Y position
        }
        yMax = (iYMax > yMax)
               ? iYMax
               : yMax;
      }
    }
    else {                                // General case (!stacked)
      for (i = 1; i <= nbSets; i++)
        for (j = 1; j <= nbValues; j++)
          yMax = (hist.data [i][j] > yMax) 
                 ? hist.data [i][j] 
                 : yMax;
      yMax = (yMax > 0) 
             ? yMax 
             : 0;
      for (i = 1; i <= nbSets; i++)
        for (j = 1; j <= nbValues; j++)
          yMin = (hist.data [i][j] < yMin) 
                 ? hist.data [i][j] 
                 : yMin;
      yMin = (yMin < 0) 
             ? yMin 
             : 0;
    }
    if ((yMin == 0) && (yMax == 0))
      yMax = 1;                       // Avoid nonsensical Y-coordinates

    // Origin on the Y-axis

    var ord0 = marginY + marginTitle + valSpH + yMin * valSpH / (yMax - yMin);

    // Title

    ctx.font = (titleFontSize + "px Helvetica");
    ctx.fillText (hist.title, marginX * 2, marginY * 1.5);
    ctx.font = (textFontSize + "px Helvetica");

    // X-axis labels

    ctx.fillStyle = hist.colors [0];
    ctx.fillText (hist.data [0][0],
                  marginX ,
                  marginY + marginTitle + valSpH + spaceYAxis);
    for (i = 1; i <= nbValues; i++) {
      ctx.fillText (hist.data [0][i],
                    marginX + spaceYAxis + valSpW * (i - 1) 
                    + (valSpW - valSpW/nbSets 
                    + ctx.measureText (hist.data [0][i]).width) / 2,
                    marginY + marginTitle + valSpH + spaceYAxis);
    }


    // Draw lines (y=0 is bold) and numbers on the Y-axis
    // Right-align numbers, avoid overlapping 
    // First min and max values, then step by step

    ctx.lineWidth = 0;
    ctx.strokeStyle = "#DDD";
    var greyLine = ctx.strokeStyle;

    drawY (canvas [h], 
           ctx, 
           yMin, 
           marginX, 
           marginY + marginTitle + valSpH, 
           spaceXAxis);
    drawY (canvas [h], 
           ctx, 
           yMax, 
           marginX, 
           marginY + marginTitle,
           spaceXAxis);

    // Then horizontal lines and Y-axis labels

    var zeroes = 0;
    var range = yMax - yMin;
    var step = range;

    // Intervals on the Y-axis
    // Find +/- the exponent of the range (at 25 => step *= 10)

    if (range >= 1) {
      for (zeroes = 0; step > 25; zeroes++)
        step /= 10;
      step = 1;
      for (i = 0; i < zeroes; i++)
        step *= 10;
    }
    else {
      if (range > 0) 
        for (zeroes = 0; step < 2.5; zeroes--)
          step *= 10;
      step = 1;
      for (i = 0; i > zeroes; i--)
        step /= 10;
    }

    var yMinTrunc = -Math.floor (-yMin / step) * step;   // Never > 0
  
    for (i = yMinTrunc; i <= yMax; i+=step) {
      if ((i - yMin > range / 25) && 
          (yMax - i > range / 25)) {   // Don't you step on my blue suede shoes
        drawY (canvas [h], 
               ctx, 
               (range < 2.5) 
               ? i.toFixed (-zeroes)   // Bug^H^H^H Implementation detail in JS
               : i, 
               marginX, 
               marginY + marginTitle + valSpH + (yMin-i) * valSpH / range,
               spaceXAxis);
        if (i == 0) {
          ctx.strokeStyle = "#888";    // Y = 0
          ctx.stroke ();
          ctx.strokeStyle = greyLine;
        }
      }
    }

    // Coloured dots and dataset names 

    var sMaxWidth = 0;
    for (i = 1; i <= nbSets; i++)
      if (ctx.measureText (hist.data [i][0]).width > sMaxWidth)
        sMaxWidth = ctx.measureText (hist.data [i][0]).width;

    for (i = 1; i <= nbSets; i++) {

      drawDot (ctx,
               canvas [h].width - marginX - sMaxWidth - textFontSize * 1.5,
               marginY + (i - 1) * textFontSize * 1.1 - textFontSize / 2,
               textFontSize * 3 / 7,
               hist.colors [i]);
      ctx.fillStyle = "black";
      ctx.fillText (hist.data [i][0], 
                    canvas [h].width - marginX - sMaxWidth, 
                    marginY + (i - 1) * textFontSize * 1.1 - 2);
    }

    ctx.shadowColor = '#BBB';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 3;

    // Keep track of current height for stacked blocks (no negative values)

    var stackH = [];
    for (j = 1; j <= nbValues; j++)
      stackH [j] = ord0;


    // Loop through datasets, then through values, using the specified charts

    for (i = 1; i <= nbSets; i++) {

      // Histograms

      if (canvas [h].className.search ("blocks") >= 0) {

        ctx.fillStyle = hist.colors [i];
        ctx.strokeStyle = hist.colors [i];
        for (j = 1; j <= nbValues; j++) 
          ctx.fillRect (marginX + spaceXAxis + valSpW * (j - 1)
                        + (i - 1) * valSpW / (nbSets+1),
                        ord0, 
                        valSpW / (nbSets+1),
                        -hist.data [i][j] * valSpH / (yMax - yMin));
      }

      // Stacked histograms

      if (canvas [h].className.search ("stacked") >= 0) {

        var sOY = ctx.shadowOffsetY;  // No vertical shadows for stacked blocks
        ctx.shadowOffsetY = -1;
        ctx.fillStyle = hist.colors [i];
        ctx.strokeStyle = hist.colors [i];
        for (j = 1; j <= nbValues; j++) {
          ctx.fillRect (spaceXAxis + valSpW * (j - 1),
                        stackH [j], 
                        valSpW * .95,
                        -hist.data [i][j] * valSpH / (yMax - yMin));
           stackH [j] -= hist.data [i][j] * valSpH / (yMax - yMin);
        }
        ctx.shadowOffsetY = sOY;

      }

      // Dots

      if (canvas [h].className.search ("dots") >= 0) {

        for (j = 1; j <= nbValues; j++) {
          drawDot (ctx,
                   marginX + spaceXAxis + valSpW * (j - 1) 
                   + (valSpW - valSpW / nbSets) / 2,
                   ord0 - hist.data [i][j] * valSpH / range,
                   (nbValues > 20)
                   ? textFontSize / 5
                   : textFontSize / 3,
                   hist.colors [i]);
        }
      }

      // Straight lines

      if (canvas [h].className.search ("lines") >= 0) {

        ctx.strokeStyle = hist.colors [i];
        ctx.beginPath ();
        ctx.moveTo (marginX + spaceXAxis 
                    + (valSpW - valSpW / nbSets) / 2,
                    ord0 - hist.data [i][1] * valSpH / (yMax - yMin));
        for (j = 2; j <= nbValues; j++) {
          ctx.lineTo (marginX + spaceXAxis + valSpW * (j - 1) 
                      + (valSpW - valSpW / nbSets) / 2,
                      ord0 - hist.data [i][j] * valSpH / range);                        
        }
        ctx.stroke ();
      }

      // Bezier curves

      if (canvas [h].className.search ("bezier") >= 0) {

        if (nbValues >= 3) {
          var pt = [];              // Curve points [number] {X|Y}
          var cp = [];              // Control points [number] [1st|2nd] {X|Y}
          pt [1] = new Object (); 
          pt [1]['X'] = marginX + spaceXAxis 
                        + (valSpW - valSpW / nbSets) / 2;
          pt [1]['Y'] = ord0 - hist.data [i][1] * valSpH / (yMax - yMin);
  
          for (j = 2; j <= nbValues; j++) {
  
            pt [j] = new Object ();
            pt [j]['X'] = marginX + spaceXAxis + valSpW * (j - 1) 
                          + (valSpW - valSpW / nbSets) / 2;
            pt [j]['Y'] = ord0 - hist.data [i][j] * valSpH / range;
          }
  
          ctx.strokeStyle = hist.colors [i];
          ctx.beginPath ();
          ctx.moveTo (pt [1]['X'], pt [1]['Y']);
  
          cp [1] = [];
          cp [1][1] = new Object ();
  
          for (j = 2; j < nbValues; j++) {
  
            cp [j-1][2] = new Object ();
            cp [j-1][2]['X'] = (pt [j-1]['X'] + 3 * pt [j]['X']) / 4;
            cp [j-1][2]['Y'] = pt [j]['Y'] + (pt [j-1]['Y'] - pt [j+1]['Y'])/8;
            cp [j] = [];
            cp [j][1] = new Object ();
            cp [j][1]['X'] = (pt [j+1]['X'] + 3 * pt [j]['X']) / 4;
            cp [j][1]['Y'] = pt [j]['Y'] - (pt [j-1]['Y'] - pt [j+1]['Y']) / 8;
          }
          cp [1][1]['X'] = pt [1]['X'];
          cp [1][1]['Y'] = pt [1]['Y'];
          cp [nbValues-1][2] = new Object ();
          cp [nbValues-1][2]['X'] = pt [nbValues]['X'];
          cp [nbValues-1][2]['Y'] = pt [nbValues]['Y'];

          for (j = 2; j <= nbValues; j++) {

            ctx.bezierCurveTo (cp [j-1][1]['X'], cp [j-1][1]['Y'], 
                                   cp [j-1][2]['X'], cp [j-1][2]['Y'], 
                                   pt [j]['X'], pt [j]['Y']);
          }
          ctx.stroke ();
        }
      }
    }
  }  
}

