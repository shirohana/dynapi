# One command aT the time
MAKEFLAGS = --jobs=1

# Fix color output until TravisCI fixes https://github.com/travis-ci/travis-ci/issues/7967
export FORCE_COLOR = true

.PHONY: build watch clean lint test test-only test-ci-coverage bootstrap clean-all

build: clean clean-lib
	./node_modules/.bin/gulp build

watch: clean clean-lib
	BABEL_ENV=development ./node_modules/.bin/gulp watch

lint:
	./node_modules/.bin/eslint '*.js' 'scripts/**/*.js' 'packages/*/src/**/*.js' 'packages/*/test/*.test.js' --format=codeframe

fix:
	./node_modules/.bin/eslint '*.js' 'scripts/**/*.js' 'packages/*/src/**/*.js' 'packages/*/test/*.test.js' --fix --format=codeframe

test-only:
	BABEL_ENV=test ./scripts/test.sh

test: lint test-only

test-ci-coverage:
	@set -e
	BABEL_COVERAGE=true BABEL_ENV=test make bootstrap
	BABEL_ENV=test ./node_modules/.bin/nyc ./scripts/test.sh
	./node_modules/.bin/nyc report --reporter=json
	./node_modules/.bin/codecov -f coverage/coverage-final.json

bootstrap: clean
	yarn --ignore-engines
	./node_modules/.bin/lerna bootstrap -- --ignore-engines
	make build

clean:
	rm -rf coverage
	rm -rf .nyc_output

clean-lib:
	rm -rf packages/*/lib

clean-all:
	rm -rf node_modules
	rm -rf package-lock.json
	make clean
