case $CIRCLE_NODE_INDEX in
  #0) BROWSER_NAME='firefox' BROWSER_VERSION='31' PLATFORM='Windows XP' npm test ;;
  #1) BROWSER_NAME='firefox' BROWSER_VERSION='32' PLATFORM='Windows XP' npm test ;;
  1) BROWSER_NAME='firefox' BROWSER_VERSION='33' PLATFORM='Windows XP' npm test ;;
  #3) BROWSER_NAME='chrome'  BROWSER_VERSION='35' PLATFORM='Windows XP' npm test ;;
  #4) BROWSER_NAME='chrome'  BROWSER_VERSION='36' PLATFORM='Windows XP' npm test ;;
  2) BROWSER_NAME='chrome'  BROWSER_VERSION='37' PLATFORM='Windows XP' npm test ;;
  3) BROWSER_NAME='chrome'  BROWSER_VERSION='38' PLATFORM='Windows XP' npm test ;;
esac
