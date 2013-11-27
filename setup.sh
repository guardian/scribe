npm install
bower install

# Download the selenium JAR
SELENIUM_VERSION=2.37.0
mkdir -p vendor
wget -O vendor/selenium-server-standalone-$SELENIUM_VERSION.jar \
  https://selenium.googlecode.com/files/selenium-server-standalone-$SELENIUM_VERSION.jar
