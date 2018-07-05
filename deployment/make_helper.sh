VERSION_FILE=${1-DockerVersion.txt}
# =================================================
# BELOW THIS LINE STARTS UNCHANGABLE PART OF SCRIPT
# =================================================

# =====================================
# optional param $1 - use custom tag
# if undefined, parse from DockerVersion.txt

#=========================================================

function purgeImageByName() {
  if [ -z "$1" ]
  then
    echo "Pass image name as param 1"
    return 1
  fi

  IMAGE_ID=$(docker images -q $1)

  if [ -z "$IMAGE_ID" ]
  then
    echo "No Image named $1 found"
    return 0
  fi

  echo docker images | grep ${IMAGE_ID} | awk '{print $1 ":" $2}' | xargs docker rmi
  docker images | grep ${IMAGE_ID} | awk '{print $1 ":" $2}' | xargs docker rmi
}

# version can be tagged v0.0.1 rather than 0.0.1
function resolveVersionTag() {
	echo "$(baseTag)$1"
}

#=======================================
# if you want versioning v0.0.1, add here
function baseTag() {
	echo ""
}

# ===============================
# returns current project version
function resolveLatest() {
	awk -F= '/^latest=/{print $2}' ${VERSION_FILE}
}

# =====================================
# updates latest to new revision
function updateLatest() {
	if [ -n "$1" ] ; then
		sed -i.bak -e "s/^latest=.*/latest=$1/g" ${VERSION_FILE}
		rm -f ${VERSION_FILE}.bak
	else
		echo "[!] Error: missing new revision parameter " >&2
		return 1
	fi
}


# =====================================
# Queries git for existance of tag
function tagExists() {
	tag=${1:-$(resolveLatest)}
	test -n "$tag" && test -n "$(git tag | grep "^$tag\$")"
}

function differsFromLatest() {
  tag=$(resolveLatest)
  headtag=$(git tag -l --points-at HEAD)
  if tagExists $tag; then
    if [ "$tag" == "$headtag" ]; then
      #[I] tag $tag exists, and matches tag for the commit
      return 1
    else
      #[I] Codebase differs: $tag does not match commit.
      return 0
    fi
  else
    # [I] No tag found for $tag
    return 0
  fi
}

function getVersion() {
	result=$(resolveLatest)

	if differsFromLatest; then
		result="$result-$(git rev-parse --short HEAD)"
	fi

	if _hasGitChanges ; then
		result="$result-raw"
	fi
	echo $result
}


# ================================================================
# True if repo was modified (-s . - to check relatively to folder)
function _hasGitChanges() {
	test -n "$(git status -s)"
}


# ===================================================
# gitflow release helpers https://github.com/Voronenko/gitflow-release
# ===================================================

function bump_version(){
  NEW_VERSION=$1
  if [ -z "$NEW_VERSION" ]
  then
    echo "Pass version as param 1"
    return 1
  fi
	sed -i '' -e "s/\(^latest=\).*/\1${NEW_VERSION}/" ${VERSION_FILE}
}

# =====================================
# 0.0.1 => 0.0.2
function _bump_patch_version_dry(){
  if [ -z "$1" ]
  then
    echo "Pass version as param 1"
    return 1
  fi

  declare -a part=( ${1//\./ } )
  declare    new
  declare -i carry=1

  for (( CNTR=${#part[@]}-1; CNTR>=0; CNTR-=1 )); do
    len=${#part[CNTR]}
    new=$((part[CNTR]+carry))
    [ ${#new} -gt $len ] && carry=1 || carry=0
    [ $CNTR -gt 0 ] && part[CNTR]=${new: -len} || part[CNTR]=${new}
  done
  new="${part[*]}"
  echo -e "${new// /.}"
}

# =====================================
# 0.0.1 => 0.1.0

function _bump_minor_version_dry(){
  if [ -z "$1" ]
  then
    echo "Pass version as param 1"
    return 1
  fi

  declare -a part=( ${1//\./ } )
  declare    new
  declare -i carry=1

  for (( CNTR=${#part[@]}-2; CNTR>=0; CNTR-=1 )); do
    len=${#part[CNTR]}
    new=$((part[CNTR]+carry))
    [ ${#new} -gt $len ] && carry=1 || carry=0
    [ $CNTR -gt 0 ] && part[CNTR]=${new: -len} || part[CNTR]=${new}
  done
  part[2]=0 #zerorify minor version
  new="${part[*]}"
  echo -e "${new// /.}"
}


# =GITFLOW SUPPORT==================================

GITFLOW_BRANCH_MASTER=stable
GITFLOW_BRANCH_DEVELOP=master

function gitflow_get_version(){
  #  cat version.tag
  resolveLatest
}

function gitflow_next_release_version(){
  _bump_patch_version_dry $1
}

function gitflow_next_hotfix_version(){
  _bump_minor_version_dry $1
}

function gitflow_branches_init(){
  #Initialize gitflow
  # git flow init -f -d
  git config  gitflow.branch.master $GITFLOW_BRANCH_MASTER
  git config  gitflow.branch.develop $GITFLOW_BRANCH_DEVELOP
  git config  gitflow.prefix.feature feature/
  git config  gitflow.prefix.bugfix bugfix/
  git config  gitflow.prefix.release release/
  git config  gitflow.prefix.hotfix hotfix/
  git config  gitflow.prefix.support support/
  git config  gitflow.prefix.versiontag ""
  git config  gitflow.path.hooks .git/hooks

}

function gitflow_release_start(){
  if [ ! -d "./.git" ];then cd $(git rev-parse --show-cdup); fi;
  VERSION=$1
  if [ -z $1 ]
  then
    VERSION=$(gitflow_get_version)
  fi

  set -e

  echo "initializing gitflow unattended"


  echo "setting branches override if any"
  gitflow_branches_init

  echo "Initialized gitflow with $GITFLOW_BRANCH_MASTER for production releases and $GITFLOW_BRANCH_DEVELOP for next release"

  echo "ensuring you are on latest $GITFLOW_BRANCH_DEVELOP and $GITFLOW_BRANCH_MASTER"
  git checkout $GITFLOW_BRANCH_DEVELOP
  git pull origin $GITFLOW_BRANCH_DEVELOP
  git checkout -

  git checkout $GITFLOW_BRANCH_MASTER
  git pull origin $GITFLOW_BRANCH_MASTER
  git checkout $GITFLOW_BRANCH_DEVELOP

  echo starting release

  git flow release start $VERSION

  echo bump released version to server
  git push

  git checkout $GITFLOW_BRANCH_DEVELOP

  echo switching $GITFLOW_BRANCH_DEVELOP to next release version
  echo "getting gitflow_next_release_version $VERSION"
  # COMMENT LINES BELOW IF YOU BUMP VERSION AT THE END
  NEXTVERSION=$(gitflow_next_release_version $VERSION)
  echo "bump_version $NEXTVERSION"
  $(bump_version $NEXTVERSION)

  git commit -am "Bumps version to $NEXTVERSION"
  git push origin $GITFLOW_BRANCH_DEVELOP

  # return to release version for further operations
  git checkout -
}

function gitflow_release_finish(){

  if [ ! -d "./.git" ];then cd $(git rev-parse --show-cdup); fi;

  # PREVENT INTERACTIVE MERGE MESSAGE PROMPT AT A FINAL STEP
  GIT_MERGE_AUTOEDIT=no
  export GIT_MERGE_AUTOEDIT

  GITBRANCHFULL=`git rev-parse --abbrev-ref HEAD`
  GITBRANCH=`echo "$GITBRANCHFULL" | cut -d "/" -f 1`
  RELEASETAG=`echo "$GITBRANCHFULL" | cut -d "/" -f 2`

  echo $GITBRANCH
  echo $RELEASETAG

  if [ $GITBRANCH != "release" ] ; then
    echo "Release can be finished only on release branch!"
    return 1
  fi

  if [ -z $RELEASETAG ]
  then
    echo We expect gitflow to be followed, make sure release branch called release/x.x.x
    exit 1
  fi

  #Initialize gitflow

  gitflow_branches_init

  echo "Initialized gitflow with $GITFLOW_BRANCH_MASTER for production releases and $GITFLOW_BRANCH_DEVELOP for next release"

  # ensure you are on latest develop  & master and return back
  git checkout $GITFLOW_BRANCH_DEVELOP
  git pull origin $GITFLOW_BRANCH_DEVELOP
  git checkout -

  git checkout $GITFLOW_BRANCH_MASTER
  git pull origin $GITFLOW_BRANCH_MASTER
  git checkout -

  # UNCOMMENT THESE TWO LINES IF YOU BUMP VERSION AT THE END
  #./bump-version.sh $RELEASETAG
  #git commit -am "Bumps version to $RELEASETAG"

  git flow release finish -m "release-$RELEASETAG" $RELEASETAG

  git push origin $GITFLOW_BRANCH_DEVELOP && git push origin $GITFLOW_BRANCH_MASTER --tags
}


function gitflow_hotfix_start(){
  if [ ! -d "./.git" ];then cd $(git rev-parse --show-cdup); fi;

  if [ -z $1 ]
  then
    echo "Please provide uniqie hotfix name. Jira ticket number is a good candidate"
    exit 1
  else
    HOTFIX_NAME=$1
  fi

  if [ -z $2 ]
  then
    VERSION=$(gitflow_get_version)
    NEXTVERSION=$(gitflow_next_hotfix_version $VERSION)
    $(bump_version $NEXTVERSION)
  else
    NEXTVERSION=$2
  fi

  set -e

  #Initialize gitflow

  gitflow_branches_init

  echo "Initialized gitflow with $GITFLOW_BRANCH_MASTER for production releases and $GITFLOW_BRANCH_DEVELOP for next release"

  # ensure you are on latest develop  & master
  git checkout $GITFLOW_BRANCH_DEVELOP
  git pull origin $GITFLOW_BRANCH_DEVELOP
  git checkout -

  git checkout $GITFLOW_BRANCH_MASTER
  git pull origin $GITFLOW_BRANCH_MASTER
  git checkout $GITFLOW_BRANCH_DEVELOP

  git flow hotfix start $HOTFIX_NAME

  git commit -am "Bumps version to $NEXTVERSION"

  # bump hotfix version to server
  git push
}

function gitflow_hotfix_finish(){
  if [ ! -d "./.git" ];then cd $(git rev-parse --show-cdup); fi;

  # PREVENT INTERACTIVE MERGE MESSAGE PROMPT AT A FINAL STEP
  GIT_MERGE_AUTOEDIT=no
  export GIT_MERGE_AUTOEDIT

  GITBRANCHFULL=`git rev-parse --abbrev-ref HEAD`
  GITBRANCH=`echo "$GITBRANCHFULL" | cut -d "/" -f 1`
  HOTFIXTAG=`echo "$GITBRANCHFULL" | cut -d "/" -f 2`

  echo $GITBRANCH
  echo $HOTFIXTAG

  if [ $GITBRANCH != "hotfix" ] ; then
     echo "Hotfix can be finished only on a hotfix branch!"
     return 1
  fi

  if [ -z $HOTFIXTAG ]
  then
    echo We expect gitflow to be followed, make sure hotfix branch called hotfix/x.x.x.x
    exit 1
  fi

  #Initialize gitflow
 
  gitflow_branches_init

  echo "Initialized gitflow with $GITFLOW_BRANCH_MASTER for production releases and $GITFLOW_BRANCH_DEVELOP for next release"

  # ensure you are on latest develop  & master and return back
  git checkout $GITFLOW_BRANCH_DEVELOP
  git pull origin $GITFLOW_BRANCH_DEVELOP
  git checkout -

  git checkout $GITFLOW_BRANCH_MASTER
  git pull origin $GITFLOW_BRANCH_MASTER
  git checkout -

  git flow hotfix finish -m "hotfix-$HOTFIXTAG" $HOTFIXTAG

  git push origin $GITFLOW_BRANCH_DEVELOP && git push origin $GITFLOW_BRANCH_MASTER --tags
}
