#!/bin/bash

# Check if PostgreSQL is already installed
if [ $(dpkg-query -W -f='${Status}' postgresql 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
    echo "PostgreSQL is already installed, updating..."
    sudo apt-get update
    sudo apt-get upgrade postgresql postgresql-contrib
else
    # Add the PostgreSQL repository and update package list
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    sudo apt-get update

    # Install PostgreSQL
    sudo apt-get install postgresql postgresql-contrib

    echo "PostgreSQL installation complete."
fi

# Start PostgreSQL server
sudo /etc/init.d/postgresql start

# Configure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
sudo echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo /etc/init.d/postgresql restart

# Create database
sudo -u postgres psql -c "CREATE DATABASE mydatabase;"

echo "PostgreSQL setup complete."
