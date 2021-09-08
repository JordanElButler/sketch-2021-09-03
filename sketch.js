

function setup() {
    createCanvas(500,500);
    pegs = 15;
    steps = 15;
    
    peg_lines = pegs - 1;
    step_lines = steps - 1;
    
    
      
    vertical_margin = 50;
    vertical_space = height - vertical_margin*2;
    horizontal_margin = 50;
    horizontal_space = width - horizontal_margin*2;
    
    peg_spacing = horizontal_space / peg_lines;
    step_spacing = vertical_space / step_lines;
    
    node_positions = []
    for (let i = 0; i < pegs; i++) {
      let tmp = []
      let x = horizontal_margin + i*peg_spacing
  
      for (let j = 0; j < steps; j++) {
        let y =  vertical_margin + j * step_spacing
  
        tmp.push({x: x, y: y});
      }
      node_positions.push(tmp);
    }
    
    // my dumb strategy: add every line, collect edges part of a violated node, delete an edge, so get closer at least
    my_pegs = [];
    for (let i = 0; i < peg_lines; i++) {
      let tmp = [];
      for (let j = 0; j < steps; j++) {
        if (j == 0 || j == steps - 1) tmp.push(false);
        else tmp.push({start: {i: i, j: j}, end: {i: i+1, j: j}}) // horizontal line lives has start and end, node index
      }
      my_pegs.push(tmp);
    }
    while (true) {
      loop_flag = false;
      bad_edges = [];
      for (let i = 0; i < my_pegs.length; i++) {
        for (let j = 0; j < my_pegs[i].length; j++) {
          if (!my_pegs[i][j]) continue;
          let mline = my_pegs[i][j];
          if ((my_pegs[i-1] && my_pegs[i-1][j])|| (my_pegs[i+1] && my_pegs[i+1][j])) {
            bad_edges.push({i: i, j: j, line: mline});
            loop_flag = true;
          }
        }
      }
      // bad edges collected, find one to delete,
      if (loop_flag) {
  
        let index = floor(random() * bad_edges.length);
        let badLine = bad_edges[index];
        console.log(badLine)
        my_pegs[badLine.i][badLine.j] = false;
      
      }
      if (!loop_flag) break;
    }
    
    players = [];
    
    player_closest = {i: 0, j: 0};
  }
  
  function draw() {
    background(0);
    stroke(255);
    
    // vertical lines
    stroke(255,0,0);
    for (let i = 0; i < pegs; i++) {
      for (let j = 0; j < step_lines; j++) {
        let pos = node_positions[i][j]
        
        line(pos.x, pos.y, pos.x, pos.y + step_spacing);
      }
    }
    // hori lines
    stroke(0, 255,0);
    for (let i = 0; i < peg_lines; i++) {
      for (let j = 0; j < steps; j++) {
        let pos = node_positions[i][j]
        if (my_pegs[i][j])
        line(pos.x, pos.y, pos.x + peg_spacing, pos.y);
      }
    }
    // draw nodes
    for (let i = 0; i < pegs; i++) {
      for (let j = 0; j < steps; j++) {
        let pos = node_positions[i][j]
        fill(255);
        arc(pos.x, pos.y, 2,2, 0, TAU, OPEN)
      }
    }
    
    // draw player closest
    fill(255);
    let pos = node_positions[player_closest.i][player_closest.j];
    arc(pos.x, pos.y, 3, 3, 0, TAU, OPEN);
    
    
    
    for (let i = 0; i < players.length; i++) {
         // if player
      let {player_last_node, player_dest_node, player_progress, player_line} = players[i];
      if (player_last_node) {
        let last_node_pos = node_positions[player_last_node.i][player_last_node.j];
  
  
  
        fill(200);
        stroke(255);
        arc(last_node_pos.x, last_node_pos.y, 6, 6, 0, TAU, OPEN);
  
        if (player_dest_node) {
          let dest_node_pos = node_positions[player_dest_node.i][player_dest_node.j];
          fill(100)
          arc(dest_node_pos.x, dest_node_pos.y, 6, 6, 0, TAU, OPEN);
        }
  
  
  
        if (player_dest_node) {
          let dest_node_pos = node_positions[player_dest_node.i][player_dest_node.j];
          fill(0,0,255);
          player_posx = last_node_pos.x + (dest_node_pos.x - last_node_pos.x) * player_progress;
          player_posy = last_node_pos.y + (dest_node_pos.y - last_node_pos.y) * player_progress;
          arc(player_posx, player_posy, 8, 8, 0, TAU, OPEN);
        }
  
  
  
        players[i].player_progress += 0.08;
        if (players[i].player_progress >= 1) {
          players[i].player_progress = 0;
          findNewNodes(players[i]);
        }
      }
  
    }
   
  }
  findNewNodes = (player) => {
    // time to choose a new destination node
    if (player.player_dest_node) player.player_last_node = player.player_dest_node;
    
    if (player.player_last_node.j == steps - 1) {
      // we reached the bottom
      player.player_dest_node = null;
      return;
    }
    
    
    if (!player.player_line) {
      for (let i = 0; i < my_pegs.length; i++) {
        for (let j = 0; j < my_pegs[i].length; j++) {
          if (!my_pegs[i][j]) continue;
          let line = my_pegs[i][j];
          if (line.start.i == player.player_last_node.i && line.start.j == player.player_last_node.j) {
            player.player_line = line;
            player.player_dest_node = {i: line.end.i, j: line.end.j};
            return;
          }
          else if (line.end.i == player.player_last_node.i && line.end.j == player.player_last_node.j) {
              player.player_line = line;
              player.player_dest_node = {i: line.start.i, j: line.start.j};
              return;
          }
        }
      }
    }
    player.player_line = null;
    player.player_dest_node = {i: player.player_last_node.i, j: player.player_last_node.j+1};
  }
  mouseMoved = () => {
    let x = mouseX;
    let y = mouseY;
    
    li = -1;
    lj = -1;
    least_dist = 999999;
    for (let i = 0; i < node_positions.length; i++) {
      for (let j = 0; j < node_positions[0].length; j++) {
        let pos = node_positions[i][j];
        let dist2 = (x-pos.x)*(x-pos.x) + (y-pos.y)*(y-pos.y);
        if (dist2 < least_dist) {
          least_dist = dist2;
          li = i;
          lj = j;
        }
      }
    }
    player_closest = {i: li, j: lj};
  }
  mouseClicked = () => {
    
    players.push({
      player_last_node: {i: player_closest.i, j: player_closest.j},
      player_dest_node: {i: player_closest.i, j: player_closest.j + 1},
      player_progress: 0,
      player_line: null
    });
    
  }