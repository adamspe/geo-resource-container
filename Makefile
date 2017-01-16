TESTS = test/*.js
test:
	APP_CONTAINER_CONF=test/test_config.json mocha --preserve-symlinks --timeout 5000 $(TESTS)
docker:
	docker build -t adamspe/geo-resource-container .

.PHONY: test
