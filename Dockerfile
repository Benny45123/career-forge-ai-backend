# importing the node image from docker hub
FROM node:20-alpine

#setting the working directory in the container to /app
WORKDIR /app

# copying the package.json and package-lock.json files from the current directory to the working directory in the container
COPY package*.json ./

#installing dependencies in the container, omitting dev dependencies
RUN npm install --omit=dev

#copying the application code from curr dir to container
COPY . .

#exposing the port 

EXPOSE 3120

#starting the application using npm start command

CMD [ "npm", "start" ]

