var express = require('express');
var mysql = require('mysql');
var app = express();

app.set('port', process.env.PORT);

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');

    next();
});

var con;

function handleDisconnect() {
  con = mysql.createConnection(process.env.DATABASE_URL);

  con.connect(function(err) {
    if(err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 1000);
      response.status(503).send('Internal server error');
    }
  });

  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

// Return the main feed's JSON
app.get('/api/feed', function(request, response){
    con.query('SELECT * FROM content WHERE type="img" AND unlocked=1 ORDER BY date', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Return the GIFs JSON
app.get('/api/gifs', function(request, response){
    con.query('SELECT * FROM content WHERE type="gif" AND unlocked=1 ORDER BY date', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Return the BoukiTv JSON
app.get('/api/boukiTv', function(request, response){
    con.query('SELECT * FROM content WHERE type="video" AND unlocked=1 ORDER BY date', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Return the SoundBox JSON
app.get('/api/soundBox', function(request, response){
    con.query('SELECT * FROM content WHERE type="audio" AND unlocked=1 ORDER BY date', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});


// Return the BoukiBoutique JSON
app.get('/api/boukiBoutique/:type', function(request, response){
    con.query('SELECT * FROM content WHERE unlocked=0 AND type="'+request.params.type+'"', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Return the User JSON
app.get('/api/user', function(request, response){
    con.query('SELECT * FROM users WHERE id=1', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Set the user's money
app.get('/api/user/setMoney/:value', function(request, response){
    con.query('UPDATE users SET money='+request.params.value+' WHERE id=1', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Set a content unlocked
app.get('/api/content/setUnlocked/:id', function(request, response){
    con.query('UPDATE content SET unlocked=1 WHERE id='+request.params.id, function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });
});

// Give 1G to the user each day
app.get('/api/user/connectAward', function(request, response){
    con.query('UPDATE users SET money=money+1 WHERE id=1 AND last_connect<DATE(NOW())', function(error, results){
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
          con.query('UPDATE users SET last_connect = NOW() WHERE id=1', function(error, results){
              if ( error ){
                  response.status(400).send('Error in database operation');
              }
          });
          response.send(results);
        }
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
  handleDisconnect();
});
