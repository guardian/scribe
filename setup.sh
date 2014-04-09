npm install
bower install

# Download the selenium JAR
SELENIUM_VERSION=2.41.0
mkdir -p vendor
wget -O vendor/selenium-server-standalone-$SELENIUM_VERSION.jar \
  https://selenium-release.storage.googleapis.com/2.41/selenium-server-standalone-$SELENIUM_VERSION.jar
