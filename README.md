# Applytics
Ferramenta analytics para apps desenvolvida para conclusão de curso de bcc.

![Dashboard screenshot](https://raw.githubusercontent.com/gm1357/Applytics/master/images/applytics1.PNG)

![Dashboard screenshot](https://raw.githubusercontent.com/gm1357/Applytics/master/images/applytics2.PNG)

![Dashboard screenshot](https://raw.githubusercontent.com/gm1357/Applytics/master/images/applytics3.PNG)

## Construido com:
- Node.js
- Express
- MongoDB

## Bibliotecas utilizadas:
- Express-load
- Express-validator
- Express-session
- Body-parser
- Cookie-parser
- Connect-flash
- Handlebars
- Hbs
- Method-override
- Bootstrap
- jQuery
- Popper.js
- Serve-favicon
- Bcrypt
- Passport
- Morgan
- Mongoose
- Request
- Moment
- Highcharts
- Tags-input
- DataTables
- Intro.Js
- JQuery lightSlider
- Dev:
    - Mocha
    - Supertest
    - Webpack
    - Webpack-cli
    - Style-loader
    - CSS-loader
    - Sass-loader
    - Exports-loader
    - Node-sass
    - Autoprefixer
    - Mongodb-dataset-generator

## Instalação
- `npm install`
- Definir variável de ambiente `MONGODB_URI` para o endereço do banco mongo
- Definir variável de ambiente `PORT` para a porta a ser ouvida
- `mongorestore --db applytics .\Data_mock\dump\applytics\` para recuperar dados iniciais no banco mongo
- `npm start`