//This script extracts parameters from the URL
//from jquery-howto.blogspot.com

    $.extend({
        getUrlVars : function() {
            var vars = [], hash;
            var hashes = window.location.href.slice(
                    window.location.href.indexOf('?') + 1).split('&');
            for ( var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar : function(name) {
            return $.getUrlVars()[name];
        }
    });

    var DEFAULT_BOARD_SIZE = 8;

    //data model
    var board;
    var rules;
    var whoseTurn = "black";	

    var directionOf = function(color) {
      if (color == "black") {
        return -1;
      }
      return 1;
    }

    // Fill in this function to toggle the display for whose turn
    // The color parameter should be either "black" or "red"
    var toggleTurn = function(color) {
	// Your code here
        if (color == "black") {
            $("#turn").removeClass("red_turn").addClass("black_turn")
            $("#turn").html("Black Turn")
            whoseTurn = "black"
        } else {
            $("#turn").removeClass("black_turn").addClass("red_turn")
            $("#turn").html("Red Turn")
            whoseTurn = "red"
        }
    }

    // This allows the Javascript code inside this block to only run when the page
    // has finished loading in the browser.
    $(document).ready(function() {

        if ($.getUrlVar('size') && $.getUrlVar('size') >= 6) {
            board = new Board($.getUrlVar('size'));
        } else {
            board = new Board(DEFAULT_BOARD_SIZE);
        }

    var canvas_arrows = document.getElementById("arrows"),
        context = canvas_arrows.getContext("2d");

	rules = new Rules(board);


     	// Your code here
        // Add checkers to the board for a new game. 
        //start_checker_board()
        function start_checker_board() {
            for (var row=0; row<board.size; row++) {
                for (var col=0; col<board.size; col++) {
                    if (row == 0) {
                        if (col%2 == 1){
                            board.add(Checker("red", false), row, col)
                        }
                    } else if (row == 1) {
                        if (col%2 ==0) {
                            board.add(Checker("red", false), row, col)
                        }
                    } else if (row == board.size-2 || row == board.size-1) {
                        if (row%2 == 0) {
                            if (col%2 ==1) {
                                board.add(Checker("black", false), row, col)
                            }
                        } else {
                            if (col%2 ==0) {
                                board.add(Checker("black", false), row, col)
                            }
                        }
                    } 
                }
            }
        }

        board.addEventListener('add',function (e) {
    		// Your code here
            var row = e.details.row,
                col = e.details.col,
                color = e.details.checker.color,
                isKing = e.details.checker.isKing

            insert_checker(row,col,color,isKing)
    	},true);

    	board.addEventListener('move',function (e) {
    		// Your code here
            var fromRow = e.details.fromRow,
                fromCol = e.details.fromCol,
                toRow = e.details.toRow,
                toCol = e.details.toCol,
                size = board.size(),
                square_size = 400/size

            $(".wrapper img").remove();
            clear_canvas()
            insert_all_checkers();
            draw_arrow(fromRow*square_size+square_size/2, fromCol*square_size+square_size/2, toRow*square_size+square_size/2, toCol*square_size+square_size/2)
    	},true);

        board.addEventListener('remove', function (e) {
            $(".wrapper img").remove();
            insert_all_checkers();
        }, true);

        board.addEventListener('promote',function (e) {
    		// Your code here
            // Since board is cleared every turn, addEventListener takes care of this
    	},true);

        
        $("#btnNewGame").click(function(evt) {
            $(".wrapper img").remove();
            board.prepareNewGame();
            whoseTurn = "black"
            toggleTurn(whoseTurn)
            clear_canvas()
        });

        $("#btnAutoMove").click(function(evt) {
          var playerColor = whoseTurn;
          var playerDirection = directionOf(playerColor);
          var result = rules.makeRandomMove(playerColor, playerDirection);

          if (result != null) {
            if (whoseTurn == "black") {
                whoseTurn = "red"
            } else {
                whoseTurn = "black"
            }
            toggleTurn(whoseTurn);
          }
        });

        board.prepareNewGame();

    // draws the checker board
    window.onload = draw;
    function draw() {
        var canvas = document.getElementById("canvas");
        var context2d = canvas.getContext("2d");

        var size = board.size();
        var square_size = 400/size;
        for (var r=0; r<size; r++) {
            for (var c=0; c<size; c++) {
                var x = c*square_size;
                var y = r*square_size;
                if (r%2 == 0) {
                    if (c%2 == 0) {
                        context2d.fillStyle = "white";
                    } else {
                        context2d.fillStyle = "gray";
                    }
                } else {
                    if (c%2 !==  0) {
                        context2d.fillStyle = "white";
                    } else {
                        context2d.fillStyle = "gray";
                    }
                }
                context2d.fillRect(x,y,square_size, square_size);
            }
        }
    }

    // draws a checker on the board
    function insert_checker(row, col, color, isKing) {
        var size = board.size(),
            square_size = 400/size,
            top = row*square_size,
            left = col*square_size + 1,
            img = $(document.createElement("img"))

        img.addClass("images");
        if (color == "red") {
            if (isKing) {
                img.attr("src", "graphics/red-king.png")
            } else {
                img.attr("src", "graphics/red-piece.png") 
            }  
        } else {
            if (isKing) {
                img.attr("src", "graphics/black-king.png")
            } else {
                img.attr("src", "graphics/black-piece.png")
            }
        }

        img.css({
            "left": left,
            "top": top,
            "height": square_size,
            "width": square_size
        })

        $(".wrapper").append(img)
    }

    // insert all checkers in the board
    function insert_all_checkers() {
        var checkers = board.getAllCheckers()
        for (var i=0; i<checkers.length; i++) {
            var checker = checkers[i],
                row = checker.row,
                col = checker.col,
                color = checker.color,
                isKing = checker.isKing

            insert_checker(row,col, color, isKing)
        }
    }

    // draws and arrow based on coordinates passed in
    function draw_arrow(fromY, fromX, toY, toX) {
        //var canvas = document.getElementById("arrows"),
        //    context = canvas.getContext("2d")
        var size = board.size(),
            square_size = 400/size

        context.strokeStyle = "yellow"
        context.lineWidth = 4

        context.beginPath()
        
        // main line
        context.moveTo(fromX, fromY)
        context.lineTo(toX, toY)
        context.lineCap="round"

        console.log(fromY, toY)
        console.log(fromX, toX)
        console.log(toY<fromY)

        // arrow head
        // up arrow
        if (toY < fromY) {
            //up left
            if (toX < fromX) {
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3,toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY+square_size/3)
                context.stroke()
            } else if (toX>fromX) {
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY+square_size/3)
                context.stroke()
            } else {
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY+square_size/3)
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY+square_size/3)
                context.stroke()
            }
        } else {
            // down left
            if (toX < fromX) {
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY-square_size/3)
                context.stroke()
            } else if (toX > fromX) {
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY-square_size/3)
                context.stroke()
            } else {
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY-square_size/3)
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY-square_size/3)
                context.stroke()
            }
        }
        context.closePath()

    }

    function clear_canvas() {
        context.clearRect(0,0, canvas.width, canvas.height)
    }

    });