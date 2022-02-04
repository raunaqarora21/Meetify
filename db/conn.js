const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://raunaq21:k91nszOUBFnre4rq@cluster0.fjxyt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
  
    console.log('Connected to Database');
}
).catch(() => {
    console.log('Connection Failed');
}
);


