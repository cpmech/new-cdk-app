#!/bin/bash

set -e

# options
USE_NPM=${2:-"true"}

# check required tools
if [ "$USE_NPM" = "true" ]; then
    echo "npm --version"
    npm --version
else
    echo "yarn --version"
    yarn --version
fi
echo "npm-check-updates --version"
npm-check-updates --version

# constants
TEMPLATE="`dirname \"$0\"`"

# fix 'sad' command in macOS
sad() { 
  sed "$@"
}
unamestr=`uname`
if [[ "$unamestr" == 'Darwin' ]]; then
    sad() { 
        gsed "$@"
    }
    echo "Remember to:"
    echo "brew install gnu-sed"
fi

# pkg commands
pkg_i() {
    if [ "$USE_NPM" = "true" ]; then
        npm install
    else
        yarn
    fi
}
pkg_add() {
    if [ "$USE_NPM" = "true" ]; then
        npm install $@
    else
        yarn add $@
    fi
}
pkg_add_dev() {
    if [ "$USE_NPM" = "true" ]; then
        npm install -D $@
    else
        yarn add -D $@
    fi
}
pkg_test() {
    if [ "$USE_NPM" = "true" ]; then
        npm run test
    else
        yarn test
    fi
}

# define message function
message(){
    echo
    echo ">>> $1 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    echo
}

# check input
if [[ $# == 0 ]]; then
    echo
    echo "usage:"
    echo "       ./`basename $0` myapp"
    echo
    exit 1
fi
PROJ=$1
ARRAY=(${PROJ//-/ })
APP=${ARRAY[0]}    

# create project
message "🚀 create project"
mkdir $PROJ
cd $PROJ
git init

# copy files
message "📜 copy files"
cp -av $TEMPLATE/.eslintignore .
cp -av $TEMPLATE/.eslintrc.js .
cp -av $TEMPLATE/.gitignore .
cp -av $TEMPLATE/.prettierrc .
cp -av $TEMPLATE/jest.amplify.js .
cp -av $TEMPLATE/jest.config-integ.js .
cp -av $TEMPLATE/jest.config.js .
cp -av $TEMPLATE/package.json .
cp -av $TEMPLATE/README.md .
cp -av $TEMPLATE/rollup.config-lambda.js .
cp -av $TEMPLATE/tsconfig.json .
cp -rvf $TEMPLATE/.vscode .
cp -rvf $TEMPLATE/az-cdk .
cp -rvf $TEMPLATE/layers .
cp -rvf $TEMPLATE/src .
cp -rvf $TEMPLATE/zscripts .

# fix cdkapp name
message "📝 fix cdkapp name"
sed -i "s/cdkapp/${APP}/g" package.json
sed -i "s/cdkapp/${APP}/g" az-cdk/envars.ts
sed -i "s/CDK_/${APP^^}_/g" az-cdk/envars.ts
sed -i "s/cdkapp/${APP}/g" src/__integ__/cognito.integ.ts
sed -i "s/CDK_/${APP^^}_/g" src/__integ__/cognito.integ.ts
sed -i "s/CDK_/${APP^^}_/g" src/__integ__/emails.integ.ts
sed -i "s/cdkapp/${APP}/g" src/lambda/cognitoPostConfirm.ts

# update dependencies
message "🆕 update dependencies"
npm-check-updates -u
pkg_i

# run tests
message "🔥 run tests"
CI=true pkg_test

# git commit changes
message "👍 git commit changes"
git add .eslintignore \
    .eslintrc.js \
    .gitignore \
    .prettierrc \
    jest.amplify.js \
    jest.config-integ.js \
    jest.config.js \
    package.json \
    README.md \
    rollup.config-lambda.js \
    tsconfig.json \
    .vscode \
    az-cdk \
    layers \
    src \
    zscripts
if [ "$USE_NPM" = "true" ]; then
    git add package-lock.json
else
    git add yarn.lock 
fi
git commit -m "Init"

# print success
message "🎉 success!"
