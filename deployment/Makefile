SHELL=/bin/bash
HELPER := $(shell dirname $(abspath $(lastword $(MAKEFILE_LIST))))/make_helper.sh $(REVISION_FILE)

REGISTRY_HOST=docker.io
ORGANIZATION=projectlighthouse

IMAGE_VERSION=$(shell source $(HELPER) ; getVersion)

IMAGE=$(REGISTRY_HOST)/$(ORGANIZATION)/$(NAME)

.PHONY: pre-build docker-build post-build build

build: pre-build docker-build post-build

pre-build:

docker-build:
	docker build -t $(IMAGE):$(IMAGE_VERSION) .
	echo docker tag $(IMAGE):$(IMAGE_VERSION) $(IMAGE):latest
	docker tag $(IMAGE):$(IMAGE_VERSION) $(IMAGE):latest

post-build:

push: pre-push docker-push post-push

push-dirty: build push

pre-push:

docker-push:
	docker push $(IMAGE):$(IMAGE_VERSION)
	docker push $(IMAGE):latest

post-push:
