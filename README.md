# CelebGym-BackEnd
NodeJs, MongoDB, ExpressJS

To Install and start the server

1. npm install

2. node server.js

To Install Mongodb

1. Open a terminal window and type the following command to download the latest release:
curl http://downloads.mongodb.org/osx/mongodb-osx-x86_64-2.2.0.tgz > ~/Downloads/mongo.tgz

Note: You may need to adjust the version number. 2.2.0 is the latest production version at the time of this writing.

2. Extract the files from the mongo.tgz archive:
cd ~/Downloads
tar -zxvf mongo.tgz

3. Move the mongo folder to /usr/local (or another folder according to your personal preferences):
sudo mv -n mongodb-osx-x86_64-2.2.0/ /usr/local/

4. (Optional) Create a symbolic link to make it easier to access:
sudo ln -s /usr/local/mongodb-osx-x86_64-2.2.0 /usr/local/mongodb

5. Create a folder for MongoDB’s data and set the appropriate permissions:
sudo mkdir -p /data/db
sudo chown `id -u` /data/db

6. Start mongodb
cd /usr/local/mongodb
./bin/mongod

7. You can also open the MongoDB Interactive Shell in another terminal window to interact with your database using a command line interface.
cd /usr/local/mongodb
./bin/mongo