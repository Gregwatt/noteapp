FROM node

# Build the frontend
WORKDIR /usr/src/react
COPY ./notes-frontend/package*.json .
RUN npm install
COPY ./notes-frontend/ .
RUN npm run build
RUN rm -rf ./node_modules 

# Get the backend ready to serve
WORKDIR /usr/src/app
COPY ./express-backend/package*.json .
RUN npm install
COPY ./express-backend/ .
RUN npm run build

# Copy frontend files to the backend
RUN cp -R /usr/src/react/build ./pub_html/
RUN rm -rf /usr/src/react

# Finishing port expose and container command
EXPOSE 3000
CMD [ "npm", "run", "start" ]