
# Wait for nginx to be ready (max 5 seconds)
for i in $(seq 1 5); do
  STATUS=$(docker exec enetspace-client curl -s -o /dev/null -w "%{http_code}" http://nginx:80/test)
  if [ "$STATUS" = "200" ]; then
    break
  fi
  echo "Waiting for nginx... ($i/5)"
  sleep 1
done

export STR=$(docker exec enetspace-client curl http://nginx:80/test)
export SUB='This is a test endpoint'
if [[ "$STR" != *"$SUB"* ]]; then
  echo 'Integration test failed!'
  echo 'App output = ' $STR
  exit 1 # integration test failed
fi

echo 'Integration test passed. The app returned: ' $STR