const express = require('express') 
const app = express()
const fs = require('fs')

let projects = JSON.parse(fs.readFileSync(__dirname + '/src/db.json'))

console.log('prod', process.env.NODE_ENV)

// if (process.env.NODE_ENV != 'production') {
//     app.use(
//         '/bundle.js',
//         require('http-proxy-middleware')({
//             target: 'http://localhost:8081/'
//         })
//         );
// } else {
//     app.use('/bundle.js', (req, res) => res.sendFile(`${__dirname}/bundle.js`))
// }   

app.use(express.static(__dirname + '/public'))
    
app.get('/api/projects.json', (req, res) => {
    res.json(projects)
})

app.listen(8080, () => console.log('server listening'))