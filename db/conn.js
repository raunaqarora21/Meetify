const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/TeamsClone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
  
    console.log('Connected to Database');
}
).catch(() => {
    console.log('Connection Failed');
}
);


