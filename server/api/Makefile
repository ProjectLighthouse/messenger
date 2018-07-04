# name of the docker hub repository
NAME=messenger
REVISION_FILE := $(PWD)/../../version.txt

include ../../deployment/Makefile

pre-build:
	@echo add steps if any, before docker build $(IMAGE_VERSION)
	@echo removing node_modules to save time on docker build
	rm -rf ./node_modules

post-build:
	@echo cleanup garbage, if any after docker build
