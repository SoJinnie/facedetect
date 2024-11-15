const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
    
    users: [
        {
            id: '123',
            name: 'John',
            password: '$2b$13$Eyl1ZWrJOK9ZZvqvJLZt.eMDw1JoDgR2yuC6OQOKalhfG.5XDKHTa',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Doe',
            password: '$2b$13$vHMEpxV4cEi1WhuzWsXX3e3IPXLlHbx8tOelO8d3KG.cPc/kr/mjW',
            email: 'doe@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '',
            hash: '',
            email: ''
        }
    ]
}
/*  bcrypt.hash('password1', 13, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password1:', hash);
});

bcrypt.hash('password2', 13, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password2:', hash);
}); */


app.get('/', (req, res) => {
    res.send(database.users);
})
app.post('/signin', (req, res) => {
/*     const { email, password } = req.body;
    const user = database.users.find(user => user.email === email);

    if (user && user.password === password) {
        /* res.json('success');
        res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    } */
        const { email, password } = req.body;
        const user = database.users.find(user => user.email === email);
    
        if (user) {
            // Use bcrypt.compare to check if the password matches the stored hash
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    res.status(500).json('error checking password');
                } else if (isMatch) {
                    res.json('success');
                } else {
                    res.status(400).json('error logging in');
                }
            });
        } else {
            res.status(400).json('error logging in');
        }
    });


let nextId = 125;
app.post('/register', async (req, res) => {
        const { email, password, name } = req.body;
        const hash = await bcrypt.hash(password, 13);

        database.users.push({
            id: nextId.toString(),
            name: name,
            email: email,
            password: hash,
            entries: 0,
            joined: new Date()
        });  
        res.json(database.users[database.users.length - 1]);
        nextId++;
});

app.get('/profile/:id', (req, res) => {
 const {id} =req.params;
 let found = false;
 database.users.forEach(user => {
    if (user.id === id) {
        found = true;
       return res.json(user);
    }
})
if (!found) {
    res.status(404).json('User not found');
}
})

app.put('/image', (req, res) => {
    const {id} =req.body;
    let found = false;
    database.users.forEach(user => {
       if (user.id === id) {
           found = true;
           user.entries++
          return res.json(user.entries);
       }
   })
   if (!found) {
    res.status(404).json('User not found');
}
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});