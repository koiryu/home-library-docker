FROM node:14

WORKDIR /frontend

COPY package*.json ./
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
RUN npm audit fix


COPY . .

CMD ["npm", "start"]
