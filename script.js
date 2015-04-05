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
    //===========================
    var board;
    var rules;
    var whoseTurn = "black";	
    var undo_stack = new Array();
    var redo_stack = new Array();
    //===========================

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
            context = canvas_arrows.getContext("2d"),
            mouse_down = false,
            drag_image = null,
            img_mouse_offset_x = 0,
            img_mouse_offset_y = 0,
            this_checker = null,
            offset = $("#canvas").offset();


	   rules = new Rules(board);

       //=================================
       // drag checkers
       //=================================

       $(".wrapper").on("mousedown", "img", function(event) {
            var mouse_x = event.pageX - offset.left,
                mouse_y = event.pageY - offset.top,
                img_x = $(this).css("left"),
                img_y = $(this).css("top"),
                positions = find_position(mouse_x, mouse_y),
                row = positions[0],
                col = positions[1];

            if (board.getCheckerAt(row, col).color == whoseTurn) {
                img_mouse_offset_x = mouse_x - parseInt(img_x, 10);
                img_mouse_offset_y = mouse_y - parseInt(img_y, 10);
                drag_image = $(this); 
                this_checker = board.getCheckerAt(row, col)
                mouse_down = true;
            }

       })

        // prevent default drag event for the entire document
        $(document).mousemove(function(event) {
            event.preventDefault()
        })


        // the actual drag operation for the image
        $(".wrapper").mousemove(function(event) {
            var mouse_move_x = event.pageX - offset.left,
                mouse_move_y = event.pageY - offset.top,
                new_img_x = mouse_move_x - img_mouse_offset_x,
                new_img_y = mouse_move_y - img_mouse_offset_y;

            if(mouse_down){
                var width = parseInt(drag_image.css("width"),10),
                height = parseInt(drag_image.css("height"),10);

                drag_image.addClass("moving_checker") // make sure moving checker has highest z-index

                if(new_img_x + width <= 400 && new_img_y + height <= 400 && new_img_x >= 0 && new_img_y >=0) {
                    drag_image.css("left", new_img_x)
                    drag_image.css("top", new_img_y)
                }
            }
        })


        // mouseup operation. Drop checker 
       $(document).mouseup(function(event) {
            var mouse_x = event.pageX - offset.left,
                mouse_y = event.pageY - offset.top,
                positions = find_position(mouse_x, mouse_y),
                row = positions[0],
                col = positions[1],
                square_size = 400/board.size();

            mouse_down = false

            // mouse up when mouse is outside of board
            if(mouse_x < 0 || mouse_y < 0 || mouse_x > 400 || mouse_y > 400) {
                drag_image = null
                $(".wrapper img").remove();
                insert_all_checkers();
            } else if(drag_image != null) { // This is if user is indeed dragging an image
                
                // if not moving to same checker 
                if (row != this_checker.row && col != this_checker.col) {
                    var if_make_move = rules.makeMove(this_checker, directionOf(whoseTurn), directionOf(this_checker.color), row, col)
                    
                    // if this is a correct move. 
                    if (if_make_move != null) {
                        drag_image.removeClass("moving_checker")
                        drag_image.css("left", col*square_size+1)
                        drag_image.css("top", row*square_size)
                        drag_image = null

                        // toggle the turn color
                        if(this_checker.color == "red"){
                            toggleTurn("black")
                        } else {
                            toggleTurn("red")
                        }

                        // add to undo 
                        undo_stack.push([this_checker, if_make_move])
                        redo_stack.length = 0
                        check_undo_state()
                        check_redo_state()

                    } else {
                        drag_image = null
                        $(".wrapper img").remove();
                        insert_all_checkers();
                    } 

                } else {
                    drag_image = null
                    $(".wrapper img").remove();
                    insert_all_checkers();
                } 
                
            }
       })

        // check state of undo_stack to make sure button reflects state. 
        function check_undo_state() {
            if(undo_stack.length == 0 ) {
                document.getElementById("btnUndo").disabled = true;
            } else {
                document.getElementById("btnUndo").disabled = false;
            }
        }

        // check state of redo stack to make sure button reflects state. 
        function check_redo_state() {
            if(redo_stack.length == 0 ) {
                document.getElementById("btnRedo").disabled = true;
            } else {
                document.getElementById("btnRedo").disabled = false;
            }
        }

        // Find the coordinates to snap the checker to 
        function find_position(x, y) {
            var square_size = 400/board.size(),
                col = Math.floor(x/square_size),
                row = Math.floor(y/square_size)
            return [row, col]
        }

        //===========================================================

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

        // Buttons
        //===========================
        $("#btnNewGame").click(function(event) {
            $(".wrapper img").remove();
            board.prepareNewGame();
            whoseTurn = "black"
            toggleTurn(whoseTurn)
            clear_canvas()
            undo_stack.length = 0
            redo_stack.length = 0
        });

        $("#btnAutoMove").click(function(event) {
          var playerColor = whoseTurn,
            playerDirection = directionOf(playerColor),
            result = rules.makeRandomMove(playerColor, playerDirection);


          if (result != null) {
            var checker = new Checker(whoseTurn, result.made_king)
            checker.row = result.to_row
            checker.col = result.to_col
            undo_stack.push([checker, result])
            redo_stack.length = 0
            check_undo_state()
            check_redo_state()

            if (whoseTurn == "black") {
                whoseTurn = "red"
            } else {
                whoseTurn = "black"
            }
            toggleTurn(whoseTurn);
          }

        });

        $("#btnUndo").click(function(event) {
            var prev_move = undo_stack.pop()
            redo_stack.push(prev_move)
            check_undo_state()
            check_redo_state()
            board.moveTo(prev_move[0], prev_move[1].from_row, prev_move[1].from_col)

            // add checker if it was eaten 
            if(prev_move[1].remove.length !=0) {
                board.add(prev_move[1].remove[0], prev_move[1].remove[0].row, prev_move[1].remove[0].col)
            }

            // change the turn 
            if (whoseTurn == "black") {
                whoseTurn = "red"
            } else {
                whoseTurn = "black"
            }

            toggleTurn(whoseTurn);

            if(prev_move[1].made_king) { 
                var checker = new Checker(whoseTurn, !prev_move[0].isKing)
                checker.row = prev_move[0].row
                checker.col = prev_move[0].col
                
                board.remove(prev_move[0], prev_move[0].row, prev_move[0].col)
                board.add(checker, checker.row, checker.col)
            }

        })

        $("#btnRedo").click(function(event) {
            var prev_move = redo_stack.pop()
            undo_stack.push(prev_move)
            check_undo_state()
            check_redo_state()
            board.moveTo(prev_move[0], prev_move[1].to_row, prev_move[1].to_col)

            if(prev_move[1].remove.length !=0) {
                board.remove(prev_move[1].remove[0], prev_move[1].remove[0].row, prev_move[1].remove[0].col)
            }

            if (whoseTurn == "black") {
                whoseTurn = "red"
            } else {
                whoseTurn = "black"
            }
            toggleTurn(whoseTurn);
        })

        //===========================

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
                // up right
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY+square_size/3)
                context.stroke()
            } else if (toX == fromX) {
                // straight up
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY+square_size/3)
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY+square_size/3)
                context.stroke()
            } 
        } else if (toY > fromY){
            // down left
            if (toX < fromX) {
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY-square_size/3)
                context.stroke()
            } else if (toX > fromX) {   
                // down right
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY)
                context.moveTo(toX, toY)
                context.lineTo(toX, toY-square_size/3)
                context.stroke()
            } else if (toX == fromX) {
                // straight down 
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY-square_size/3)
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY-square_size/3)
                context.stroke()
            }
        } else {
            // straight left
            if (toX < fromX) {
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY-square_size/3)
                context.moveTo(toX, toY)
                context.lineTo(toX+square_size/3, toY+square_size/3)
                context.stroke()
            } else {
                // straight right
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY-square_size/3)
                context.moveTo(toX, toY)
                context.lineTo(toX-square_size/3, toY+square_size/3) 
                context.stroke()
            }
            
        }
        context.closePath()

    }

    function clear_canvas() {
        context.clearRect(0,0, canvas.width, canvas.height)
    }
    
    board.prepareNewGame();

    });