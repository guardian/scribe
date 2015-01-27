case $CIRCLE_NODE_INDEX in
  0) BROWSER_NAME='firefox' BROWSER_VERSION='31' npm test ;;
  1) BROWSER_NAME='firefox' BROWSER_VERSION='32' npm test ;;
  2) BROWSER_NAME='firefox' BROWSER_VERSION='33' npm test ;;
  3) BROWSER_NAME='chrome'  BROWSER_VERSION='35' npm test ;;
  4) BROWSER_NAME='chrome'  BROWSER_VERSION='36' npm test ;;
  5) BROWSER_NAME='chrome'  BROWSER_VERSION='37' npm test ;;
  6) BROWSER_NAME='chrome'  BROWSER_VERSION='38' npm test ;;
esac
