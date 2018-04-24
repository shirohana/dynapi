# One command aT the time
MAKEFLAGS = --jobs=1
TEST_FILES = test plugins/*/test

# Fix color output until TravisCI fixes https://github.com/travis-ci/travis-ci/issues/7967
export FORCE_COLOR = true

.PHONY: build watch clean lint test test-only test-ci-coverage bootstrap clean-all

build: clean
	./node_modules/.bin/rollup -c build/rollup.config.js

watch: clean
	./node_modules/.bin/rollup -c build/rollup.config.js -w

lint:
	./node_modules/.bin/eslint 'lib/**/*.js' 'test/**/*.test.js' 'plugins/*/test/*.test.js' --format=codeframe
	./node_modules/.bin/standard 'plugins/**/*.js'

test-only:
	./node_modules/.bin/ava --verbose $(TEST_FILES)

test: lint test-only

test-ci-coverage:
	@set -e
	BABEL_ENV=test make bootstrap
	./node_modules/.bin/nyc ./node_modules/.bin/ava --verbose $(TEST_FILES)
	./node_modules/.bin/nyc report --reporter=json
	./node_modules/.bin/codecov -f coverage/coverage-final.json

bootstrap: clean
	yarn --ignore-engines
	make build

clean:
	rm -rf dist
	rm -rf coverage
	rm -rf .nyc_output

clean-all:
	rm -rf node_modules
	rm -rf package-lock.json
	make clean
