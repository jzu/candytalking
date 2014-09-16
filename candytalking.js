/******************************************************************** 
 * candytalking.js
 *
 * Just Another Minimal Charts script
 *
 * Copyright (C) 2014 Jean Zundel <jzu@free.fr> 
 * MIT License: https://github.com/jzu/candytalking/blob/master/LICENSE
 * 
 * Draws blocks, lines, Bezier curves, and later dots and stacked blocks
 * from a json structure whose name matches a canvas id. Type of graph is
 * given by the class name: "blocks", "lines" or "bezier". All sizes, fonts,
 * etc. are based on the dimensions of the canvas. Executed automatically
 * by default when the page is loaded.
 * 
 * Example:

<!DOCTYPE html>
<html>
<head>
 <title>Some Candy Talking</title>
 <script src="candytalking.js"></script>
</head>
<body>
 <script>
   var canvas1 = {
         "title": "Blocks",
         "colors": [ "black", "cyan", "orange" ],
         "data": [
                   [ "Day", "01/08", "02/08", "03/08", "04/08" ],
                   [ "Var 1", 1, 2, 3, 4 ],
                   [ "Var 2", -10, 5, 1, 5 ]
                 ]
       };
   var canvas2 = {
         "title": "Lines",
         "colors": [ "black", "blue", "red" ],
         "data": [
                   [ "Day", "01/08", "02/08", "03/08", "04/08" ],
                   [ "Var 1", 1, 2, 3, 4 ],
                   [ "Var 2", -10, 5, 1, 5 ]
                 ]
       };
   var canvas3 = {
         "title": "Bezier",
         "colors": [ "black", "green", "magenta" ],
         "data": [
                   [ "Day", "01/08", "02/08", "03/08", "04/08" ],
                   [ "Var 1", 1, 2, 3, 4 ],
                   [ "Var 2", -10, 5, 1, 5 ]
                 ]
       };
 </script>
 <canvas id="canvas1" class="blocks" width="800" height="600">
  Canvas require a real browser
 </canvas>
 <canvas id="canvas2" class="lines" width="800" height="600">
  Canvas require a real browser
 </canvas>
 <canvas id="canvas3" class="bezier" width="800" height="600">
  Canvas require a real browser
 </canvas>
</body>
</html>

*/


/***************************************************************************
 * verticalLine()
 *
 * Draws a vertical line in light grey
 ***************************************************************************
  
function verticalLine () {
      ctx.strokeStyle = "#DDDDDD";
      ctx.beginPath ();
      ctx.moveTo (marginX + spaceXAxis + blockW * (i - 1),
                  marginY + marginTitle + blockH);
      ctx.lineTo (marginX + spaceXAxis + blockW * (i - 1),
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
 * Draws charts in all canvases of class "blocks", "lines and "bezier"
 * All dimensions in pixels except yMin, yMax
 *
 * You may want to use this function on demand, for instance if you already
 * have an onload() handler. In this case, just rename it, and call it
 * explicitely from elsewhere.
 ***************************************************************************/

window.onload = function () {

  var canvas = document.getElementsByTagName ("canvas");

  for (var h = 0; h < canvas.length; h++) {

    if ((canvas [h].className != "blocks") &&
        (canvas [h].className != "lines") &&
        (canvas [h].className != "bezier"))
      continue;

    var ctx = canvas [h].getContext ("2d");
    var histName = canvas [h].getAttribute ('id');
    var hist = eval (histName);
    var nbSets = hist.data.length - 1;
    var nbBlocks = hist.data [0].length - 1;

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

    var blockW = (canvas [h].width - marginX * 2 - spaceXAxis) / nbBlocks;
    var blockH = canvas [h].height - marginY * 2 - spaceYAxis - marginTitle;

    // Y-axis adjustment

    var yMax = 0;
    for (i = 1; i <= nbSets; i++)
      for (j = 1; j <= nbBlocks; j++)
        yMax = (hist.data [i][j] > yMax) 
               ? hist.data [i][j] 
               : yMax;
    yMax = (yMax > 0) 
           ? yMax 
           : 0;
    var yMin = 0;
    for (i = 1; i <= nbSets; i++)
      for (j = 1; j <= nbBlocks; j++)
        yMin = (hist.data [i][j] < yMin) 
               ? hist.data [i][j] 
               : yMin;
    yMin = (yMin < 0) 
           ? yMin 
           : 0;
  
    // Origin on the Y-axis

    var ord0 = marginY + marginTitle + blockH + yMin * blockH / (yMax - yMin);

    // Title

    ctx.font = (titleFontSize + "px Helvetica");
    ctx.fillText (hist.title, marginX * 2, marginY * 1.5);
    ctx.font = (textFontSize + "px Helvetica");

    // X-axis labels

    ctx.fillStyle = hist.colors [0];
    ctx.fillText (hist.data [0][0],
                  marginX ,
                  marginY + marginTitle + blockH + spaceYAxis);
    for (i = 1; i <= nbBlocks; i++) {
      ctx.fillText (hist.data [0][i],
                    marginX + spaceYAxis + blockW * (i - 1) 
                    + (blockW - blockW/nbSets + ctx.measureText (hist.data [0][i]).width) / 2,
                    marginY + marginTitle + blockH + spaceYAxis);
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
           marginY + marginTitle + blockH, 
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
               marginY + marginTitle + blockH + (yMin-i) * blockH / range,
               spaceXAxis);
        if (i == 0) {
          ctx.strokeStyle = "#CCC";
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

      ctx.fillStyle = hist.colors [i];
      ctx.strokeStyle = "#BBBBBB";      // Grey ring around the dot

      ctx.beginPath ();
      ctx.arc (canvas [h].width - marginX - sMaxWidth - textFontSize * 1.5,
               marginY + (i - 1) * textFontSize * 1.1 - textFontSize / 2,
               textFontSize * 3 / 7,
               0,
               Math.PI * 2);
      ctx.fill ();
      ctx.stroke ();
      ctx.closePath ();

      ctx.fillStyle = "black";
      ctx.fillText (hist.data [i][0], 
                    canvas [h].width - marginX - sMaxWidth, 
                    marginY + (i - 1) * textFontSize * 1.1 - 2);
    }

    ctx.shadowColor = '#666';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    switch (canvas [h].className) {

    case "blocks":

      for (i = 1; i <= nbSets; i++) {
        ctx.fillStyle = hist.colors [i];
        ctx.strokeStyle = hist.colors [i];
        for (j = 1; j <= nbBlocks; j++) 
          ctx.fillRect (marginX + spaceXAxis + blockW * (j - 1)
                        + (i - 1) * blockW / (nbSets+1),
                        ord0, 
                        blockW / (nbSets+1),
                        -hist.data [i][j] * blockH / (yMax - yMin));
      }
      break;                   // blocks

    case "lines":

      for (i = 1; i <= nbSets; i++) {
        ctx.strokeStyle = hist.colors [i];
        ctx.beginPath ();
        ctx.moveTo (marginX + spaceXAxis,
                    ord0 - hist.data [i][1] * blockH / (yMax - yMin));
        for (j = 2; j <= nbBlocks; j++) {
          ctx.lineTo (marginX + spaceXAxis + blockW * (j - 1),
                      ord0 - hist.data [i][j] * blockH / range);                        
        }
        ctx.stroke ();
      }
      break;                  // lines 

    case "bezier":

      if (nbBlocks >= 3) {
        for (i = 1; i <= nbSets; i++) {
  
          var pt = [];              // Curve points [number] {X|Y}
          var cp = [];              // Control points [number] [1st|2nd] {X|Y}
          pt [1] = new Object (); 
          pt [1]['X'] = marginX + spaceXAxis;
          pt [1]['Y'] = ord0 - hist.data [i][1] * blockH / (yMax - yMin);
  
          for (j = 2; j <= nbBlocks; j++) {
  
            pt [j] = new Object ();
            pt [j]['X'] = marginX + spaceXAxis + blockW * (j - 1);
            pt [j]['Y'] = ord0 - hist.data [i][j] * blockH / range;
          }
  
          ctx.strokeStyle = hist.colors [i];
          ctx.beginPath ();
          ctx.moveTo (pt [1]['X'], pt [1]['Y']);
  
          cp [1] = [];
          cp [1][1] = new Object ();
  
          for (j = 2; j < nbBlocks; j++) {
  
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
          cp [nbBlocks-1][2] = new Object ();
          cp [nbBlocks-1][2]['X'] = (pt [nbBlocks-1]['X'] 
                                     + 3 * cp [nbBlocks-1][1]['X']) / 4;
          cp [nbBlocks-1][2]['Y'] = (pt [nbBlocks]['Y'] 
                                     + 3 * cp [nbBlocks-1][1]['Y']) / 4;
        for (j = 2; j <= nbBlocks; j++) {

            ctx.bezierCurveTo (cp [j-1][1]['X'], cp [j-1][1]['Y'], 
                                   cp [j-1][2]['X'], cp [j-1][2]['Y'], 
                                   pt [j]['X'], pt [j]['Y']);
          }
          ctx.stroke ();
        }
      }
      break;                   // "bezier"
    }
  }  
}

