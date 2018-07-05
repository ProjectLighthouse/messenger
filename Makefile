SHELL=/bin/bash

REVISION_FILE := $(PWD)/version.txt
HELPER := $(shell dirname $(abspath $(lastword $(MAKEFILE_LIST))))/deployment/make_helper.sh $(REVISION_FILE)

VERSION=$(shell source $(HELPER) ; resolveLatest)
TAG=$(shell source $(HELPER); resolveVersionTag)

CURRENT_IMAGE_VERSION := $(shell source $(HELPER) ; getVersion)

@NODE_PRESENT := $(shell type "node"> /dev/null)

.PHONY: show-version

docker-build:
	cd server/api && $(MAKE) build

docker-push:
	cd server/api && $(MAKE) push

version.txt:
	@echo "latest=0.0.0" > $(REVISION_FILE)
	@echo [I]: $(REVISION_FILE) initialized
	@cat $(REVISION_FILE)

ensure-clean-state:
	@source $(HELPER) ; ! _hasGitChanges || (echo "[!] NOT READY: repo needs to be clean: git status -s ." >&2 && git status -s . && exit 1) ;

ensure-tagging-state:	TAG=$(shell source $(HELPER); resolveVersionTag $(VERSION))
ensure-tagging-state:
	@echo "Checking for tag $(TAG) existance via test -n \"$(git tag | grep \"^$tag\$\")\""
	@source $(HELPER) ; tagExists $(TAG) || (echo "[!]: version not tagged in git. make patch-release or make minor-release" >&2 && exit 1) ;
	@source $(HELPER) ; ! differsFromLatest $(TAG) || (echo "[!]: repo state differs from previous tag $(TAG). make patch-release or make minor-release." ; exit 1)

show-version: version.txt
	@source $(HELPER); getVersion
dump-jenkins-facts:
	@echo VERSION=$(VERSION)>jenkins_facts.txt
	@echo DOCKER_SUFFIX=$(CURRENT_IMAGE_VERSION)>>jenkins_facts.txt


gitflow-release-start: ensure-clean-state
	@source $(HELPER) ; gitflow_release_start
gitflow-release-finish: ensure-clean-state
	@source $(HELPER) ; gitflow_release_finish

docker-clean:
	@source $(HELPER) ; purgeImageByName projectlighthouse/messenger:latest

